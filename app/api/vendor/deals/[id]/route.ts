import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PATCH /api/vendor/deals/[id] — Update deal ────────────────────────

const updateDealSchema = z.object({
  discount_percentage: z.number().min(1).max(99).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const { id } = await params;

    // Parse body
    const body = await request.json();
    const parsed = updateDealSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parsed.data;

    // Get deal
    const { data: deal } = await supabaseAdmin
      .from('deals')
      .select('*, products!inner(price)')
      .eq('id', id)
      .eq('vendor_id', vendor.id)
      .single();

    if (!deal) {
      return apiError('Deal not found', 404, 'DEAL_NOT_FOUND');
    }

    // Recalculate deal price if discount changed
    const updateData: Record<string, unknown> = { ...updates };

    if (updates.discount_percentage) {
      const product = deal.products as unknown as { price: string };
      const originalPrice = parseFloat(product.price);
      const dealPrice = originalPrice * (1 - updates.discount_percentage / 100);
      updateData.deal_price = dealPrice.toString();
    }

    // Update deal
    const { data: updated, error } = await supabaseAdmin
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .eq('vendor_id', vendor.id)
      .select()
      .single();

    if (error) {
      console.error('[Vendor Deal PATCH] Update error:', error);
      return apiError('Failed to update deal', 500);
    }

    return apiSuccess(updated, 'Deal updated successfully');
  } catch (err) {
    console.error('[Vendor Deal PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/vendor/deals/[id] — Delete deal ─────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('vendor_id', vendor.id);

    if (error) {
      console.error('[Vendor Deal DELETE] Delete error:', error);
      return apiError('Failed to delete deal', 500);
    }

    return apiSuccess(null, 'Deal deleted successfully');
  } catch (err) {
    console.error('[Vendor Deal DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
