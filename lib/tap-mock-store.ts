// In-memory mock store for Tap charges when running in mock mode.
// In production, this would not exist — Tap holds the charges.
//
// Uses globalThis to persist across Next.js dev mode HMR re-imports.

import type { TapStatus } from './tap-types';

export type MockCharge = {
  id: string;
  amount: number;
  currency: string;
  status: TapStatus;
  customer: {
    first_name: string;
    email: string;
    phone: string;
  };
  reference: { order: string };
  createdAt: number;
};

const globalForMock = globalThis as unknown as { __mockCharges?: Map<string, MockCharge> };
const mockCharges = globalForMock.__mockCharges ?? new Map<string, MockCharge>();
if (process.env.NODE_ENV !== 'production') {
  globalForMock.__mockCharges = mockCharges;
}

export function createMockCharge(charge: Omit<MockCharge, 'createdAt' | 'status'>): MockCharge {
  const full: MockCharge = {
    ...charge,
    status: 'INITIATED',
    createdAt: Date.now(),
  };
  mockCharges.set(full.id, full);
  return full;
}

export function getMockCharge(id: string): MockCharge | undefined {
  return mockCharges.get(id);
}

export function updateMockChargeStatus(id: string, status: TapStatus): MockCharge | null {
  const charge = mockCharges.get(id);
  if (!charge) return null;
  charge.status = status;
  return charge;
}
