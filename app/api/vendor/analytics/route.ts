import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';

// ── GET /api/vendor/analytics — Vendor analytics data ────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Get last 7 days of revenue data
    const days = 7;
    const dailyRevenue = [];
    const labels = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get completed orders for this day
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('vendor_earning')
        .eq('vendor_id', vendor.id)
        .eq('item_status', 'completed')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      const dayRevenue = orderItems?.reduce((sum, item) => {
        return sum + parseFloat(item.vendor_earning || '0');
      }, 0) || 0;

      dailyRevenue.push(dayRevenue);
      
      // Format label (e.g., "Mon", "Tue")
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);
    }

    return apiSuccess({
      labels,
      revenue: dailyRevenue,
      period: 'last_7_days',
    });
  } catch (err) {
    console.error('[Vendor Analytics GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
