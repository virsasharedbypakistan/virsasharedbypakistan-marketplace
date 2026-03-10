import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

// ── PATCH /api/cart/[id] — Update cart item quantity ────────────────

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
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
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { quantity } = parsed.data;

    // If quantity is 0, delete the item
    if (quantity === 0) {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[Cart PATCH] Delete error:', error);
        return apiError('Failed to remove item', 500);
      }

      return apiSuccess(null, 'Item removed from cart');
    }

    // Get cart item with product info
    const { data: cartItem } = await supabaseAdmin
      .from('cart_items')
      .select('id, product_id, products!inner(stock, status)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!cartItem) {
      return apiError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    const product = cartItem.products as unknown as { stock: number; status: string };

    // Check stock availability
    if (product.status !== 'active') {
      return apiError('Product is no longer available', 400, 'PRODUCT_UNAVAILABLE');
    }

    if (quantity > product.stock) {
      return apiError(
        `Only ${product.stock} item(s) available in stock`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    // Update quantity
    const { data: updated, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[Cart PATCH] Update error:', error);
      return apiError('Failed to update cart item', 500);
    }

    return apiSuccess(updated, 'Cart updated');
  } catch (err) {
    console.error('[Cart PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── DELETE /api/cart/[id] — Remove cart item ────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Cart DELETE] Delete error:', error);
      return apiError('Failed to remove item', 500);
    }

    return apiSuccess(null, 'Item removed from cart');
  } catch (err) {
    console.error('[Cart DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
