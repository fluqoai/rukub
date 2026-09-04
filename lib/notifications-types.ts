// Shared types + default preferences for notifications.
// Safe to import from both server and client code.

export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationTrigger =
  | 'order_created'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

export type NotificationPreferences = {
  email: Record<NotificationTrigger, boolean>;
  whatsapp: Record<NotificationTrigger, boolean>;
};

export const defaultPreferences: NotificationPreferences = {
  email: {
    order_created: true,
    order_confirmed: true,
    order_shipped: true,
    order_delivered: true,
    order_cancelled: true,
  },
  whatsapp: {
    order_created: false,
    order_confirmed: false,
    order_shipped: false,
    order_delivered: false,
    order_cancelled: false,
  },
};
