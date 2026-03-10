import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PATCH /api/admin/users/[id] — Ban/activate user ─────────────────

const updateUserSchema = z.object({
  is_banned: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;

    // Parse body
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { is_banned } = parsed.data;

    // Check user exists and is customer
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, role, is_banned')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return apiError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (targetUser.role !== 'customer') {
      return apiError('Can only ban/unban customers', 400, 'INVALID_ROLE');
    }

    // Update user
    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update({ is_banned })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin User PATCH] Update error:', error);
      return apiError('Failed to update user', 500);
    }

    return apiSuccess(
      updated,
      is_banned ? 'User banned successfully' : 'User activated successfully'
    );
  } catch (err) {
    console.error('[Admin User PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
