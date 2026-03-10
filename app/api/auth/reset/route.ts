import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getClientIp } from '@/lib/api-helpers';
import { authResetRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const { success: allowed } = await authResetRateLimit.limit(ip);
    if (!allowed) {
      return apiError('Too many reset attempts. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email } = parsed.data;

    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      console.error('[Reset] Error:', error);
      // Don't reveal if email exists or not (security)
      return apiSuccess(null, 'If an account exists with this email, a password reset link has been sent.');
    }

    return apiSuccess(null, 'Password reset email sent. Please check your inbox.');
  } catch (err) {
    console.error('[Reset] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
