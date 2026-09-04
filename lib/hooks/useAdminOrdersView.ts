'use client';
import { useMemo } from 'react';
import { useDbOrders } from './useDbOrders';

// One authoritative source for every admin summary, never browser checkout history.
export function useAdminOrdersView() {
  const result = useDbOrders({ limit: 1000 });
  const orders = useMemo(() => result.orders.map(o => ({
    ...o, total: Number(o.total), createdAt: o.placed_at,
    shipping: { phone: o.shipping_phone, fullName: o.shipping_full_name, email: o.shipping_email || '', city: o.shipping_city },
    items: (o.items || []).map(i => ({ productId: i.product_id, shortName: i.product_short_name || i.product_name, quantity: i.quantity, price: Number(i.price) })),
  })), [result.orders]);
  return { ...result, orders };
}
