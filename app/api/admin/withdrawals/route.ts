import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getPagination, paginationMeta } from '@/lib/api-helpers';
import { sendEmail, withdrawalApprovedEmail, withdrawalRejectedEmail } from '@/lib/email';

// ── GET /api/admin/withdrawals — Get all withdrawal requests ────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');

    // Query Supabase
    let query = supabaseAdmin
      .from('withdrawal_requests')
      .select('*', { count: 'exact' })
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: withdrawals, count, error } = await query.range(from, to);

    if (error) {
      console.error('[Admin Withdrawals GET] Query error:', error);
      return apiError('Failed to fetch withdrawals', 500);
    }

    // Enrich with vendor details
    const enriched = await Promise.all(
      (withdrawals || []).map(async (w) => {
        const { data: vendor } = await supabaseAdmin
          .from('vendors')
          .select('store_name, user_id, users!inner(email, full_name)')
          .eq('id', w.vendor_id)
          .single();

        const { data: bankDetails } = await supabaseAdmin
          .from('vendor_bank_details')
          .select('*')
          .eq('vendor_id', w.vendor_id)
          .single();

        return {
          ...w,
          vendor,
          bankDetails,
        };
      })
    );

    return apiSuccess({
      data: enriched,
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Admin Withdrawals GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
