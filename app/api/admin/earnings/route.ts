import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';

// ── GET /api/admin/earnings — Platform earnings dashboard ───────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, today, week, month, year

    let startDate: Date | null = null;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get commission logs from Supabase
    let commissionQuery = supabaseAdmin
      .from('commission_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      commissionQuery = commissionQuery.gte('created_at', startDate.toISOString());
    }

    const { data: commissionLogs } = await commissionQuery;

    let totalCommission = 0;
    const byVendor: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    commissionLogs?.forEach((log) => {
      const amount = parseFloat(log.commission_amount || '0');
      totalCommission += amount;

      byVendor[log.vendor_id] = (byVendor[log.vendor_id] || 0) + amount;
      if (log.category_id) {
        byCategory[log.category_id] = (byCategory[log.category_id] || 0) + amount;
      }
    });

    // Get order items for pending commissions
    let orderItemsQuery = supabaseAdmin
      .from('order_items')
      .select('commission_amount, item_status, vendor_id');

    if (startDate) {
      orderItemsQuery = orderItemsQuery.gte('created_at', startDate.toISOString());
    }

    const { data: orderItems } = await orderItemsQuery;

    let pendingCommission = 0;
    let earnedCommission = 0;

    orderItems?.forEach((item) => {
      const commission = parseFloat(item.commission_amount || '0');
      if (item.item_status === 'completed') {
        earnedCommission += commission;
      } else if (['pending', 'processing', 'shipped'].includes(item.item_status)) {
        pendingCommission += commission;
      }
    });

    // Get top vendors by commission
    const topVendors = Object.entries(byVendor)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const enrichedTopVendors = await Promise.all(
      topVendors.map(async ([vendorId, commission]) => {
        const { data: vendor } = await supabaseAdmin
          .from('vendors')
          .select('id, store_name, logo_url')
          .eq('id', vendorId)
          .single();

        return {
          vendor,
          commission,
        };
      })
    );

    // Get earnings snapshots for trend
    let snapshotsQuery = supabaseAdmin
      .from('earnings_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(30);

    if (startDate) {
      snapshotsQuery = snapshotsQuery.gte('snapshot_date', startDate.toISOString());
    }

    const { data: snapshots } = await snapshotsQuery;

    return apiSuccess({
      summary: {
        totalCommission: earnedCommission,
        pendingCommission,
        totalEarnings: earnedCommission,
      },
      topVendors: enrichedTopVendors,
      snapshots: snapshots?.reverse() || [], // Oldest to newest for charts
      period,
    });
  } catch (err) {
    console.error('[Admin Earnings GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
