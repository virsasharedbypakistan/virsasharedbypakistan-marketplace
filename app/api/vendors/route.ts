import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/vendors — Public vendor listing ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'rating';

    let query = supabaseAdmin
      .from('vendors')
      .select(
        `
        id, store_name, store_slug, description, logo_url, banner_url,
        phone, email, average_rating, total_reviews, total_sales, created_at
      `,
        { count: 'exact' }
      )
      .eq('approval_status', 'approved');

    // Search filter
    if (search) {
      query = query.or(`store_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort
    switch (sort) {
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'sales':
        query = query.order('total_sales', { ascending: false });
        break;
      default:
        query = query.order('average_rating', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: vendors, count, error } = await query;

    if (error) {
      console.error('[Vendors GET] Query error:', error);
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
    console.error('[Vendors GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
