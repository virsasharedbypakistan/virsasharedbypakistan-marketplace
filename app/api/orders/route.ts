import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  apiSuccess,
  apiError,
  requireAuth,
  requireNonGuest,
  getPagination,
  paginationMeta,
  getVendorForUser,
} from '@/lib/api-helpers';
import { orderRateLimit } from '@/lib/ratelimit';
import { sendEmail, orderPlacedEmail, vendorOrderEmail } from '@/lib/email';
import { z } from 'zod';

// ── GET /api/orders — Get user's orders ─────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireNonGuest();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const { searchParams } = request.nextUrl;
    const { page, limit } = getPagination(searchParams);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select(
        `
        id, order_number, customer_id, shipping_full_name, shipping_city,
        subtotal, shipping_total, discount_total, total_amount,
        payment_method, payment_status, status, created_at, updated_at,
        order_items(
          id, product_id, product_name, product_thumbnail, quantity, unit_price,
          vendors!inner(store_name)
        )
      `,
        { count: 'exact' }
      )
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: orders, count, error } = await query;

    if (error) {
      console.error('[Orders GET] Query error:', error);
      return apiError('Failed to fetch orders', 500);
    }

    const mappedOrders = (orders || []).map((order: any) => ({
      ...order,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name,
        price: item.unit_price,
        quantity: item.quantity,
        thumbnail_url: item.product_thumbnail,
        vendor_name: item.vendors?.store_name || 'Vendor',
      })),
    }));

    return apiSuccess({
      data: mappedOrders,
      pagination: paginationMeta(page, limit, count || 0),
    });
  } catch (err) {
    console.error('[Orders GET] Exception:', err);
    return apiError('Internal server error', 500);
  }
}

// ── POST /api/orders — Create order (checkout) ──────────────────────

const createOrderSchema = z.object({
  shipping_address: z.object({
    full_name: z.string().min(2).max(120).trim(),
    phone: z.string().min(10).max(20).trim(),
    address_line_1: z.string().min(5).max(255).trim(),
    address_line_2: z.string().max(255).optional(),
    city: z.string().min(2).max(100).trim(),
    province: z.string().min(2).max(100).trim(),
    postal_code: z.string().max(20).optional(),
  }),
  contact_email: z.string().email('Invalid email').optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'Cart cannot be empty'),
  notes: z.string().max(1000).optional(),
});

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `VRS-${dateStr}-${random}`;
}

async function getCommissionRate(
  productId: string,
  vendorId: string,
  categoryId: string | null
): Promise<number> {
  // Priority 1: Vendor-specific commission
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('commission_type, commission_rate')
    .eq('id', vendorId)
    .single();

  if (vendor?.commission_type === 'custom' && vendor.commission_rate) {
    return parseFloat(vendor.commission_rate.toString());
  }

  // Priority 2: Category-specific commission
  if (categoryId) {
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('commission_rate')
      .eq('id', categoryId)
      .single();

    if (category?.commission_rate) {
      return parseFloat(category.commission_rate.toString());
    }
  }

  // Priority 3: Global commission
  const { data: setting } = await supabaseAdmin
    .from('platform_settings')
    .select('value')
    .eq('key', 'global_commission_rate')
    .single();

  return setting ? parseFloat(setting.value) : 10.0;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    // Rate limit
    const { success: allowed } = await orderRateLimit.limit(user.id);
    if (!allowed) {
      return apiError('Too many order requests. Try again later.', 429, 'RATE_LIMITED');
    }

    // Parse body
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
    }

    const { shipping_address, items, notes, contact_email } = parsed.data;

    // Validate all products and check stock
    const productIds = items.map((i) => i.product_id);
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, vendor_id, category_id, name, price, sale_price, stock, thumbnail_url, status')
      .in('id', productIds)
      .eq('status', 'active');

    if (!products || products.length !== items.length) {
      return apiError('One or more products not found or unavailable', 400, 'INVALID_PRODUCTS');
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || product.stock < item.quantity) {
        return apiError(
          `Insufficient stock for product: ${product?.name || 'Unknown'}`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)!;
      const unitPrice = product.sale_price ?? product.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      // Get commission rate
      const commissionRate = await getCommissionRate(
        product.id,
        product.vendor_id,
        product.category_id
      );
      const commissionAmount = (itemSubtotal * commissionRate) / 100;
      const vendorEarning = itemSubtotal - commissionAmount;

      orderItems.push({
        product_id: product.id,
        vendor_id: product.vendor_id,
        product_name: product.name,
        product_thumbnail: product.thumbnail_url,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        vendor_earning: vendorEarning,
        item_status: 'pending',
      });
    }

    // TODO: Calculate shipping (for now, flat rate)
    const shippingTotal = 150.0;
    const totalAmount = subtotal + shippingTotal;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        shipping_full_name: shipping_address.full_name,
        shipping_phone: shipping_address.phone,
        shipping_address_line_1: shipping_address.address_line_1,
        shipping_address_line_2: shipping_address.address_line_2 || null,
        shipping_city: shipping_address.city,
        shipping_province: shipping_address.province,
        shipping_postal_code: shipping_address.postal_code || null,
        subtotal,
        shipping_total: shippingTotal,
        discount_total: 0,
        total_amount: totalAmount,
        payment_method: 'cod',
        payment_status: 'pending',
        status: 'pending',
        notes: notes || null,
      })
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('[Orders POST] Order insert error:', orderError);
      return apiError('Failed to create order', 500);
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('[Orders POST] Order items error:', itemsError);
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return apiError('Failed to create order items', 500);
    }

    // Deduct stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)!;
      await supabaseAdmin
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', product.id);
    }

    // Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);

    // Send order confirmation email
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const notificationEmail = contact_email || user.email;

    const customerEmailResult = await sendEmail({
      to: notificationEmail,
      ...orderPlacedEmail({
        customerName: userProfile?.full_name || 'Customer',
        orderNumber: order.order_number,
        totalAmount,
        orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}`,
      }),
    });

    if (!customerEmailResult.success) {
      console.error('[Orders POST] Customer email failed:', customerEmailResult.error);
    }

    // Notify vendors
    const vendorIds = Array.from(new Set(orderItems.map((item) => item.vendor_id)));
    const { data: vendors } = await supabaseAdmin
      .from('vendors')
      .select('id, store_name, email')
      .in('id', vendorIds);

    if (vendors && vendors.length > 0) {
      const itemsByVendor = vendorIds.reduce<Record<string, typeof orderItems>>((acc, vendorId) => {
        acc[vendorId] = orderItems.filter((item) => item.vendor_id === vendorId);
        return acc;
      }, {});

      await Promise.all(
        vendors
          .filter((vendor) => vendor.email)
          .map(async (vendor) => {
            const vendorItems = itemsByVendor[vendor.id] || [];
            const emailResult = await sendEmail({
              to: vendor.email,
              ...vendorOrderEmail({
                vendorName: vendor.store_name,
                orderNumber: order.order_number,
                items: vendorItems.map((item) => ({
                  name: item.product_name,
                  quantity: item.quantity,
                  subtotal: item.subtotal,
                })),
                orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard/orders`,
              }),
            });

            if (!emailResult.success) {
              console.error('[Orders POST] Vendor email failed:', emailResult.error);
            }
          })
      );
    }

    return apiSuccess(
      {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: totalAmount,
        status: 'pending',
      },
      'Order placed successfully',
      201
    );
  } catch (err) {
    console.error('[Orders POST] Exception:', err);
    return apiError('Internal server error', 500);
  }
}
