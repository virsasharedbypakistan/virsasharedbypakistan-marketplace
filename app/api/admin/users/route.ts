import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/admin/users — Get all customers ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // active, banned

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'active') {
      query = query.eq('is_banned', false);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) {
      console.error('[Admin Users GET] Query error:', error);
      return apiError('Failed to fetch users', 500);
    }

    return apiSuccess({
      data: data || [],
      ...paginationMeta(count || 0, page, limit),
    });
  } catch (err) {
    console.error('[Admin Users GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
