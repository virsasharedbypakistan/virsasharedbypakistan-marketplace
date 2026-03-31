import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireNonGuest, requireRole } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

// ── PUT /api/reviews/[id] — Customer edits own review ───────────────

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional().nullable(),
  comment: z.string().max(5000).optional().nullable(),
  images: z.array(z.string().url()).max(5).optional(),
});

async function handleUpdate(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Get review (ownership check)
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('id, user_id, product_id')
      .eq('id', id)
      .single();

    if (!review) {
      return apiError('Review not found', 404, 'NOT_FOUND');
    }

    if (review.user_id !== user.id) {
      return apiError('You can only edit your own reviews', 403, 'FORBIDDEN');
    }

    // Parse body
    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.comment !== undefined) updateData.body = data.comment;
    if (data.images !== undefined) updateData.images = data.images;

    const { data: updated, error } = await supabaseAdmin
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Reviews PUT] Update error:', error);
      return apiError('Failed to update review', 500);
    }

    // Recalculate product average rating if rating changed
    if (data.rating !== undefined) {
      const { data: ratingAgg } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('product_id', review.product_id)
        .eq('is_approved', true);

      if (ratingAgg && ratingAgg.length > 0) {
        const avgRating =
          ratingAgg.reduce((sum, r) => sum + r.rating, 0) / ratingAgg.length;

        await supabaseAdmin
          .from('products')
          .update({
            average_rating: Math.round(avgRating * 100) / 100,
            total_reviews: ratingAgg.length,
          })
          .eq('id', review.product_id);
      }
    }

    return apiSuccess(updated, 'Review updated');
  } catch (err) {
    console.error('[Reviews PUT] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleUpdate(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleUpdate(request, context);
}

// ── DELETE /api/reviews/[id] — Delete review (owner or admin) ───────

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await mutationRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Get review
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('id, user_id, product_id')
      .eq('id', id)
      .single();

    if (!review) {
      return apiError('Review not found', 404, 'NOT_FOUND');
    }

    // Only owner or admin can delete
    if (review.user_id !== user.id && user.role !== 'admin') {
      return apiError('You can only delete your own reviews', 403, 'FORBIDDEN');
    }

    const productId = review.product_id;

    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Reviews DELETE] Delete error:', error);
      return apiError('Failed to delete review', 500);
    }

    // Recalculate product average rating
    const { data: ratingAgg } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (ratingAgg) {
      const avgRating =
        ratingAgg.length > 0
          ? ratingAgg.reduce((sum, r) => sum + r.rating, 0) / ratingAgg.length
          : 0;

      await supabaseAdmin
        .from('products')
        .update({
          average_rating: Math.round(avgRating * 100) / 100,
          total_reviews: ratingAgg.length,
        })
        .eq('id', productId);
    }

    return apiSuccess(null, 'Review deleted');
  } catch (err) {
    console.error('[Reviews DELETE] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
