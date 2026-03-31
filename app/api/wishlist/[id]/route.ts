import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireNonGuest } from '@/lib/api-helpers';

// ── DELETE /api/wishlist/[id] — Remove from wishlist ────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Get wishlist item to verify ownership
    const { data: item } = await supabaseAdmin
      .from('wishlist_items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!item) {
      return apiError('Wishlist item not found', 404, 'WISHLIST_ITEM_NOT_FOUND');
    }

    if (item.user_id !== user.id) {
      return apiError('Forbidden', 403, 'FORBIDDEN');
    }

    // Delete item
    const { error } = await supabaseAdmin.from('wishlist_items').delete().eq('id', id);

    if (error) {
      console.error('[Wishlist DELETE] Error:', error);
      return apiError('Failed to remove from wishlist', 500);
    }

    return apiSuccess(null, 'Removed from wishlist');
  } catch (err) {
    console.error('[Wishlist DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
