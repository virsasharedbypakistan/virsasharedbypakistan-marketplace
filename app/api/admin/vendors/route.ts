import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/admin/vendors — Admin vendor management ────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('vendors')
      .select(
        `
        id, user_id, store_name, store_slug, description, logo_url,
        phone, email, approval_status, rejection_reason,
        commission_type, commission_rate, average_rating, total_reviews,
        total_sales, balance, approved_by, approved_at, created_at,
        users!inner(full_name, email)
      `,
        { count: 'exact' }
      );

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('approval_status', status);
    }

    // Search filter
    if (search) {
      query = query.or(`store_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Sort by created_at desc
    query = query.order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: vendors, count, error } = await query;

    if (error) {
      console.error('[Admin Vendors GET] Query error:', error);
      return apiError('Failed to fetch vendors', 500);
    }

    return apiSuccess({
      data: vendors || [],
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Admin Vendors GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
