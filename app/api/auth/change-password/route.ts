import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';
import { createClient } from '@/lib/supabase-server';

// ── POST /api/auth/change-password — Change user password ───────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get Supabase client
    const supabase = await createClient();

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return apiError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[Change Password] Update error:', updateError);
      return apiError('Failed to update password', 500);
    }

    return apiSuccess(null, 'Password updated successfully');
  } catch (err) {
    console.error('[Change Password] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
