import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/vendor/orders — Get vendor's orders ────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const { page, limit } = getPagination(searchParams);

    // Build query for order items
    let query = supabaseAdmin
      .from('order_items')
      .select(
        `
        id, order_id, product_id, product_name, product_thumbnail,
        quantity, unit_price, subtotal, shipping_amount,
        commission_rate, commission_amount, vendor_earning,
        item_status, tracking_number, shipped_at, completed_at,
        orders!inner(
          id, order_number, customer_id, 
          shipping_full_name, shipping_phone, shipping_city,
          payment_method, payment_status, status, created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('item_status', status);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) {
      console.error('[Vendor Orders GET] Query error:', error);
      return apiError('Failed to fetch orders', 500);
    }

    return apiSuccess({
      data: data || [],
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Vendor Orders GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
