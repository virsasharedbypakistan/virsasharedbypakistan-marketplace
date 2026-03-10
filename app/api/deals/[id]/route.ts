import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError } from '@/lib/api-helpers';

// ── GET /api/deals/[id] — Deal detail ───────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .select(
        `
        *,
        products!inner(
          id, name, slug, description, thumbnail_url, 
          price, stock, category_id, vendor_id
        ),
        vendors!inner(id, store_name, logo_url, average_rating)
      `
      )
      .eq('id', id)
      .single();

    if (error || !deal) {
      return apiError('Deal not found', 404, 'DEAL_NOT_FOUND');
    }

    return apiSuccess(deal);
  } catch (err) {
    console.error('[Deal GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
