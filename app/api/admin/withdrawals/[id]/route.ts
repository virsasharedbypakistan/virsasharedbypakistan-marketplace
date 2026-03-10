import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { sendEmail, withdrawalApprovedEmail, withdrawalRejectedEmail } from '@/lib/email';
import { z } from 'zod';

// ── PATCH /api/admin/withdrawals/[id] — Approve/reject withdrawal ───

const updateWithdrawalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().max(500).optional(),
  transaction_id: z.string().max(100).optional(),
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
    const parsed = updateWithdrawalSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { status, admin_notes, transaction_id } = parsed.data;

    // Get withdrawal request from Supabase
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !withdrawal) {
      return apiError('Withdrawal request not found', 404, 'NOT_FOUND');
    }

    if (withdrawal.status !== 'pending') {
      return apiError(
        'Withdrawal already processed',
        400,
        'ALREADY_PROCESSED'
      );
    }

    // Get vendor details
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('id, store_name, balance, user_id, users!inner(email, full_name)')
      .eq('id', withdrawal.vendor_id)
      .single();

    if (!vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    const amount = parseFloat(withdrawal.amount);

    if (status === 'approved') {
      // Update withdrawal in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_notes: admin_notes || null,
          transaction_id: transaction_id || null,
        })
        .eq('id', id);

      if (updateError) {
        console.error('[Admin Withdrawal PATCH] Update error:', updateError);
        return apiError('Failed to approve withdrawal', 500);
      }

      // Send approval email
      const vendorUser = vendor.users as unknown as { email: string; full_name: string };
      await sendEmail({
        to: vendorUser.email,
        ...withdrawalApprovedEmail({
          vendorName: vendorUser.full_name,
          amount,
          referenceNumber: id,
          transactionReference: transaction_id,
        }),
      });
    } else {
      // Rejected - refund to vendor balance
      const currentBalance = parseFloat(vendor.balance || '0');
      await supabaseAdmin
        .from('vendors')
        .update({ balance: (currentBalance + amount).toString() })
        .eq('id', vendor.id);

      // Update withdrawal in Supabase
      const { error: updateError } = await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_notes: admin_notes || null,
        })
        .eq('id', id);

      if (updateError) {
        console.error('[Admin Withdrawal PATCH] Update error:', updateError);
        return apiError('Failed to reject withdrawal', 500);
      }

      // Send rejection email
      const vendorUser = vendor.users as unknown as { email: string; full_name: string };
      await sendEmail({
        to: vendorUser.email,
        ...withdrawalRejectedEmail({
          vendorName: vendorUser.full_name,
          amount,
          referenceNumber: id,
          reason: admin_notes || 'No reason provided',
        }),
      });
    }

    // Fetch updated withdrawal
    const { data: updated } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', id)
      .single();

    return apiSuccess(updated, `Withdrawal ${status}`);
  } catch (err) {
    console.error('[Admin Withdrawal PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
