import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole } from '@/lib/api-helpers';

// ── GET /api/admin/products — Get all products for admin ────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(
        `id, name, slug, price, sale_price, stock, images, thumbnail_url,
         status, is_featured, show_on_homepage, average_rating, total_reviews, created_at,
         vendors!inner(id, store_name, status),
         categories(id, name, slug)`
      )
      .eq('status', 'active')
      .eq('vendors.status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Products GET] Query error:', error);
      return apiError('Failed to fetch products', 500);
    }

    return apiSuccess(products || []);
  } catch (err) {
    console.error('[Admin Products GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
