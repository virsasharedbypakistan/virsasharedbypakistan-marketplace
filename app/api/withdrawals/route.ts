import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getVendorForUser, getPagination, paginationMeta } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── POST /api/withdrawals — Request withdrawal ──────────────────────

const createWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
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
    const parsed = createWithdrawalSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { amount, notes } = parsed.data;

    // Get platform settings for minimum withdrawal
    const { data: settings } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'min_withdrawal_amount')
      .single();

    const minAmount = parseFloat(settings?.value || '1000');

    if (amount < minAmount) {
      return apiError(
        `Minimum withdrawal amount is PKR ${minAmount}`,
        400,
        'AMOUNT_TOO_LOW'
      );
    }

    // Check vendor balance
    const { data: vendorData } = await supabaseAdmin
      .from('vendors')
      .select('balance')
      .eq('id', vendor.id)
      .single();

    const balance = parseFloat(vendorData?.balance || '0');

    if (amount > balance) {
      return apiError(
        `Insufficient balance. Available: PKR ${balance}`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    // Get vendor bank details
    const { data: bankDetails } = await supabaseAdmin
      .from('vendor_bank_details')
      .select('*')
      .eq('vendor_id', vendor.id)
      .single();

    if (!bankDetails) {
      return apiError(
        'Bank details not found. Please add bank details first.',
        400,
        'NO_BANK_DETAILS'
      );
    }

    // Create withdrawal request in Supabase
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from('withdrawal_requests')
      .insert({
        vendor_id: vendor.id,
        amount: amount.toString(),
        status: 'pending',
        requested_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Withdrawals POST] Insert error:', insertError);
      return apiError('Failed to create withdrawal request', 500);
    }

    // Deduct from vendor balance (hold the amount)
    await supabaseAdmin
      .from('vendors')
      .update({ balance: (balance - amount).toString() })
      .eq('id', vendor.id);

    return apiSuccess(withdrawal, 'Withdrawal request submitted', 201);
  } catch (err) {
    console.error('[Withdrawals POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── GET /api/withdrawals — Get vendor's withdrawal history ──────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('vendor');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const vendor = await getVendorForUser(user.id);
    if (!vendor) {
      return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');

    // Query Supabase
    let query = supabaseAdmin
      .from('withdrawal_requests')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: withdrawals, count, error } = await query.range(from, to);

    if (error) {
      console.error('[Withdrawals GET] Query error:', error);
      return apiError('Failed to fetch withdrawals', 500);
    }

    return apiSuccess({
      data: withdrawals || [],
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Withdrawals GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
