import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PATCH /api/admin/vendors/[id]/featured — Toggle featured status ──

const updateFeaturedSchema = z.object({
  is_featured: z.boolean(),
});

export async function PATCH(
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
    const parsed = updateFeaturedSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { is_featured } = parsed.data;

    // Get vendor
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id, store_name')
      .eq('id', id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Update featured status
    const { data: updated, error } = await supabaseAdmin
      .from('vendors')
      .update({ 
        is_featured,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Vendor Featured PATCH] Update error:', error);
      return apiError('Failed to update featured status', 500);
    }

    return apiSuccess(
      updated, 
      `Store ${is_featured ? 'added to' : 'removed from'} featured`
    );
  } catch (err) {
    console.error('[Admin Vendor Featured PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
