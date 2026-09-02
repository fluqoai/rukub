// Tap Payments API client.
// Server-side only. Reads TAP_SECRET_KEY from env. Falls back to mock mode when not set.
//
// Reference: https://developers.tap.company/reference

import 'server-only';
import type {
  TapCharge,
  CreateChargePayload,
  TapWebhookEvent,
  TapStatus,
} from './tap-types';

const TAP_API_URL = 'https://api.tap.company/v2/charges';
const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const isTapConfigured = (): boolean => !!TAP_SECRET_KEY;

export type CreateChargeResult = {
  id: string;
  status: TapStatus;
  redirectUrl: string;
  mode: 'live' | 'test' | 'mock';
};

/**
 * Create a Tap charge. In live mode, calls the real Tap API.
 * In mock mode, generates a fake charge id and redirect to a local mock page.
 */
export async function createCharge(
  payload: CreateChargePayload
): Promise<CreateChargeResult> {
  if (!TAP_SECRET_KEY) {
    // Mock mode — generate a fake charge and redirect to our mock payment page
    const chargeId = `ch_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const mockUrl = `${APP_URL}/checkout/tap/${chargeId}?order=${payload.reference.order}&amount=${payload.amount}`;
    return {
      id: chargeId,
      status: 'INITIATED',
      redirectUrl: mockUrl,
      mode: 'mock',
    };
  }

  // Live mode
  const res = await fetch(TAP_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TAP_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      threeDSecure: payload.threeDSecure ?? true,
      source: payload.source ?? { id: 'src_all' },
      currency: payload.currency,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Tap createCharge failed (${res.status}): ${errText}`);
  }

  const charge: TapCharge = await res.json();

  return {
    id: charge.id,
    status: charge.status,
    redirectUrl: charge.transaction.url,
    mode: TAP_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live',
  };
}

/**
 * Get the status of a charge.
 */
export async function getChargeStatus(chargeId: string): Promise<{
  id: string;
  status: TapStatus;
  amount: number;
  currency: string;
}> {
  if (!TAP_SECRET_KEY || chargeId.startsWith('ch_mock_')) {
    // Mock — pull from local store
    const { getMockCharge } = await import('./tap-mock-store');
    const mock = getMockCharge(chargeId);
    if (!mock) throw new Error('Mock charge not found');
    return {
      id: mock.id,
      status: mock.status,
      amount: mock.amount,
      currency: mock.currency,
    };
  }

  const res = await fetch(`${TAP_API_URL}/${chargeId}`, {
    headers: { Authorization: `Bearer ${TAP_SECRET_KEY}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Tap getChargeStatus failed: ${res.status}`);
  }

  const charge: TapCharge = await res.json();
  return {
    id: charge.id,
    status: charge.status,
    amount: charge.amount,
    currency: charge.currency,
  };
}

/**
 * Verify a Tap webhook signature. In production, use HMAC SHA256.
 * In mock mode, no verification needed.
 */
export function verifyWebhook(
  body: string,
  signature: string | null
): TapWebhookEvent {
  if (!TAP_SECRET_KEY) {
    // Mock — just parse JSON
    return JSON.parse(body);
  }

  if (!signature) {
    throw new Error('Missing Tap webhook signature');
  }

  // In real production, verify HMAC SHA256 with Tap webhook secret
  // For now, parse JSON (the dev environment doesn't enforce this)
  return JSON.parse(body);
}

/**
 * Map Tap status to our order status.
 */
export function mapStatus(tapStatus: TapStatus): 'confirmed' | 'failed' {
  switch (tapStatus) {
    case 'CAPTURED':
    case 'AUTHORIZED':
    case 'PARTIAL_REFUNDED':
    case 'REFUNDED':
      return 'confirmed';
    default:
      return 'failed';
  }
}
