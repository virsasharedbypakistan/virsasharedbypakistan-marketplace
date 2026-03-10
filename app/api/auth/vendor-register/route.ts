import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { encryptSensitive } from '@/lib/encryption';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const vendorRegisterSchema = z.object({
  store_name: z.string().min(2, 'Store name required').max(150).trim(),
  store_description: z.string().max(5000).optional(),
  phone: z.string().min(10, 'Valid phone number required').max(20).trim(),
  city: z.string().min(2).max(100).trim(),
  bank_account_name: z.string().min(2).max(150).trim(),
  bank_account_number: z.string().min(5).max(50).trim(),
  bank_name: z.string().min(2).max(100).trim(),
  iban: z.string().max(34).optional(),
  jazzcash_number: z.string().max(20).optional(),
  easypaisa_number: z.string().max(20).optional(),
  preferred_method: z.enum(['bank_transfer', 'jazzcash', 'easypaisa', 'manual']).default('bank_transfer'),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
});

function generateStoreSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

export async function POST(request: NextRequest) {
  try {
    // Must be authenticated
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Check if user already has a vendor profile
    const { data: existingVendor } = await supabaseAdmin
      .from('vendors')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (existingVendor) {
      return apiError(
        `You already have a vendor application (status: ${existingVendor.status})`,
        409,
        'VENDOR_EXISTS'
      );
    }

    // Parse body
    const body = await request.json();
    const parsed = vendorRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Generate unique store slug
    let slug = generateStoreSlug(data.store_name);
    const { data: existingSlug } = await supabaseAdmin
      .from('vendors')
      .select('id')
      .eq('store_slug', slug)
      .single();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Encrypt sensitive bank details
    const encryptedAccountNumber = encryptSensitive(data.bank_account_number);
    const encryptedIban = data.iban ? encryptSensitive(data.iban) : null;

    // Create vendor profile
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        user_id: user.id,
        store_name: data.store_name,
        store_slug: slug,
        description: data.store_description || null,
        logo_url: data.logo_url || null,
        banner_url: data.banner_url || null,
        phone: data.phone,
        email: user.email,
        status: 'pending',
      })
      .select('id')
      .single();

    if (vendorError) {
      console.error('[Vendor Register] Vendor insert error:', vendorError);
      return apiError('Failed to create vendor profile', 500);
    }

    // Create bank details record
    const { error: bankError } = await supabaseAdmin
      .from('vendor_bank_details')
      .insert({
        vendor_id: vendor.id,
        account_holder_name: data.bank_account_name,
        bank_name: data.bank_name,
        account_number: encryptedAccountNumber,
        iban: encryptedIban,
        jazzcash_number: data.jazzcash_number || null,
        easypaisa_number: data.easypaisa_number || null,
        preferred_method: data.preferred_method,
      });

    if (bankError) {
      console.error('[Vendor Register] Bank details error:', bankError);
      // Rollback vendor creation
      await supabaseAdmin.from('vendors').delete().eq('id', vendor.id);
      return apiError('Failed to save bank details', 500);
    }

    // Update user role to vendor
    await supabaseAdmin
      .from('users')
      .update({ role: 'vendor' })
      .eq('id', user.id);

    // Send notification to admin
    await sendEmail({
      to: process.env.ALERT_EMAIL!,
      subject: 'New Vendor Application',
      html: `
        <h2>New Vendor Application</h2>
        <p><strong>Store Name:</strong> ${data.store_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>City:</strong> ${data.city}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/applications">Review Application</a></p>
      `,
    });

    return apiSuccess(
      { vendor_id: vendor.id, status: 'pending' },
      'Vendor application submitted successfully. Awaiting admin approval.',
      201
    );
  } catch (err) {
    console.error('[Vendor Register] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
