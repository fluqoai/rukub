'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Audience } from './products';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  shortName: string;
  price: number;
  quantity: number;
  audience: Audience;
  iconName: string; // lucide icon name, used for placeholder
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i
            ),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'rukub-cart',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Selectors
export const selectTotalItems = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

export const FREE_SHIPPING_THRESHOLD = 199;
export const SHIPPING_COST = 15;

export const selectShipping = (state: CartState) =>
  selectTotalPrice(state) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

export const selectGrandTotal = (state: CartState) =>
  selectTotalPrice(state) + selectShipping(state);
