import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/vendors/me — Get vendor's own profile ──────────────────

export async function GET() {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Get bank details (masked)
    const { data: bankDetails } = await supabaseAdmin
      .from('vendor_bank_details')
      .select('account_holder_name, bank_name, preferred_method')
      .eq('vendor_id', vendor.id)
      .single();

    // Mask sensitive data
    const maskedVendor = {
      ...vendor,
      bank_details: bankDetails
        ? {
            account_holder_name: bankDetails.account_holder_name,
            bank_name: bankDetails.bank_name,
            preferred_method: bankDetails.preferred_method,
          }
        : null,
    };

    return apiSuccess(maskedVendor);
  } catch (err) {
    console.error('[Vendor Me GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/vendors/me — Update vendor profile ───────────────────

const updateVendorSchema = z.object({
  store_name: z.string().min(2).max(150).trim().optional(),
  description: z.string().max(5000).optional(),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  // Bank details
  account_holder_name: z.string().min(2).max(150).optional(),
  bank_name: z.string().max(100).optional(),
  account_number: z.string().max(50).optional(),
  iban: z.string().max(34).optional(),
  jazzcash_number: z.string().max(20).optional(),
  easypaisa_number: z.string().max(20).optional(),
  preferred_method: z
    .enum(['bank_transfer', 'jazzcash', 'easypaisa', 'manual'])
    .optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

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

    // Parse body
    const body = await request.json();
    const parsed = updateVendorSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Separate vendor profile updates from bank details
    const vendorUpdates: Record<string, unknown> = {};
    const bankUpdates: Record<string, unknown> = {};

    if (data.store_name) {
      vendorUpdates.store_name = data.store_name;
      // Generate new slug if name changed
      let slug = generateSlug(data.store_name);
      const { data: existingSlug } = await supabaseAdmin
        .from('vendors')
        .select('id')
        .eq('store_slug', slug)
        .neq('id', vendor.id)
        .single();

      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
      vendorUpdates.store_slug = slug;
    }

    if (data.description !== undefined) vendorUpdates.description = data.description;
    if (data.logo_url) vendorUpdates.logo_url = data.logo_url;
    if (data.banner_url) vendorUpdates.banner_url = data.banner_url;
    if (data.phone) vendorUpdates.phone = data.phone;
    if (data.email) vendorUpdates.email = data.email;

    // Bank details
    if (data.account_holder_name) bankUpdates.account_holder_name = data.account_holder_name;
    if (data.bank_name) bankUpdates.bank_name = data.bank_name;
    if (data.account_number) bankUpdates.account_number = data.account_number;
    if (data.iban) bankUpdates.iban = data.iban;
    if (data.jazzcash_number) bankUpdates.jazzcash_number = data.jazzcash_number;
    if (data.easypaisa_number) bankUpdates.easypaisa_number = data.easypaisa_number;
    if (data.preferred_method) bankUpdates.preferred_method = data.preferred_method;

    // Update vendor profile
    if (Object.keys(vendorUpdates).length > 0) {
      const { error } = await supabaseAdmin
        .from('vendors')
        .update(vendorUpdates)
        .eq('id', vendor.id);

      if (error) {
        console.error('[Vendor Me PATCH] Vendor update error:', error);
        return apiError('Failed to update vendor profile', 500);
      }
    }

    // Update bank details
    if (Object.keys(bankUpdates).length > 0) {
      // Check if bank details exist
      const { data: existingBank } = await supabaseAdmin
        .from('vendor_bank_details')
        .select('id')
        .eq('vendor_id', vendor.id)
        .single();

      if (existingBank) {
        const { error } = await supabaseAdmin
          .from('vendor_bank_details')
          .update(bankUpdates)
          .eq('vendor_id', vendor.id);

        if (error) {
          console.error('[Vendor Me PATCH] Bank update error:', error);
          return apiError('Failed to update bank details', 500);
        }
      } else {
        const { error } = await supabaseAdmin
          .from('vendor_bank_details')
          .insert({
            vendor_id: vendor.id,
            ...bankUpdates,
          });

        if (error) {
          console.error('[Vendor Me PATCH] Bank insert error:', error);
          return apiError('Failed to create bank details', 500);
        }
      }
    }

    // Fetch updated vendor
    const updatedVendor = await getVendorForUser(user.id);

    return apiSuccess(updatedVendor, 'Profile updated successfully');
  } catch (err) {
    console.error('[Vendor Me PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
