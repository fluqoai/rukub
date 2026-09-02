// Tap Payments API types — based on v2.0 of their public API.
// Reference: https://developers.tap.company/reference/api-reference

export type TapCurrency = 'SAR' | 'KWD' | 'USD' | 'AED' | 'BHD';

export type TapStatus =
  | 'INITIATED'
  | 'IN_PROGRESS'
  | 'CAPTURED'
  | 'AUTHORIZED'
  | 'FAILED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED'
  | 'VOID'
  | 'ATTEMPTED_TO_CAPTURE'
  | 'EXPIRED';

export type TapCharge = {
  id: string;                          // charge id
  status: TapStatus;
  amount: number;                       // in major units (e.g. 250.00)
  currency: TapCurrency;
  threeDSecure: boolean;
  save_card: boolean;
  description: string;
  metadata: Record<string, string>;
  reference: { transaction: string; order: string };
  transaction: {
    timezone: string;
    created: string;                    // ISO date
    expiry: { period: number; type: string };
    asof: number;
    url: string;                        // redirect URL for customer
  };
  response?: {
    code: string;
    message: string;
  };
  customer: {
    id?: string;
    first_name: string;
    last_name?: string;
    email: string;
    phone: { country_code: string; number: string };
  };
  source: { id: string; type?: string };
  redirect: { url: string; status?: string };
  post?: { url: string; status?: string };
  receipt?: { email: boolean; sms: boolean };
};

export type CreateChargePayload = {
  amount: number;
  currency: TapCurrency;
  threeDSecure?: boolean;
  description: string;
  reference: { transaction: string; order: string };
  customer: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone: { country_code: string; number: string };
  };
  source?: { id: string };
  redirect: { url: string };
  post?: { url: string };
  metadata?: Record<string, string>;
};

export type TapWebhookEvent = {
  id: string;
  amount: number;
  currency: TapCurrency;
  status: TapStatus;
  reference: { transaction: string; order: string };
  transaction: { created: string; url: string };
  metadata?: Record<string, string>;
};

export type TapConfig = {
  secretKey: string;
  publicKey?: string;
  mode: 'live' | 'test' | 'mock';
};

// Tabby (installments)
export type TabbySession = {
  id: string;
  status: 'created' | 'authorized' | 'closed' | 'rejected' | 'expired';
  payment: {
    amount: string;
    currency: string;
    buyer: { name: string; email: string; phone: string };
  };
  configuration: {
    products: Array<{
      id: string;
      name: string;
      price: { amount: string; currency: string };
    }>;
  };
};
