import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getClientIp } from '@/lib/api-helpers';
import { authLoginRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const { success: allowed } = await authLoginRateLimit.limit(ip);
    if (!allowed) {
      return apiError('Too many login attempts. Try again in 15 minutes.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { email, password } = parsed.data;

    // Sign in via Supabase Auth
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Get user role from public.users
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, status')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'customer';
    const status = profile?.status || 'active';

    // Check if user is suspended/banned
    if (status === 'suspended' || status === 'banned') {
      await supabase.auth.signOut();
      return apiError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    // Determine redirect based on role
    const redirectMap: Record<string, string> = {
      customer: '/dashboard',
      vendor: '/vendor/dashboard',
      admin: '/admin/dashboard',
    };

    return apiSuccess({
      user_id: data.user.id,
      role,
      redirect: redirectMap[role] || '/dashboard',
    });
  } catch (err) {
    console.error('[Login] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
