import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PUT /api/categories/[id] — Admin updates category ───────────────

const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .trim()
    .optional(),
  description: z.string().max(1000).optional(),
  image_url: z.string().url().optional(),
  commission_rate: z.number().min(0).max(100).optional().nullable(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;

    // Parse body
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Check if category exists
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return apiError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Check if slug is taken by another category
    if (data.slug) {
      const { data: slugExists } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return apiError('Category slug already exists', 400, 'SLUG_EXISTS');
      }
    }

    // Update category
    const { data: updated, error } = await supabaseAdmin
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Categories PUT] Update error:', error);
      return apiError('Failed to update category', 500);
    }

    return apiSuccess(updated, 'Category updated successfully');
  } catch (err) {
    console.error('[Categories PUT] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/categories/[id] — Admin deletes category ────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    // Check if category has products
    const { count } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return apiError(
        `Cannot delete category with ${count} product(s). Reassign products first.`,
        400,
        'CATEGORY_HAS_PRODUCTS'
      );
    }

    // Delete category
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

    if (error) {
      console.error('[Categories DELETE] Delete error:', error);
      return apiError('Failed to delete category', 500);
    }

    return apiSuccess(null, 'Category deleted successfully');
  } catch (err) {
    console.error('[Categories DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
