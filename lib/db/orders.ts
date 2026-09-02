// Orders service — Supabase-backed
// All functions are server-side (use 'server-only').
// Used by admin and customer flows.

import 'server-only';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export type CreateOrderInput = {
  id: string;                     // local order id (RKB-xxx)
  items: Array<{
    productId: string;
    productName: string;
    productShortName: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  shipping: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    district: string;
    notes?: string;
  };
  paymentMethod: 'cod' | 'tap' | 'tabby';
  subtotal: number;
  shippingCost: number;
  total: number;
  cjOrderId?: string;
  trackingNumber?: string;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
};

/**
 * Create a new order in the database.
 * Uses the admin client to bypass RLS for system-initiated orders.
 */
export async function createOrder(input: CreateOrderInput) {
  const supabase = createAdminSupabase();

  // 1. Insert the order (trigger auto-creates/updates customer)
  const orderInsert: OrderInsert = {
    id: input.id,
    status: input.status ?? 'pending',
    payment_method: input.paymentMethod,
    subtotal: input.subtotal,
    shipping_cost: input.shippingCost,
    total: input.total,
    currency: 'SAR',
    shipping_full_name: input.shipping.fullName,
    shipping_phone: input.shipping.phone,
    shipping_email: input.shipping.email ?? null,
    shipping_city: input.shipping.city,
    shipping_district: input.shipping.district,
    shipping_notes: input.shipping.notes ?? null,
    cj_order_id: input.cjOrderId ?? null,
    tracking_number: input.trackingNumber ?? null,
    shipping_address: {
      city: input.shipping.city,
      district: input.shipping.district,
      notes: input.shipping.notes,
    },
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderInsert)
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // 2. Insert order items
  const items: OrderItemInsert[] = input.items.map((item) => ({
    order_id: input.id,
    product_id: item.productId,
    product_name: item.productName,
    product_short_name: item.productShortName,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
    variant: item.variant ?? null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items);

  if (itemsError) {
    // Rollback the order if items fail
    await supabase.from('orders').delete().eq('id', input.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return order as OrderRow;
}

/**
 * Get a single order with its items.
 */
export async function getOrder(orderId: string) {
  const supabase = createAdminSupabase();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  return { ...order, items: items ?? [] };
}

/**
 * List orders with optional filters.
 */
export async function listOrders(opts: {
  limit?: number;
  status?: string;
  search?: string;
  customerId?: string;
} = {}) {
  const supabase = createAdminSupabase();

  let query = supabase
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false });

  if (opts.status && opts.status !== 'all') {
    query = query.eq('status', opts.status);
  }
  if (opts.customerId) {
    query = query.eq('customer_id', opts.customerId);
  }
  if (opts.search) {
    query = query.or(
      `id.ilike.%${opts.search}%,shipping_phone.ilike.%${opts.search}%,shipping_full_name.ilike.%${opts.search}%,cj_order_id.ilike.%${opts.search}%`
    );
  }
  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Update order status.
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  extras?: {
    trackingNumber?: string;
    cjOrderId?: string;
    cjError?: string;
    paymentStatus?: string;
  }
) {
  const supabase = createAdminSupabase();

  const updates: Partial<OrderRow> = { status };
  if (extras?.trackingNumber !== undefined) updates.tracking_number = extras.trackingNumber;
  if (extras?.cjOrderId !== undefined) updates.cj_order_id = extras.cjOrderId;
  if (extras?.cjError !== undefined) updates.cj_error = extras.cjError;
  if (extras?.paymentStatus !== undefined) updates.payment_status = extras.paymentStatus;

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }
  return data as OrderRow;
}

/**
 * Get admin dashboard stats.
 */
export async function getOrderStats() {
  const supabase = createAdminSupabase();

  // Total orders
  const { count: total } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Confirmed orders
  const { count: confirmed } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  // Revenue (sum of confirmed orders)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('status', 'confirmed');

  const revenue = (revenueData ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  // Unique customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id');

  // Top products
  const { data: topProducts } = await supabase
    .from('top_products')
    .select('*')
    .order('revenue', { ascending: false })
    .limit(5);

  return {
    total: total ?? 0,
    confirmed: confirmed ?? 0,
    revenue,
    uniqueCustomers: customers?.length ?? 0,
    topProducts: topProducts ?? [],
  };
}
