import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { sendEmail } from '@/lib/email';
import { encryptSensitive } from '@/lib/encryption';
import { z } from 'zod';

const vendorApplicationSchema = z.object({
  // Personal info
  first_name: z.string().min(2).max(100).trim(),
  last_name: z.string().min(2).max(100).trim(),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().min(10).max(20).trim(),
  password: z.string().min(8),
  // Store info
  store_name: z.string().min(2).max(150).trim(),
  store_description: z.string().max(5000).optional(),
  city: z.string().min(2).max(100).trim(),
  // Bank details
  bank_account_name: z.string().min(2).max(150).trim(),
  bank_account_number: z.string().min(5).max(50).trim(),
  bank_name: z.string().min(2).max(100).trim(),
  iban: z.string().max(34).optional(),
  // CNIC
  cnic: z.string().min(13).max(15).trim(),
  cnic_document_url: z.string().url().optional(),
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
    const body = await request.json();
    const parsed = vendorApplicationSchema.safeParse(body);
    
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Check if email already exists in users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      return apiError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Check for existing pending vendor with same email
    const { data: existingVendor } = await supabaseAdmin
      .from('vendors')
      .select('id, status')
      .eq('email', data.email)
      .single();

    if (existingVendor) {
      return apiError(
        `You already have a vendor application (status: ${existingVendor.status})`,
        409,
        'APPLICATION_EXISTS'
      );
    }

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

    // Hash password for storage (will be used when creating user account on approval)
    // Store encrypted password temporarily - will be used by Supabase Auth on approval
    const encryptedPassword = encryptSensitive(data.password);

    // Encrypt sensitive bank details
    const encryptedAccountNumber = encryptSensitive(data.bank_account_number);
    const encryptedIban = data.iban ? encryptSensitive(data.iban) : null;

    // Create vendor record WITHOUT user_id (pending approval)
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        user_id: null, // No user account yet
        store_name: data.store_name,
        store_slug: slug,
        description: data.store_description || null,
        phone: data.phone,
        email: data.email,
        status: 'pending',
        cnic_document_url: data.cnic_document_url || null,
        // Store application data in metadata
        metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          encrypted_password: encryptedPassword,
          cnic: data.cnic,
          city: data.city,
        },
      })
      .select('id')
      .single();

    if (vendorError) {
      console.error('[Vendor Application] Vendor insert error:', vendorError);
      return apiError('Failed to submit application', 500);
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
        jazzcash_number: null,
        easypaisa_number: null,
        preferred_method: 'bank_transfer',
      });

    if (bankError) {
      console.error('[Vendor Application] Bank details error:', bankError);
      // Rollback vendor creation
      await supabaseAdmin.from('vendors').delete().eq('id', vendor.id);
      return apiError('Failed to save bank details', 500);
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: process.env.ALERT_EMAIL!,
        subject: 'New Vendor Application',
        html: `
          <h2>New Vendor Application</h2>
          <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
          <p><strong>Store Name:</strong> ${data.store_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/applications">Review Application</a></p>
        `,
      });
    } catch (emailError) {
      console.error('[Vendor Application] Admin email error:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: data.email,
        subject: 'Vendor Application Received - Virsa Marketplace',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Received! 📝</h2>
            <p>Hi ${data.first_name},</p>
            <p>Thank you for applying to become a vendor on Virsa Marketplace!</p>
            <p>We have received your application for <strong>${data.store_name}</strong> and our team will review it within <strong>2-3 business days</strong>.</p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Our team will verify your documents and information</li>
                <li>You'll receive an email once your application is reviewed</li>
                <li>Once approved, you can log in and start selling</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact us at ${process.env.ALERT_EMAIL}
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('[Vendor Application] Applicant email error:', emailError);
      // Don't fail the request if email fails
    }

    return apiSuccess(
      { vendor_id: vendor.id, status: 'pending' },
      'Application submitted successfully. You will receive an email once approved.',
      201
    );
  } catch (err) {
    console.error('[Vendor Application] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
