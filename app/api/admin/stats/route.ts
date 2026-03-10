import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';

// ── GET /api/admin/stats — Dashboard KPIs ───────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    // Get counts
    const [
      { count: totalUsers },
      { count: totalVendors },
      { count: activeVendors },
      { count: pendingVendors },
      { count: totalProducts },
      { count: activeProducts },
      { count: totalOrders },
      { count: pendingOrders },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    // Get revenue stats
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status, created_at');

    let totalRevenue = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;

    orders?.forEach((order) => {
      const amount = parseFloat(order.total_amount || '0');
      totalRevenue += amount;
      if (order.status === 'completed') {
        completedRevenue += amount;
      } else if (['pending', 'processing', 'shipped'].includes(order.status)) {
        pendingRevenue += amount;
      }
    });

    // Get commission earnings
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('commission_amount, item_status');

    let totalCommission = 0;
    let earnedCommission = 0;

    orderItems?.forEach((item) => {
      const commission = parseFloat(item.commission_amount || '0');
      totalCommission += commission;
      if (item.item_status === 'completed') {
        earnedCommission += commission;
      }
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsersLast30 } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: newOrdersLast30 } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get pending withdrawals
    const { count: pendingWithdrawals } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return apiSuccess({
      users: {
        total: totalUsers || 0,
        newLast30Days: newUsersLast30 || 0,
      },
      vendors: {
        total: totalVendors || 0,
        active: activeVendors || 0,
        pending: pendingVendors || 0,
      },
      products: {
        total: totalProducts || 0,
        active: activeProducts || 0,
      },
      orders: {
        total: totalOrders || 0,
        pending: pendingOrders || 0,
        newLast30Days: newOrdersLast30 || 0,
      },
      revenue: {
        total: totalRevenue,
        completed: completedRevenue,
        pending: pendingRevenue,
      },
      commission: {
        total: totalCommission,
        earned: earnedCommission,
        pending: totalCommission - earnedCommission,
      },
      withdrawals: {
        pending: pendingWithdrawals,
      },
    });
  } catch (err) {
    console.error('[Admin Stats GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
