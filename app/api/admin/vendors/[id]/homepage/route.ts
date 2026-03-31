import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PATCH /api/admin/vendors/[id]/homepage — Toggle homepage visibility ──

const updateHomepageSchema = z.object({
  show_on_homepage: z.boolean(),
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
    const parsed = updateHomepageSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { show_on_homepage } = parsed.data;

    // Get vendor
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id, store_name, is_featured')
      .eq('id', id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Can only show on homepage if vendor is featured
    if (show_on_homepage && !vendor.is_featured) {
      return apiError('Store must be featured before showing on homepage', 400, 'NOT_FEATURED');
    }

    // Update homepage visibility
    const { data: updated, error } = await supabaseAdmin
      .from('vendors')
      .update({ 
        show_on_homepage,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Vendor Homepage PATCH] Update error:', error);
      return apiError('Failed to update homepage visibility', 500);
    }

    return apiSuccess(
      updated, 
      `Store ${show_on_homepage ? 'shown on' : 'hidden from'} homepage`
    );
  } catch (err) {
    console.error('[Admin Vendor Homepage PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
