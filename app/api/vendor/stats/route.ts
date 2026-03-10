import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';

// ── GET /api/vendor/stats — Get vendor dashboard stats ──────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Get total revenue from completed orders
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', vendor.id)
      .in('status', ['completed', 'delivered']);

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    // Get active products count
    const { count: activeProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'active');

    // Get total orders count
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id);

    // Store views (placeholder - would need a views tracking table)
    const storeViews = 0;

    return apiSuccess({
      totalRevenue: Math.round(totalRevenue),
      activeProducts: activeProducts || 0,
      totalOrders: totalOrders || 0,
      storeViews,
    });
  } catch (err) {
    console.error('[Vendor Stats GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
