import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/admin/vendors — Get all vendors for admin ──────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');

    const validStatuses = new Set(['pending', 'approved', 'rejected', 'suspended']);

    let query = supabaseAdmin
      .from('vendors')
      .select(
        `id, store_name, store_slug, description, logo_url, banner_url,
         phone, email, status, is_featured, show_on_homepage, average_rating, total_reviews, 
         total_sales, created_at, metadata, rejection_reason,
         users!vendors_user_id_fkey(full_name, email),
         vendor_bank_details(bank_name, account_holder_name, account_number, iban)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (status && validStatuses.has(status)) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: vendors, count, error } = await query;

    if (error) {
      console.error('[Admin Vendors GET] Query error:', error);
      return apiError('Failed to fetch vendors', 500);
    }

    // Get product count for each vendor
    const vendorsWithCounts = await Promise.all(
      (vendors || []).map(async (vendor) => {
        const { count: productCount } = await supabaseAdmin
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
          .eq('status', 'active');

        return {
          ...vendor,
          product_count: productCount || 0,
        };
      })
    );

    return apiSuccess({
      data: vendorsWithCounts,
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Admin Vendors GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
