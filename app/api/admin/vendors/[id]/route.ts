import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { sendEmail, vendorApprovedEmail, vendorRejectedEmail } from '@/lib/email';
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
      .select('id, user_id, store_name, approval_status, users!inner(email, full_name)')
      .eq('id', id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    const vendorUser = vendor.users as unknown as { email: string; full_name: string };

    // Prepare update data
    const updateData: Record<string, unknown> = {
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    let emailTemplate = null;

    switch (action) {
      case 'approve':
        if (vendor.approval_status === 'approved') {
          return apiError('Vendor is already approved', 400, 'ALREADY_APPROVED');
        }
        updateData.approval_status = 'approved';
        updateData.rejection_reason = null;

        // Update user role to vendor
        await supabaseAdmin
          .from('users')
          .update({ role: 'vendor' })
          .eq('id', vendor.user_id);

        emailTemplate = vendorApprovedEmail({
          vendorName: vendorUser.full_name,
          storeName: vendor.store_name,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard`,
        });
        break;

      case 'reject':
        updateData.approval_status = 'rejected';
        updateData.rejection_reason = reason || 'Application did not meet requirements';

        emailTemplate = vendorRejectedEmail({
          vendorName: vendorUser.full_name,
          storeName: vendor.store_name,
          reason: updateData.rejection_reason as string,
        });
        break;

      case 'suspend':
        updateData.approval_status = 'suspended';
        updateData.rejection_reason = reason || 'Account suspended by admin';

        // Update user role back to customer
        await supabaseAdmin
          .from('users')
          .update({ role: 'customer' })
          .eq('id', vendor.user_id);
        break;

      case 'activate':
        if (vendor.approval_status !== 'suspended') {
          return apiError('Can only activate suspended vendors', 400);
        }
        updateData.approval_status = 'approved';
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
      await sendEmail({
        to: vendorUser.email,
        ...emailTemplate,
      });
    }

    return apiSuccess(updated, `Vendor ${action}d successfully`);
  } catch (err) {
    console.error('[Admin Vendor PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
