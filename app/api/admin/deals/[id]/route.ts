import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PUT/PATCH /api/admin/deals/[id] — Update deal ────────────────────

const updateDealSchema = z.object({
  discount_percentage: z.number().min(1).max(99).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
});

async function handleUpdate(
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
    const parsed = updateDealSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parsed.data;

    // Validate dates if provided
    if (updates.start_date && updates.end_date) {
      if (new Date(updates.end_date) <= new Date(updates.start_date)) {
        return apiError('End date must be after start date', 400, 'INVALID_DATES');
      }
    }

    // Get deal + product price for recalculation
    const { data: deal } = await supabaseAdmin
      .from('deals')
      .select('*, products!inner(price)')
      .eq('id', id)
      .single();

    if (!deal) {
      return apiError('Deal not found', 404, 'DEAL_NOT_FOUND');
    }

    // Recalculate deal price if discount changed
    const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };

    if (updates.discount_percentage !== undefined) {
      const product = deal.products as unknown as { price: string };
      const originalPrice = parseFloat(product.price);
      const dealPrice = originalPrice * (1 - updates.discount_percentage / 100);
      updateData.deal_price = dealPrice;
      updateData.original_price = originalPrice;
    }

    // Update deal
    const { data: updated, error } = await supabaseAdmin
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        products!inner(id, name, thumbnail_url),
        vendors!inner(id, store_name)
      `)
      .single();

    if (error) {
      console.error('[Admin Deal UPDATE] Update error:', error);
      return apiError('Failed to update deal', 500);
    }

    return apiSuccess(updated, 'Deal updated successfully');
  } catch (err) {
    console.error('[Admin Deal UPDATE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

export const PUT = handleUpdate;
export const PATCH = handleUpdate;

// ── DELETE /api/admin/deals/[id] — Delete deal ──────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { id } = await params;

    const { error } = await supabaseAdmin.from('deals').delete().eq('id', id);

    if (error) {
      console.error('[Admin Deal DELETE] Delete error:', error);
      return apiError('Failed to delete deal', 500);
    }

    return apiSuccess(null, 'Deal deleted successfully');
  } catch (err) {
    console.error('[Admin Deal DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
