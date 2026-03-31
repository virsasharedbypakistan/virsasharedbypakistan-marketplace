import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from './supabaseServer';
import { supabaseAdmin } from './supabaseAdmin';

// ── Response Helpers ─────────────────────────────────────────

export function apiSuccess<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    { data, ...(message && { message }) },
    { status }
  );
}

export function apiError(error: string, status: number = 400, code?: string) {
  return NextResponse.json(
    { error, ...(code && { code }) },
    { status }
  );
}

// ── Auth Helpers ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  is_guest: boolean;
  guest_expires_at?: string | null;
}

/**
 * Get the authenticated user from the request.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Get user profile with role from public.users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'customer',
      is_guest: Boolean(user.user_metadata?.is_guest),
      guest_expires_at: user.user_metadata?.guest_expires_at || null,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns error response if not authenticated.
 */
export async function requireAuth(): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const user = await getAuthUser();
  if (!user) {
    return { error: apiError('Authentication required', 401, 'UNAUTHORIZED') };
  }
  return { user };
}

/**
 * Require authentication and a non-guest user.
 */
export async function requireNonGuest(): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const result = await requireAuth();
  if ('error' in result) return result;

  if (result.user.is_guest) {
    return { error: apiError('Please sign in or register to access this feature', 403, 'GUEST_RESTRICTED') };
  }

  return result;
}

/**
 * Require a specific role. Returns error response if unauthorized.
 */
export async function requireRole(
  ...allowedRoles: Array<'customer' | 'vendor' | 'admin'>
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const result = await requireAuth();
  if ('error' in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return { error: apiError('Forbidden — insufficient permissions', 403, 'FORBIDDEN') };
  }

  return result;
}

// ── Pagination Helper ────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export function getPagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  return { page, limit };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

// ── Rate Limit Helper ────────────────────────────────────────

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ── Vendor Helper ────────────────────────────────────────────

/**
 * Get the vendor record for the authenticated user.
 */
export async function getVendorForUser(userId: string) {
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .single();

  return vendor;
}
