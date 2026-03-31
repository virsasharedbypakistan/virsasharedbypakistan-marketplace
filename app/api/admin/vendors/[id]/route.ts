import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { sendEmail, vendorApprovedEmail, vendorRejectedEmail } from '@/lib/email';
import { decryptSensitive } from '@/lib/encryption';
import { z } from 'zod';

// ── PATCH /api/admin/vendors/[id] — Approve/reject/suspend vendor ───

const updateVendorStatusSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'activate']),
  reason: z.string().max(1000).optional(),
  commission_type: z.enum(['global', 'custom']).optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;

    // Parse body
    const body = await request.json();
    const parsed = updateVendorStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { action, reason, commission_type, commission_rate } = parsed.data;

    // Get vendor
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id, user_id, store_name, status, email, phone, metadata, users!vendors_user_id_fkey(email, full_name)')
      .eq('id', id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    const vendorUser = vendor.users as unknown as { email: string; full_name: string } | null;

    // Prepare update data
    const updateData: Record<string, unknown> = {
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    let emailTemplate = null;

    switch (action) {
      case 'approve':
        if (vendor.status === 'approved') {
          return apiError('Vendor is already approved', 400, 'ALREADY_APPROVED');
        }
        updateData.status = 'approved';
        updateData.rejection_reason = null;

        // If vendor doesn't have a user account yet (new application flow), create one
        if (!vendor.user_id && vendor.metadata) {
          const metadata = vendor.metadata as any;
          
          // Decrypt the stored password
          const password = decryptSensitive(metadata.encrypted_password);
          
          // Create user account via Supabase Auth (handles password hashing)
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: vendor.email,
            password: password,
            email_confirm: true, // Auto-confirm email since admin approved
            user_metadata: { 
              full_name: `${metadata.first_name} ${metadata.last_name}`,
              phone: vendor.phone,
            },
          });

          if (authError) {
            console.error('[Admin Vendor PATCH] Auth user creation error:', authError);
            return apiError('Failed to create user account', 500);
          }

          // Create user record in users table
          const { data: newUser, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authUser.user.id, // Use Supabase Auth user ID
              email: vendor.email,
              full_name: `${metadata.first_name} ${metadata.last_name}`,
              phone: vendor.phone,
              role: 'vendor',
            })
            .select('id, email, full_name')
            .single();

          if (userError) {
            console.error('[Admin Vendor PATCH] User table insert error:', userError);
            // Rollback auth user creation
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            return apiError('Failed to create user record', 500);
          }

          // Link vendor to new user
          updateData.user_id = newUser.id;
          
          // Use new user data for email
          emailTemplate = vendorApprovedEmail({
            vendorName: newUser.full_name,
            storeName: vendor.store_name,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard`,
          });
        } else if (vendor.user_id) {
          // Existing flow - update user role to vendor
          await supabaseAdmin
            .from('users')
            .update({ role: 'vendor' })
            .eq('id', vendor.user_id);

          if (vendorUser) {
            emailTemplate = vendorApprovedEmail({
              vendorName: vendorUser.full_name,
              storeName: vendor.store_name,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard`,
            });
          }
        }
        break;

      case 'reject':
        updateData.status = 'rejected';
        updateData.rejection_reason = reason || 'Application did not meet requirements';

        // Send rejection email
        const applicantName = vendor.metadata?.first_name && vendor.metadata?.last_name
          ? `${vendor.metadata.first_name} ${vendor.metadata.last_name}`
          : vendorUser?.full_name || 'Applicant';
        
        const applicantEmail = vendor.email || vendorUser?.email;

        if (applicantEmail) {
          emailTemplate = vendorRejectedEmail({
            vendorName: applicantName,
            storeName: vendor.store_name,
            reason: updateData.rejection_reason as string,
          });
        }
        break;

      case 'suspend':
        updateData.status = 'suspended';
        updateData.rejection_reason = reason || 'Account suspended by admin';

        // Update user role back to customer
        await supabaseAdmin
          .from('users')
          .update({ role: 'customer' })
          .eq('id', vendor.user_id);
        break;

      case 'activate':
        if (vendor.status !== 'suspended') {
          return apiError('Can only activate suspended vendors', 400);
        }
        updateData.status = 'approved';
        updateData.rejection_reason = null;

        // Update user role to vendor
        await supabaseAdmin
          .from('users')
          .update({ role: 'vendor' })
          .eq('id', vendor.user_id);
        break;
    }

    // Update commission if provided
    if (commission_type) {
      updateData.commission_type = commission_type;
    }
    if (commission_rate !== undefined) {
      updateData.commission_rate = commission_rate;
    }

    // Update vendor
    const { data: updated, error } = await supabaseAdmin
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Vendor PATCH] Update error:', error);
      return apiError('Failed to update vendor', 500);
    }

    // Send email notification
    if (emailTemplate) {
      const recipientEmail = vendor.email || vendorUser?.email;
      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          ...emailTemplate,
        });
      }
    }

    return apiSuccess(updated, `Vendor ${action}d successfully`);
  } catch (err) {
    console.error('[Admin Vendor PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/admin/vendors/[id] — Delete vendor account ──────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;

    // Get vendor with user info
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id, user_id, store_name')
      .eq('id', id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Check if vendor has any order items (RESTRICT constraint)
    const { count: orderItemsCount } = await supabaseAdmin
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', id);

    if (orderItemsCount && orderItemsCount > 0) {
      return apiError(
        'Cannot delete vendor with order history. Orders must be preserved for record keeping.',
        400,
        'HAS_ORDER_HISTORY'
      );
    }

    // Delete related records that have NO ACTION constraint (must be deleted manually)
    
    // Delete deals
    await supabaseAdmin
      .from('deals')
      .delete()
      .eq('vendor_id', id);

    // Delete commission logs
    await supabaseAdmin
      .from('commission_logs')
      .delete()
      .eq('vendor_id', id);

    // Delete earnings snapshots
    await supabaseAdmin
      .from('earnings_snapshots')
      .delete()
      .eq('vendor_id', id);

    // Delete withdrawal requests
    await supabaseAdmin
      .from('withdrawal_requests')
      .delete()
      .eq('vendor_id', id);

    // Products, cart_items, and vendor_bank_details will CASCADE automatically

    // Delete vendor record (this will cascade to products, cart_items, bank_details)
    const { error: deleteError } = await supabaseAdmin
      .from('vendors')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Admin Vendor DELETE] Delete error:', deleteError);
      return apiError('Failed to delete vendor', 500);
    }

    // If vendor has a user account, delete it from auth
    if (vendor.user_id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(vendor.user_id);
        
        // Delete user record
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', vendor.user_id);
      } catch (authError) {
        console.error('[Admin Vendor DELETE] Auth delete error:', authError);
        // Continue even if auth deletion fails
      }
    }

    return apiSuccess(null, 'Vendor deleted successfully');
  } catch (err) {
    console.error('[Admin Vendor DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
