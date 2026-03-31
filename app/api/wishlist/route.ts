import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireNonGuest } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/wishlist — Get wishlist items ──────────────────────────

export async function GET() {
  try {
    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { data: items, error } = await supabaseAdmin
      .from('wishlist_items')
      .select(
        `
        id, added_at,
        products!inner(
          id, name, slug, price, sale_price, stock, images, thumbnail_url,
          status, average_rating, total_reviews,
          vendors!inner(id, store_name, logo_url)
        )
      `
      )
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('[Wishlist GET] Query error:', error);
      return apiError('Failed to fetch wishlist', 500);
    }

    return apiSuccess(items || []);
  } catch (err) {
    console.error('[Wishlist GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/wishlist — Add to wishlist ────────────────────────────

const addToWishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = addToWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { product_id } = parsed.data;

    // Verify product exists and is active
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, status')
      .eq('id', product_id)
      .eq('status', 'active')
      .single();

    if (!product) {
      return apiError('Product not found or unavailable', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return apiSuccess({ wishlist_item_id: existing.id }, 'Already in wishlist');
    }

    // Add to wishlist
    const { data: wishlistItem, error } = await supabaseAdmin
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Wishlist POST] Insert error:', error);
      return apiError('Failed to add to wishlist', 500);
    }

    return apiSuccess(
      { wishlist_item_id: wishlistItem.id },
      'Added to wishlist',
      201
    );
  } catch (err) {
    console.error('[Wishlist POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
