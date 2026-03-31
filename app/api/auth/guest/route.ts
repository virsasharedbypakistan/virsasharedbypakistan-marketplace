import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getClientIp } from '@/lib/api-helpers';
import { authGuestRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';
import crypto from 'crypto';

const guestSchema = z.object({
  email: z.string().email('Invalid email').max(255).optional(),
  full_name: z.string().min(1, 'Name required').max(120).optional(),
});

function buildGuestEmail() {
  return `guest-${crypto.randomUUID()}@guest.virsa.local`;
}

function buildGuestPassword() {
  return crypto.randomBytes(24).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Auth Guest] Missing Supabase environment configuration');
      return apiError('Server configuration error', 500, 'CONFIG_ERROR');
    }

    const ip = getClientIp(request);
    const { success: allowed } = await authGuestRateLimit.limit(ip);
    if (!allowed) {
      return apiError('Too many guest checkout attempts. Try again later.', 429, 'RATE_LIMITED');
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = guestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email, full_name } = parsed.data;
    const supabase = await createServerSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    const existingUser = authData.user;

    if (existingUser) {
      const isGuest = Boolean(existingUser.user_metadata?.is_guest);

      if (isGuest && (email || full_name)) {
        const metadata = {
          ...existingUser.user_metadata,
          ...(full_name ? { full_name } : {}),
          is_guest: true,
        };

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            ...(email ? { email } : {}),
            user_metadata: metadata,
          }
        );

        if (updateError) {
          return apiError('Failed to update guest profile', 500, 'GUEST_UPDATE_FAILED');
        }

        const updates: Record<string, string> = {};
        if (email) updates.email = email;
        if (full_name) updates.full_name = full_name;

        if (Object.keys(updates).length > 0) {
          const { error: profileError } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', existingUser.id);

          if (profileError) {
            return apiError('Failed to update guest profile', 500, 'PROFILE_UPDATE_FAILED');
          }
        }
      }

      return apiSuccess({
        id: existingUser.id,
        email: existingUser.email,
        is_guest: isGuest,
      });
    }

    const guestEmail = email ?? buildGuestEmail();
    const guestName = full_name ?? 'Guest Checkout';
    const guestPassword = buildGuestPassword();

    const guestExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: guestEmail,
      password: guestPassword,
      email_confirm: true,
      user_metadata: { full_name: guestName, is_guest: true, guest_expires_at: guestExpiresAt },
    });

    if (error || !data.user) {
      console.error('[Auth Guest] Create user error:', error);
      const message = error?.message?.toLowerCase().includes('already')
        ? 'An account already exists for this email. Please sign in.'
        : process.env.NODE_ENV === 'development'
        ? error?.message || 'Failed to create guest session'
        : 'Failed to create guest session';
      const status = error?.message?.toLowerCase().includes('already') ? 409 : 500;
      return apiError(message, status, 'GUEST_CREATE_FAILED');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPassword,
    });

    if (signInError) {
      console.error('[Auth Guest] Sign-in error:', signInError);
      return apiError('Failed to start guest session', 500, 'GUEST_SIGNIN_FAILED');
    }

    return apiSuccess(
      {
        id: data.user.id,
        email: guestEmail,
        is_guest: true,
      },
      'Guest session created',
      201
    );
  } catch (err) {
    console.error('[Auth Guest] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
