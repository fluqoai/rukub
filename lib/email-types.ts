// Email types — works with any SMTP/transactional provider (Resend, SendGrid, etc.)

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export type EmailTemplate =
  | 'order_created'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
};

export type EmailSendResult = {
  id: string;
  status: EmailStatus;
  provider: 'resend' | 'sendgrid' | 'mock';
  to: string;
  error?: string;
};

// Order context for email templates
export type OrderEmailContext = {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: {
    city: string;
    district: string;
    phone: string;
  };
  paymentMethod: 'cod' | 'tap' | 'tabby';
  trackingNumber?: string;
  cjOrderId?: string;
  // Optional previous status for status-change emails
  previousStatus?: string;
  newStatus?: string;
};
