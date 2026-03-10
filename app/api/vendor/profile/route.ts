import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/vendor/profile — Get vendor profile ────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    return apiSuccess(vendor);
  } catch (err) {
    console.error('[Vendor Profile GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/vendor/profile — Update vendor profile ───────────────

const updateProfileSchema = z.object({
  store_name: z.string().min(2).max(100).optional(),
  store_description: z.string().max(1000).optional(),
  store_email: z.string().email().optional(),
  logo_url: z.string().url().optional().nullable(),
  bank_name: z.string().optional(),
  account_title: z.string().optional(),
  account_number: z.string().optional(),
  iban: z.string().optional(),
  notification_new_order: z.boolean().optional(),
  notification_order_status: z.boolean().optional(),
  notification_low_stock: z.boolean().optional(),
  notification_reviews: z.boolean().optional(),
  notification_promotions: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    // Prevent store name change if vendor is already active
    if (parsed.data.store_name && vendor.status === 'active' && parsed.data.store_name !== vendor.store_name) {
      return apiError('Store name cannot be changed after activation. Contact support for assistance.', 403, 'STORE_NAME_LOCKED');
    }

    const { data: updated, error } = await supabaseAdmin
      .from('vendors')
      .update(parsed.data)
      .eq('id', vendor.id)
      .select()
      .single();

    if (error) {
      console.error('[Vendor Profile PATCH] Update error:', error);
      return apiError('Failed to update profile', 500);
    }

    return apiSuccess(updated, 'Profile updated successfully');
  } catch (err) {
    console.error('[Vendor Profile PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
