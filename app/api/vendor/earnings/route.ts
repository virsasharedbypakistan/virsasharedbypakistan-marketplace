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
        orders!inner(order_number, created_at)
      `
      )
      .eq('vendor_id', vendor.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Format transactions for frontend
    const transactions = recentOrders?.map((item: any) => ({
      id: item.orders.order_number,
      description: 'COD Order Sale',
      type: 'credit',
      status: item.item_status === 'completed' ? 'Settled' : 'Pending',
      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: parseFloat(item.vendor_earning || '0'),
    })) || [];

    // Calculate earnings breakdown
    const totalSales = completedEarnings + pendingEarnings;
    const shippingFees = totalSales * 0.12; // Estimate 12% shipping
    const otherFees = totalSales * 0.03; // Estimate 3% other
    const productSales = totalSales - shippingFees - otherFees;
    const commission = totalSales * 0.05; // 5% platform commission

    return apiSuccess({
      total_earnings: parseFloat(vendorData?.total_earnings || '0'),
      pending_settlement: pendingEarnings,
      settled_this_month: completedEarnings,
      transactions,
      breakdown: {
        product_sales: productSales,
        shipping_fees: shippingFees,
        other: otherFees,
        commission,
        net_earnings: totalSales - commission,
      },
    });
  } catch (err) {
    console.error('[Vendor Earnings GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
