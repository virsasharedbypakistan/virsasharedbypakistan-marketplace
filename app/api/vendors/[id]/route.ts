import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, getPagination } from '@/lib/api-helpers';

// ── GET /api/vendors/[id] — Vendor public profile ───────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);

    // Get vendor profile
    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .select(
        `
        id, store_name, store_slug, description, logo_url, banner_url,
        phone, email, average_rating, total_reviews, total_sales, created_at
      `
      )
      .eq('id', id)
      .eq('approval_status', 'approved')
      .single();

    if (error || !vendor) {
      return apiError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
    }

    // Get vendor's products (paginated)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, count } = await supabaseAdmin
      .from('products')
      .select(
        `
        id, name, slug, short_description, price, sale_price, stock,
        images, thumbnail_url, average_rating, total_reviews, total_sold
      `,
        { count: 'exact' }
      )
      .eq('vendor_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    return apiSuccess({
      ...vendor,
      product_count: count || 0,
      products: products || [],
    });
  } catch (err) {
    console.error('[Vendor GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
