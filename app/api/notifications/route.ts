import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireNonGuest, getPagination, paginationMeta } from '@/lib/api-helpers';

// ── GET /api/notifications — Get user notifications ─────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const { page, limit } = getPagination(searchParams);
    const unread_only = searchParams.get('unread_only') === 'true';

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (unread_only) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) {
      console.error('[Notifications GET] Query error:', error);
      return apiError('Failed to fetch notifications', 500);
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return apiSuccess({
      data: data || [],
      pagination: paginationMeta(page, limit, count || 0),
      unreadCount: unreadCount || 0,
    });
  } catch (err) {
    console.error('[Notifications GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/notifications — Mark all as read ─────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('[Notifications PATCH] Update error:', error);
      return apiError('Failed to mark notifications as read', 500);
    }

    return apiSuccess(null, 'All notifications marked as read');
  } catch (err) {
    console.error('[Notifications PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
