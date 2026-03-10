import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getClientIp } from '@/lib/api-helpers';
import { authRegisterRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  role: z.literal('customer').default('customer'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const { success: allowed } = await authRegisterRateLimit.limit(ip);
    if (!allowed) {
      return apiError('Too many registration attempts. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { name, email, password } = parsed.data;

    // Check if password contains email
    if (password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      return apiError('Password must not contain your email', 400, 'VALIDATION_ERROR');
    }

    // Register via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: name },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return apiError('An account with this email already exists', 409, 'DUPLICATE_EMAIL');
      }
      console.error('[Register] Supabase error:', error);
      return apiError('Registration failed. Please try again.', 500);
    }

    return apiSuccess(
      { user_id: data.user.id, email: data.user.email },
      'Registration successful',
      201
    );
  } catch (err) {
    console.error('[Register] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
