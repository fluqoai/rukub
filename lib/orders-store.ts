'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './cart-store';

export type OrderStatus = 'confirmed' | 'pending_cj_sync' | 'manual_followup' | 'cancelled';

export type ShippingInfo = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  notes: string;
};

export type PaymentMethod = 'cod' | 'tap' | 'tabby';

export type Order = {
  id: string;             // local id
  cjOrderId?: string;     // returned from CJ
  trackingNumber?: string;
  status: OrderStatus;
  items: CartItem[];
  shipping: ShippingInfo;
  payment: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;     // ISO
  cjError?: string;      // if status is manual_followup
};

type OrdersState = {
  orders: Order[];
  hydrated: boolean;
  setHydrated: () => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  getOrder: (id: string) => Order | undefined;
  getOrderByCJ: (cjOrderId: string) => Order | undefined;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, patch) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
      getOrderByCJ: (cjOrderId) => get().orders.find((o) => o.cjOrderId === cjOrderId),
    }),
    {
      name: 'rukub-orders',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
