"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Package, MapPin, Truck } from "lucide-react";

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_thumbnail: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_status: string;
  tracking_number: string | null;
  vendors: { id: string; store_name: string; logo_url?: string | null } | null;
};

type OrderDetail = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line_1: string;
  shipping_address_line_2: string | null;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string | null;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  total_amount: number;
  items: OrderItem[];
};

const formatStatus = (status: string) => (status === "completed" ? "delivered" : status);

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to load order");
          return;
        }

        const data = await res.json();
        setOrder(data.data || null);
      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-virsa-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-8 text-center">
        <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">{error || "Order not found"}</p>
        <Link href="/dashboard/orders" className="text-sm font-bold text-virsa-primary hover:underline mt-3 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/orders" className="text-xs text-gray-500 hover:text-virsa-primary">Back to Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-2">Order #{order.order_number}</h1>
        </div>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100 capitalize">
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-virsa-primary mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
            <p className="text-sm text-gray-700">
              {order.shipping_full_name}, {order.shipping_phone}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_address_line_1}
              {order.shipping_address_line_2 ? `, ${order.shipping_address_line_2}` : ""}, {order.shipping_city}, {order.shipping_province}
              {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Placed</p>
            <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Subtotal</p>
            <p className="text-sm font-medium text-gray-900">Rs {order.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Shipping</p>
            <p className="text-sm font-medium text-gray-900">Rs {order.shipping_total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
            <p className="text-sm font-bold text-gray-900">Rs {order.total_amount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Truck className="w-4 h-4 text-virsa-primary" />
          <h2 className="text-lg font-bold text-gray-900">Items</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No items found.</div>
          )}
          {order.items.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                <Image
                  src={item.product_thumbnail || "/product_headphones.png"}
                  alt={item.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-gray-500 mt-1">Sold by: {item.vendors?.store_name || "Vendor"}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">Status: {formatStatus(item.item_status)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Rs {item.unit_price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                <p className="text-xs text-gray-500">Subtotal: Rs {item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
