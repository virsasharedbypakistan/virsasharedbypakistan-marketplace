import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';

// ── PATCH /api/notifications/[id] — Mark as read ────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { id } = await params;

    const { data: updated, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Notification PATCH] Update error:', error);
      return apiError('Failed to mark notification as read', 500);
    }

    if (!updated) {
      return apiError('Notification not found', 404, 'NOT_FOUND');
    }

    return apiSuccess(updated, 'Notification marked as read');
  } catch (err) {
    console.error('[Notification PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/notifications/[id] — Delete notification ────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Notification DELETE] Delete error:', error);
      return apiError('Failed to delete notification', 500);
    }

    return apiSuccess(null, 'Notification deleted');
  } catch (err) {
    console.error('[Notification DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
