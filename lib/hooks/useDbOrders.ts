'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'tap' | 'tabby';

export type OrderItem = {
  product_id: string;
  product_name: string;
  product_short_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: string | null;
  metadata?: { variant_id?: string; image?: string; supplier_items?: Array<{ pid: string; vid: string; sku: string; name: string; quantity: number }> };
};

export type Order = {
  id: string;
  customer_id?: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status?: string | null;
  cj_order_id?: string | null;
  tracking_number?: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency?: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_email?: string | null;
  shipping_city: string;
  shipping_district: string;
  shipping_notes?: string | null;
  cj_error?: string | null;
  placed_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type CreateOrderInput = {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
    expectedPrice: number;
  }>;
  shipping: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    district: string;
    notes?: string;
  };
  paymentMethod: 'cod';
};

// ==================== HOOKS ====================

/**
 * Fetch all orders (admin) - from /api/orders
 */
export function useDbOrders(opts: { status?: string; search?: string; limit?: number } = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.status) params.set('status', opts.status);
      if (opts.search) params.set('q', opts.search);
      if (opts.limit) params.set('limit', String(opts.limit));

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.status, opts.search, opts.limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, error, refetch };
}

/**
 * Fetch a single order by ID
 */
export function useDbOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch order');
      }
      setOrder(data.order);
      setItems(data.order?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) refetch();
  }, [refetch, orderId]);

  const orderWithItems = order ? { ...order, items } : null;

  return { order: orderWithItems, loading, error, refetch };
}

/**
 * Create an order via API
 */
export async function createDbOrder(input: CreateOrderInput): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create order');
  }
  return data.order as Order;
}

/**
 * Update an order via API
 */
export async function updateDbOrder(
  orderId: string,
  updates: {
    status?: OrderStatus;
    trackingNumber?: string;
    cjOrderId?: string;
    cjError?: string;
    paymentStatus?: string;
  }
): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update order');
  }
  return data.order as Order;
}

// ==================== NOTIFICATION SENDER (client-side, mock mode only) ====================
