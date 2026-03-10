import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiSuccess, apiError, requireAuth, getVendorForUser } from '@/lib/api-helpers';
import { mutationRateLimit } from '@/lib/ratelimit';
import { sendEmail, orderStatusEmail } from '@/lib/email';
import { z } from 'zod';

// ── GET /api/orders/[id] — Get order detail ─────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { id } = await params;

    // Get order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(
        `
        id, order_number, customer_id, 
        shipping_full_name, shipping_phone, shipping_address_line_1, 
        shipping_address_line_2, shipping_city, shipping_province, shipping_postal_code,
        subtotal, shipping_total, discount_total, total_amount,
        payment_method, payment_status, status, notes, created_at, updated_at
      `
      )
      .eq('id', id)
      .single();

    if (error || !order) {
      return apiError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Authorization check
    let isAuthorized = false;

    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'customer' && order.customer_id === user.id) {
      isAuthorized = true;
    } else if (user.role === 'vendor') {
      // Check if vendor has items in this order
      const vendor = await getVendorForUser(user.id);
      if (vendor) {
        const { data: vendorItems } = await supabaseAdmin
          .from('order_items')
          .select('id')
          .eq('order_id', id)
          .eq('vendor_id', vendor.id)
          .limit(1);

        if (vendorItems && vendorItems.length > 0) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return apiError('Forbidden — you cannot access this order', 403, 'FORBIDDEN');
    }

    // Get order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select(
        `
        id, product_id, product_name, product_thumbnail, quantity, unit_price, subtotal,
        shipping_amount, commission_rate, commission_amount, vendor_earning,
        item_status, tracking_number, shipped_at, completed_at,
        vendors!inner(id, store_name, logo_url)
      `
      )
      .eq('order_id', id);

    return apiSuccess({
      ...order,
      items: items || [],
    });
  } catch (err) {
    console.error('[Order GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH /api/orders/[id] — Update order status ────────────────────

const updateStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'completed', 'cancelled']),
  tracking_number: z.string().max(100).optional(),
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
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { status, tracking_number } = parsed.data;

    // Get order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customer_id, status')
      .eq('id', id)
      .single();

    if (!order) {
      return apiError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Authorization: vendor can update their items, admin can update any
    if (user.role === 'vendor') {
      const vendor = await getVendorForUser(user.id);
      if (!vendor) {
        return apiError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND');
      }

      // Vendor can only transition: pending→processing, processing→shipped
      if (order.status === 'pending' && status !== 'processing') {
        return apiError('Vendors can only mark pending orders as processing', 403);
      }
      if (order.status === 'processing' && status !== 'shipped') {
        return apiError('Vendors can only mark processing orders as shipped', 403);
      }
      if (order.status !== 'pending' && order.status !== 'processing') {
        return apiError('Cannot update order in current status', 403);
      }

      // Update vendor's order items
      const updateData: Record<string, unknown> = { item_status: status };
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
        if (tracking_number) {
          updateData.tracking_number = tracking_number;
        }
      }

      await supabaseAdmin
        .from('order_items')
        .update(updateData)
        .eq('order_id', id)
        .eq('vendor_id', vendor.id);
    } else if (user.role === 'admin') {
      // Admin can do any transition
      const updateData: Record<string, unknown> = {};
      if (status === 'shipped' && tracking_number) {
        updateData.tracking_number = tracking_number;
        updateData.shipped_at = new Date().toISOString();
      }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // Update all order items
      await supabaseAdmin
        .from('order_items')
        .update({ item_status: status, ...updateData })
        .eq('order_id', id);
    } else {
      return apiError('Forbidden — insufficient permissions', 403, 'FORBIDDEN');
    }

    // Update main order status
    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('id, order_number, status')
      .single();

    if (error) {
      console.error('[Order PATCH] Update error:', error);
      return apiError('Failed to update order', 500);
    }

    // Send status update email to customer
    const { data: customer } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', order.customer_id)
      .single();

    if (customer) {
      await sendEmail({
        to: customer.email,
        ...orderStatusEmail({
          customerName: customer.full_name,
          orderNumber: order.order_number,
          status: status,
          orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${id}`,
        }),
      });
    }

    return apiSuccess(updated, 'Order status updated');
  } catch (err) {
    console.error('[Order PATCH] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
