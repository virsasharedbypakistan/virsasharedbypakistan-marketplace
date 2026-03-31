import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/deals — Public deals listing ───────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category');
    const vendor = searchParams.get('vendor');

    const now = new Date().toISOString();

    let query = supabaseAdmin
      .from('deals')
      .select(
        `
        *,
        products!inner(id, name, slug, thumbnail_url, category_id, vendor_id, status),
        vendors!inner(id, store_name, logo_url, status)
      `,
        { count: 'exact' }
      )
      .eq('is_active', true)
      .eq('products.status', 'active')
      .eq('vendors.status', 'approved')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('products.category_id', category);
    }

    if (vendor) {
      query = query.eq('vendor_id', vendor);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) {
      console.error('[Deals GET] Query error:', error);
      return apiError('Failed to fetch deals', 500);
    }

    return apiSuccess({
      data: data || [],
      ...paginationMeta(count || 0, page, limit),
    });
  } catch (err) {
    console.error('[Deals GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
