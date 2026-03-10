import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  apiSuccess,
  apiError,
  requireAuth,
  getPagination,
  paginationMeta,
} from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/reviews — Get product reviews ──────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get('product_id');
    const { page, limit } = getPagination(searchParams);

    if (!productId) {
      return apiError('product_id query parameter required', 400, 'MISSING_PRODUCT_ID');
    }

    let query = supabaseAdmin
      .from('reviews')
      .select(
        `
        id, rating, title, body, images, helpful_count, created_at, updated_at,
        users!inner(id, full_name, avatar_url)
      `,
        { count: 'exact' }
      )
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: reviews, count, error } = await query;

    if (error) {
      console.error('[Reviews GET] Query error:', error);
      return apiError('Failed to fetch reviews', 500);
    }

    // Get product rating summary
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('average_rating, total_reviews')
      .eq('id', productId)
      .single();

    return apiSuccess({
      data: reviews || [],
      average_rating: product?.average_rating || 0,
      total_reviews: product?.total_reviews || 0,
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Reviews GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/reviews — Customer posts review ───────────────────────

const createReviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  order_item_id: z.string().uuid('Invalid order item ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    // Verify order item exists and belongs to user (verified purchase)
    const { data: orderItem } = await supabaseAdmin
      .from('order_items')
      .select(
        `
        id, product_id, item_status,
        orders!inner(customer_id)
      `
      )
      .eq('id', data.order_item_id)
      .eq('product_id', data.product_id)
      .single();

    if (!orderItem) {
      return apiError('Order item not found', 404, 'ORDER_ITEM_NOT_FOUND');
    }

    const order = orderItem.orders as unknown as { customer_id: string };
    if (order.customer_id !== user.id) {
      return apiError('You can only review products you have purchased', 403, 'NOT_VERIFIED_PURCHASE');
    }

    if (orderItem.item_status !== 'completed') {
      return apiError('You can only review completed orders', 400, 'ORDER_NOT_COMPLETED');
    }

    // Check if already reviewed
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', data.product_id)
      .single();

    if (existingReview) {
      return apiError('You have already reviewed this product', 409, 'REVIEW_EXISTS');
    }

    // Create review
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: data.product_id,
        user_id: user.id,
        order_item_id: data.order_item_id,
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
        images: data.images || null,
        is_approved: true, // Auto-approve for now
      })
      .select()
      .single();

    if (error) {
      console.error('[Reviews POST] Insert error:', error);
      return apiError('Failed to post review', 500);
    }

    // Trigger will update product.average_rating and product.total_reviews

    return apiSuccess(review, 'Review posted successfully', 201);
  } catch (err) {
    console.error('[Reviews POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
