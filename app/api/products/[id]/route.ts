import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  apiSuccess,
  apiError,
  requireRole,
  getVendorForUser,
} from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/products/[id] — Public product detail ──────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(
        `
        id, name, slug, description, short_description, price, sale_price, stock,
        images, thumbnail_url, tags, specifications, status, is_featured,
        average_rating, total_reviews, total_sold, created_at, updated_at,
        vendors!inner(id, store_name, store_slug, logo_url, banner_url, average_rating, total_reviews, status),
        categories(id, name, slug, image_url)
      `
      )
      .eq('id', id)
      .eq('status', 'active')
      .eq('vendors.status', 'approved')
      .single();

    if (error || !product) {
      return apiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return apiSuccess(product);
  } catch (err) {
    console.error('[Product GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PUT /api/products/[id] — Vendor updates product ─────────────────

const updateProductSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  description: z.string().max(10000).optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  category_id: z.string().uuid().optional(),
  images: z.array(z.string().url()).optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  status: z.enum(['draft', 'active', 'out_of_stock']).optional(),
  is_featured: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Must be vendor or admin
    const authResult = await requireRole('vendor', 'admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Get product
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id, status')
      .eq('id', id)
      .single();

    if (!product) {
      return apiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check ownership (vendors can only edit their own products)
    if (user.role === 'vendor') {
      const vendor = await getVendorForUser(user.id);
      if (!vendor || vendor.id !== product.vendor_id) {
        return apiError('You do not own this product', 403, 'FORBIDDEN');
      }
    }

    // Parse body
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // If category changed, verify it exists
    if (data.category_id) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', data.category_id)
        .single();

      if (!category) {
        return apiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Update product
    const { data: updated, error } = await supabaseAdmin
      .from('products')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Product PUT] Update error:', error);
      return apiError('Failed to update product', 500);
    }

    return apiSuccess(updated, 'Product updated successfully');
  } catch (err) {
    console.error('[Product PUT] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/products/[id] — Soft delete product ─────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Must be vendor or admin
    const authResult = await requireRole('vendor', 'admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Get product
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id')
      .eq('id', id)
      .single();

    if (!product) {
      return apiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check ownership
    if (user.role === 'vendor') {
      const vendor = await getVendorForUser(user.id);
      if (!vendor || vendor.id !== product.vendor_id) {
        return apiError('You do not own this product', 403, 'FORBIDDEN');
      }
    }

    // Soft delete (set status to deleted)
    const { error } = await supabaseAdmin
      .from('products')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Product DELETE] Error:', error);
      return apiError('Failed to delete product', 500);
    }

    return apiSuccess(null, 'Product deleted successfully');
  } catch (err) {
    console.error('[Product DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
