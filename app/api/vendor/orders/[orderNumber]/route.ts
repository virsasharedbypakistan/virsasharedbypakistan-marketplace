import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiError, apiSuccess, getVendorForUser, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';

const updateStatusSchema = z.object({
  status: z.string().min(1),
});

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'new') return 'pending';
  if (normalized === 'delivered') return 'completed';
  return normalized;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { orderNumber } = await params;
    if (!orderNumber) {
      return apiError('Order number required', 400, 'MISSING_ORDER_NUMBER');
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const nextStatus = normalizeStatus(parsed.data.status);

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (!order) {
      return apiError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const updates: Record<string, string> = {
      item_status: nextStatus,
    };

    if (nextStatus === 'shipped') {
      updates.shipped_at = new Date().toISOString();
    }
    if (nextStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin
      .from('order_items')
      .update(updates)
      .eq('order_id', order.id)
      .eq('vendor_id', vendor.id)
      .select('id, item_status');

    if (error) {
      console.error('[Vendor Orders PATCH] Update error:', error);
      return apiError('Failed to update order status', 500);
    }

    if (!updated || updated.length === 0) {
      return apiError('Order not found for vendor', 404, 'ORDER_ITEM_NOT_FOUND');
    }

    return apiSuccess({ updated: updated.length, status: nextStatus });
  } catch (err) {
    console.error('[Vendor Orders PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
