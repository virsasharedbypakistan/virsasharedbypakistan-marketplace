import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireRole, getPagination, paginationMeta } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── POST /api/admin/deals — Admin creates deal ──────────────────────

const createDealSchema = z.object({
  product_id: z.string().uuid(),
  discount_percentage: z.number().min(1).max(99),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  is_active: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = createDealSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { product_id, discount_percentage, start_date, end_date, is_active } = parsed.data;

    // Get product
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id, price')
      .eq('id', product_id)
      .single();

    if (!product) {
      return apiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Validate dates
    if (new Date(end_date) <= new Date(start_date)) {
      return apiError('End date must be after start date', 400, 'INVALID_DATES');
    }

    // Calculate deal price
    const originalPrice = parseFloat(product.price);
    const dealPrice = originalPrice * (1 - discount_percentage / 100);

    // Create deal
    const { data: deal, error } = await supabaseAdmin
      .from('deals')
      .insert({
        product_id,
        vendor_id: product.vendor_id,
        discount_percentage,
        original_price: originalPrice.toString(),
        deal_price: dealPrice.toString(),
        start_date,
        end_date,
        is_active: is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin Deals POST] Insert error:', error);
      return apiError('Failed to create deal', 500);
    }

    return apiSuccess(deal, 'Deal created successfully', 201);
  } catch (err) {
    console.error('[Admin Deals POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── GET /api/admin/deals — Get all deals ────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole('admin');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('deals')
      .select(
        `
        *,
        products!inner(id, name, thumbnail_url),
        vendors!inner(id, store_name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    const now = new Date().toISOString();

    if (status === 'active') {
      query = query.eq('is_active', true).lte('start_date', now).gte('end_date', now);
    } else if (status === 'expired') {
      query = query.lt('end_date', now);
    } else if (status === 'upcoming') {
      query = query.gt('start_date', now);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) {
      console.error('[Admin Deals GET] Query error:', error);
      return apiError('Failed to fetch deals', 500);
    }

    return apiSuccess({
      data: data || [],
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Admin Deals GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
