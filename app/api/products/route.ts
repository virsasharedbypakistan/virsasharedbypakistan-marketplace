import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  apiSuccess,
  apiError,
  requireRole,
  getPagination,
  paginationMeta,
  getVendorForUser,
} from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/products — Public product list with filters ────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);

    const categoryId = searchParams.get('category_id');
    const vendorId = searchParams.get('vendor_id');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minRating = searchParams.get('min_rating');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const onSale = searchParams.get('on_sale');

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select(
        `id, name, slug, short_description, price, sale_price, stock, images, thumbnail_url,
         status, is_featured, average_rating, total_reviews, total_sold, created_at,
         vendors!inner(id, store_name, logo_url, average_rating),
         categories(id, name, slug)`,
        { count: 'exact' }
      )
      .eq('status', 'active');

    // Filters
    if (categoryId) query = query.eq('category_id', categoryId);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (minRating) query = query.gte('average_rating', parseFloat(minRating));
    if (featured === 'true') query = query.eq('is_featured', true);
    if (onSale === 'true') query = query.not('sale_price', 'is', null);

    // Full-text search
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,short_description.ilike.%${search}%`
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) {
      console.error('[Products GET] Query error:', error);
      return apiError('Failed to fetch products', 500);
    }

    return apiSuccess(products || [], undefined, 200);
  } catch (err) {
    console.error('[Products GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/products — Vendor creates a product ───────────────────

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name required').max(255).trim(),
  description: z.string().max(10000).optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  sale_price: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  category_id: z.string().uuid('Invalid category ID'),
  images: z.array(z.string().url()).default([]),
  thumbnail_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  status: z.enum(['draft', 'active']).default('active'),
  is_featured: z.boolean().default(false),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 250);
}

export async function POST(request: NextRequest) {
  try {
    // Must be an approved vendor
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Get vendor record
    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }
    if (vendor.status !== 'approved') {
      return apiError('Your vendor account is not yet approved', 403, 'VENDOR_NOT_APPROVED');
    }

    // Parse & validate body
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Generate unique slug
    let slug = generateSlug(data.name);
    const { data: existingSlug } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Verify category exists
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', data.category_id)
      .single();

    if (!category) {
      return apiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Insert product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        vendor_id: vendor.id,
        category_id: data.category_id,
        name: data.name,
        slug,
        description: data.description || null,
        short_description: data.short_description || null,
        price: data.price,
        sale_price: data.sale_price || null,
        stock: data.stock,
        images: data.images,
        thumbnail_url: data.thumbnail_url || data.images[0] || null,
        tags: data.tags || null,
        specifications: data.specifications || null,
        status: data.status,
        is_featured: data.is_featured,
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error('[Products POST] Insert error:', error);
      return apiError('Failed to create product', 500);
    }

    return apiSuccess(
      { product_id: product.id, slug: product.slug },
      'Product created successfully',
      201
    );
  } catch (err) {
    console.error('[Products POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
