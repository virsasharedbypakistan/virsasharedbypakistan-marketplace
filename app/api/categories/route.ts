import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/categories — Public category list ──────────────────────

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, description, image_url, commission_rate, display_order, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('[Categories GET] Query error:', error);
      return apiError('Failed to fetch categories', 500);
    }

    // Get product count for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active');

        return {
          ...category,
          product_count: count || 0,
        };
      })
    );

    return apiSuccess(categoriesWithCounts);
  } catch (err) {
    console.error('[Categories GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/categories — Admin creates category ───────────────────

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name required').max(100).trim(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim(),
  description: z.string().max(1000).optional(),
  image_url: z.string().url().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Check if slug already exists
    const { data: existingSlug } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', data.slug)
      .single();

    if (existingSlug) {
      return apiError('Category slug already exists', 400, 'SLUG_EXISTS');
    }

    // Insert category
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image_url || null,
        commission_rate: data.commission_rate || null,
        display_order: data.display_order,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('[Categories POST] Insert error:', error);
      return apiError('Failed to create category', 500);
    }

    return apiSuccess(category, 'Category created successfully', 201);
  } catch (err) {
    console.error('[Categories POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
