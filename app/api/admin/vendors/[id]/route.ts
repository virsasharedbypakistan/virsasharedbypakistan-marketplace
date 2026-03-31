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
    console.log('[Admin Vendor PATCH] Starting request...');
    
    const authResult = await requireRole('admin');
    if ('error' in authResult) {
      console.log('[Admin Vendor PATCH] Auth failed');
      return authResult.error;
    }
    const { user } = authResult;
    console.log('[Admin Vendor PATCH] Auth successful, user:', user.id);

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      console.log('[Admin Vendor PATCH] Rate limited');
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    const { id } = await params;
    console.log('[Admin Vendor PATCH] Vendor ID:', id);

    // Parse body
    const body = await request.json();
    console.log('[Admin Vendor PATCH] Request body:', body);
    
    const parsed = updateVendorStatusSchema.safeParse(body);
    if (!parsed.success) {
      console.log('[Admin Vendor PATCH] Validation failed:', parsed.error.issues);
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { action, reason, commission_type, commission_rate } = parsed.data;
    console.log('[Admin Vendor PATCH] Action:', action, 'Vendor ID:', id);

    // Get vendor
    console.log('[Admin Vendor PATCH] Fetching vendor...');
    const { data: vendor, error: vendorFetchError } = await supabaseAdmin
      .from('vendors')
      .select('id, user_id, store_name, status, email, phone, metadata, users!vendors_user_id_fkey(email, full_name)')
      .eq('id', id)
      .single();

    if (vendorFetchError || !vendor) {
      console.error('[Admin Vendor PATCH] Vendor fetch error:', vendorFetchError);
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }
    
    console.log('[Admin Vendor PATCH] Vendor found:', {
      id: vendor.id,
      status: vendor.status,
      has_user_id: !!vendor.user_id,
      has_metadata: !!vendor.metadata
    });

    const vendorUser = vendor.users as unknown as { email: string; full_name: string } | null;

    // Prepare update data
    const updateData: Record<string, unknown> = {
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    let emailTemplate = null;

    console.log('[Admin Vendor PATCH] Processing action:', action);

    switch (action) {
      case 'approve':
        console.log('[Admin Vendor PATCH] Approve case - checking status');
        if (vendor.status === 'approved') {
          console.log('[Admin Vendor PATCH] Already approved');
          return apiError('Vendor is already approved', 400, 'ALREADY_APPROVED');
        }
        
        console.log('[Admin Vendor PATCH] Setting status to approved');
        updateData.status = 'approved';
        updateData.rejection_reason = null;

        // If vendor doesn't have a user account yet (new application flow), create one
        if (!vendor.user_id && vendor.metadata) {
          console.log('[Admin Vendor PATCH] New vendor application - creating user account');
          const metadata = vendor.metadata as any;
          console.log('[Admin Vendor PATCH] Processing new vendor application, metadata keys:', Object.keys(metadata));
          
          // Validate required metadata fields
          if (!metadata.encrypted_password || !metadata.first_name || !metadata.last_name) {
            console.error('[Admin Vendor PATCH] Missing required metadata fields:', {
              has_encrypted_password: !!metadata.encrypted_password,
              has_first_name: !!metadata.first_name,
              has_last_name: !!metadata.last_name
            });
            return apiError('Vendor application is missing required information. Please contact support.', 400, 'INVALID_METADATA');
          }
          
          // Decrypt the stored password
          let password: string;
          try {
            console.log('[Admin Vendor PATCH] Decrypting password...');
            password = decryptSensitive(metadata.encrypted_password);
            console.log('[Admin Vendor PATCH] Password decrypted successfully');
          } catch (decryptError) {
            console.error('[Admin Vendor PATCH] Password decryption error:', decryptError);
            return apiError('Failed to decrypt vendor credentials. Please contact support.', 500, 'DECRYPTION_ERROR');
          }
          
          // Create user account via Supabase Auth (handles password hashing)
          console.log('[Admin Vendor PATCH] Creating Supabase Auth user...');
          
          // First check if auth user already exists by querying auth.users table
          const { data: existingAuthUsers } = await supabaseAdmin
            .from('auth.users')
            .select('id, email')
            .eq('email', vendor.email)
            .limit(1);
          
          let authUserId: string;
          
          if (existingAuthUsers && existingAuthUsers.length > 0) {
            console.log('[Admin Vendor PATCH] Auth user already exists:', existingAuthUsers[0].id);
            authUserId = existingAuthUsers[0].id;
          } else {
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
              return apiError(`Failed to create user account: ${authError.message}`, 500, 'AUTH_ERROR');
            }
            
            console.log('[Admin Vendor PATCH] Auth user created:', authUser.user.id);
            authUserId = authUser.user.id;
          }

          // Check if user record already exists in users table
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, email, role')
            .eq('id', authUserId)
            .single();

          let newUser;
          
          if (existingUser) {
            console.log('[Admin Vendor PATCH] User record already exists, updating role to vendor');
            // Update existing user to vendor role
            const { data: updatedUser, error: updateError } = await supabaseAdmin
              .from('users')
              .update({ role: 'vendor' })
              .eq('id', authUserId)
              .select('id, email, full_name')
              .single();
              
            if (updateError) {
              console.error('[Admin Vendor PATCH] User update error:', updateError);
              return apiError(`Failed to update user record: ${updateError.message}`, 500, 'USER_UPDATE_ERROR');
            }
            
            newUser = updatedUser;
          } else {
            // Create user record in users table
            console.log('[Admin Vendor PATCH] Creating user record in users table...');
            const { data: createdUser, error: userError } = await supabaseAdmin
              .from('users')
              .insert({
                id: authUserId,
                email: vendor.email,
                full_name: `${metadata.first_name} ${metadata.last_name}`,
                phone: vendor.phone,
                role: 'vendor',
              })
              .select('id, email, full_name')
              .single();

            if (userError) {
              console.error('[Admin Vendor PATCH] User table insert error:', userError);
              // Rollback auth user creation only if we just created it
              if (!existingAuthUsers || existingAuthUsers.length === 0) {
                await supabaseAdmin.auth.admin.deleteUser(authUserId);
              }
              return apiError(`Failed to create user record: ${userError.message}`, 500, 'USER_INSERT_ERROR');
            }
            
            console.log('[Admin Vendor PATCH] User record created:', createdUser.id);
            newUser = createdUser;
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
          console.log('[Admin Vendor PATCH] Existing vendor - updating role');
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
        } else {
          // No user_id and no metadata - invalid state
          console.error('[Admin Vendor PATCH] Incomplete application - no user_id and no metadata');
          return apiError('Vendor application is incomplete. Missing user information.', 400, 'INCOMPLETE_APPLICATION');
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
    console.log('[Admin Vendor PATCH] Updating vendor record with data:', updateData);
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
    
    console.log('[Admin Vendor PATCH] Vendor updated successfully');

    // Send email notification
    if (emailTemplate) {
      console.log('[Admin Vendor PATCH] Sending email notification...');
      const recipientEmail = vendor.email || vendorUser?.email;
      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          ...emailTemplate,
        });
        console.log('[Admin Vendor PATCH] Email sent to:', recipientEmail);
      }
    }

    console.log('[Admin Vendor PATCH] Request completed successfully');
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
