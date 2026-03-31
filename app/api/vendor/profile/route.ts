import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';
import { decryptSensitive, encryptSensitive } from '@/lib/encryption';

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

    // Fetch bank details
    const { data: bankDetails } = await supabaseAdmin
      .from('vendor_bank_details')
      .select('*')
      .eq('vendor_id', vendor.id)
      .single();

    // Decrypt sensitive bank details if they exist
    let decryptedBankDetails = null;
    if (bankDetails) {
      try {
        decryptedBankDetails = {
          bank_name: bankDetails.bank_name || null,
          account_holder_name: bankDetails.account_holder_name || null,
          account_number: bankDetails.account_number ? decryptSensitive(bankDetails.account_number) : null,
          iban: bankDetails.iban ? decryptSensitive(bankDetails.iban) : null,
          jazzcash_number: bankDetails.jazzcash_number ? decryptSensitive(bankDetails.jazzcash_number) : null,
          easypaisa_number: bankDetails.easypaisa_number ? decryptSensitive(bankDetails.easypaisa_number) : null,
          preferred_method: bankDetails.preferred_method || null,
        };
      } catch (error) {
        console.error('[Vendor Profile GET] Decryption error:', error);
        // If decryption fails, return the encrypted values (they might not be encrypted)
        decryptedBankDetails = {
          bank_name: bankDetails.bank_name || null,
          account_holder_name: bankDetails.account_holder_name || null,
          account_number: bankDetails.account_number || null,
          iban: bankDetails.iban || null,
          jazzcash_number: bankDetails.jazzcash_number || null,
          easypaisa_number: bankDetails.easypaisa_number || null,
          preferred_method: bankDetails.preferred_method || null,
        };
      }
    }

    // Combine vendor and bank details
    const profile = {
      ...vendor,
      bank_name: decryptedBankDetails?.bank_name || null,
      account_holder_name: decryptedBankDetails?.account_holder_name || null,
      account_number: decryptedBankDetails?.account_number || null,
      iban: decryptedBankDetails?.iban || null,
      jazzcash_number: decryptedBankDetails?.jazzcash_number || null,
      easypaisa_number: decryptedBankDetails?.easypaisa_number || null,
      preferred_method: decryptedBankDetails?.preferred_method || null,
    };

    return apiSuccess(profile);
  } catch (err) {
    console.error('[Vendor Profile GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/vendor/profile — Update vendor profile ───────────────

const updateProfileSchema = z.object({
  store_name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  email: z.string().email().optional(),
  logo_url: z.string().url().optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  phone: z.string().optional(),
  // Bank details (stored in vendor_bank_details table)
  bank_name: z.string().optional(),
  account_holder_name: z.string().optional(),
  account_number: z.string().optional(),
  iban: z.string().optional(),
  // Notification preferences (would need to add these columns or use metadata)
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

    const data = parsed.data;

    // Prevent store name change if vendor is already active
    if (data.store_name && vendor.status === 'approved' && data.store_name !== vendor.store_name) {
      return apiError('Store name cannot be changed after activation. Contact support for assistance.', 403, 'STORE_NAME_LOCKED');
    }

    // Separate vendor updates from bank details
    const vendorUpdates: any = {};
    const bankUpdates: any = {};

    // Vendor table fields
    if (data.store_name !== undefined) vendorUpdates.store_name = data.store_name;
    if (data.description !== undefined) vendorUpdates.description = data.description;
    if (data.email !== undefined) vendorUpdates.email = data.email;
    if (data.logo_url !== undefined) vendorUpdates.logo_url = data.logo_url;
    if (data.banner_url !== undefined) vendorUpdates.banner_url = data.banner_url;
    if (data.phone !== undefined) vendorUpdates.phone = data.phone;
    
    // Notification preferences
    if (data.notification_new_order !== undefined) vendorUpdates.notification_new_order = data.notification_new_order;
    if (data.notification_order_status !== undefined) vendorUpdates.notification_order_status = data.notification_order_status;
    if (data.notification_low_stock !== undefined) vendorUpdates.notification_low_stock = data.notification_low_stock;
    if (data.notification_reviews !== undefined) vendorUpdates.notification_reviews = data.notification_reviews;
    if (data.notification_promotions !== undefined) vendorUpdates.notification_promotions = data.notification_promotions;

    // Bank details fields
    if (data.bank_name !== undefined) bankUpdates.bank_name = data.bank_name;
    if (data.account_holder_name !== undefined) bankUpdates.account_holder_name = data.account_holder_name;
    if (data.account_number !== undefined) bankUpdates.account_number = data.account_number;
    if (data.iban !== undefined) bankUpdates.iban = data.iban;

    // Update vendor table if there are changes
    let updated = vendor;
    if (Object.keys(vendorUpdates).length > 0) {
      vendorUpdates.updated_at = new Date().toISOString();
      
      const { data: vendorData, error: vendorError } = await supabaseAdmin
        .from('vendors')
        .update(vendorUpdates)
        .eq('id', vendor.id)
        .select()
        .single();

      if (vendorError) {
        console.error('[Vendor Profile PATCH] Vendor update error:', vendorError);
        return apiError('Failed to update profile', 500);
      }
      updated = vendorData;
    }

    // Update bank details if there are changes
    if (Object.keys(bankUpdates).length > 0) {
      bankUpdates.updated_at = new Date().toISOString();
      
      // Encrypt sensitive fields before storing
      if (bankUpdates.account_number) {
        bankUpdates.account_number = encryptSensitive(bankUpdates.account_number);
      }
      if (bankUpdates.iban) {
        bankUpdates.iban = encryptSensitive(bankUpdates.iban);
      }
      if (bankUpdates.jazzcash_number) {
        bankUpdates.jazzcash_number = encryptSensitive(bankUpdates.jazzcash_number);
      }
      if (bankUpdates.easypaisa_number) {
        bankUpdates.easypaisa_number = encryptSensitive(bankUpdates.easypaisa_number);
      }
      
      // Check if bank details exist
      const { data: existingBank } = await supabaseAdmin
        .from('vendor_bank_details')
        .select('id')
        .eq('vendor_id', vendor.id)
        .single();

      if (existingBank) {
        // Update existing
        await supabaseAdmin
          .from('vendor_bank_details')
          .update(bankUpdates)
          .eq('vendor_id', vendor.id);
      } else {
        // Create new
        await supabaseAdmin
          .from('vendor_bank_details')
          .insert({
            vendor_id: vendor.id,
            ...bankUpdates
          });
      }
    }

    return apiSuccess(updated, 'Profile updated successfully');
  } catch (err) {
    console.error('[Vendor Profile PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
