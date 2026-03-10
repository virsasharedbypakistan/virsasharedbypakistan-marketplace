import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── GET /api/cart — Get cart items ──────────────────────────────────

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { data: items, error } = await supabaseAdmin
      .from('cart_items')
      .select(
        `id, quantity, added_at,
         products!inner(id, name, slug, price, sale_price, stock, images, thumbnail_url, status),
         vendors!inner(id, store_name, logo_url)`
      )
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('[Cart GET] Query error:', error);
      return apiError('Failed to fetch cart', 500);
    }

    // Calculate totals
    const cartItems = (items || []).map((item) => {
      const product = item.products as unknown as {
        id: string;
        price: number;
        sale_price: number | null;
        stock: number;
        status: string;
      };
      const effectivePrice = product.sale_price ?? product.price;
      return {
        ...item,
        effective_price: effectivePrice,
        line_total: effectivePrice * item.quantity,
      };
    });

    const total = cartItems.reduce((sum, item) => sum + item.line_total, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return apiSuccess({
      items: cartItems,
      total,
      item_count: itemCount,
    });
  } catch (err) {
    console.error('[Cart GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/cart — Add item to cart ───────────────────────────────

const addToCartSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
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

    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { product_id, quantity } = parsed.data;

    // Verify product exists and is active
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id, stock, status')
      .eq('id', product_id)
      .eq('status', 'active')
      .single();

    if (!product) {
      return apiError('Product not found or unavailable', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock < quantity) {
      return apiError(
        `Only ${product.stock} item(s) available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Check if already in cart — upsert
    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return apiError(
          `Cannot add more. Only ${product.stock} available (${existingItem.quantity} already in cart)`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      const { data: updated, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('[Cart POST] Update error:', error);
        return apiError('Failed to update cart', 500);
      }

      return apiSuccess(updated, 'Cart updated');
    }

    // Insert new cart item
    const { data: cartItem, error } = await supabaseAdmin
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id,
        vendor_id: product.vendor_id,
        quantity,
      })
      .select()
      .single();

    if (error) {
      console.error('[Cart POST] Insert error:', error);
      return apiError('Failed to add to cart', 500);
    }

    return apiSuccess(cartItem, 'Added to cart', 201);
  } catch (err) {
    console.error('[Cart POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/cart — Clear entire cart ─────────────────────────────

export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('[Cart DELETE] Delete error:', error);
      return apiError('Failed to clear cart', 500);
    }

    return apiSuccess(null, 'Cart cleared');
  } catch (err) {
    console.error('[Cart DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
