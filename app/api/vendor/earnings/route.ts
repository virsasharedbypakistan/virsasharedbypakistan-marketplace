import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';

// ── GET /api/vendor/earnings — Vendor earnings dashboard ────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Get current balance and total earnings from vendor record
    const { data: vendorData } = await supabaseAdmin
      .from('vendors')
      .select('balance, total_earnings')
      .eq('id', vendor.id)
      .single();

    // Get earnings breakdown by status
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('item_status, vendor_earning')
      .eq('vendor_id', vendor.id);

    let pendingEarnings = 0;
    let completedEarnings = 0;

    orderItems?.forEach((item) => {
      const earning = parseFloat(item.vendor_earning || '0');
      if (item.item_status === 'completed') {
        completedEarnings += earning;
      } else if (['pending', 'processing', 'shipped'].includes(item.item_status)) {
        pendingEarnings += earning;
      }
    });

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentOrders } = await supabaseAdmin
      .from('order_items')
      .select(
        `
        id, vendor_earning, item_status, created_at,
        orders!inner(order_number)
      `
      )
      .eq('vendor_id', vendor.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    return apiSuccess({
      currentBalance: parseFloat(vendorData?.balance || '0'),
      totalEarnings: parseFloat(vendorData?.total_earnings || '0'),
      pendingEarnings,
      completedEarnings,
      recentTransactions: recentOrders || [],
    });
  } catch (err) {
    console.error('[Vendor Earnings GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
