// WhatsApp Business API types.
// Compatible with Meta's Cloud API and Twilio's WhatsApp API.

export type WhatsAppStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppMessage = {
  to: string;              // E.164 format
  body: string;            // text content
  templateName?: string;   // for pre-approved templates
  templateParams?: string[];
};

export type WhatsAppSendResult = {
  id: string;
  status: WhatsAppStatus;
  provider: 'meta' | 'twilio' | 'mock';
  to: string;
  error?: string;
};

export type OrderWhatsAppContext = {
  orderId: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; quantity: number }>;
  trackingNumber?: string;
  cjOrderId?: string;
  newStatus?: string;
};
