// TypeScript types for our Supabase database.
// These mirror the schema in supabase/migrations/00000000000001_init.sql.

export type Audience = 'women' | 'men' | 'shared';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'tap' | 'tabby';
export type NotificationChannel = 'email' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
export type NotificationTrigger = 'order_created' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled';

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  district: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: number;
  metadata: any;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  short_name: string;
  name_ar: string | null;
  description: string;
  tagline: string;
  audience: Audience;
  audience_label: string;
  price: number;
  old_price: number | null;
  cost: number;
  margin: number | null;
  badge: string | null;
  tier: number;
  is_hero: boolean;
  cj_product_id: string | null;
  category_id: number | null;
  category_name: string | null;
  brand: string | null;
  weight: number | null;
  images: string[];
  variants: any;
  free_shipping: boolean;
  estimated_delivery_days: number;
  rating: number;
  review_count: number;
  sales_count: number;
  metadata: any;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: string | null;
  cj_order_id: string | null;
  tracking_number: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_email: string | null;
  shipping_city: string;
  shipping_district: string;
  shipping_notes: string | null;
  shipping_address: any;
  cj_error: string | null;
  metadata: any;
  placed_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_short_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant: string | null;
  metadata: any;
  created_at: string;
};

export type Notification = {
  id: string;
  order_id: string | null;
  channel: NotificationChannel;
  trigger: NotificationTrigger;
  recipient: string;
  subject: string | null;
  body: string;
  status: NotificationStatus;
  provider: string | null;
  error: string | null;
  sent_at: string;
};

export type Database = {
  public: {
    Tables: {
      customers: { Row: Customer; Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }; Update: Partial<Customer> };
      products: { Row: Product; Insert: Omit<Product, 'created_at' | 'updated_at'> & { id: string; created_at?: string; updated_at?: string }; Update: Partial<Product> };
      orders: { Row: Order; Insert: Omit<Order, 'placed_at' | 'updated_at'> & { id: string; placed_at?: string; updated_at?: string }; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'> & { id?: string; created_at?: string }; Update: Partial<OrderItem> };
      notifications: { Row: Notification; Insert: Omit<Notification, 'sent_at'> & { id: string; sent_at?: string }; Update: Partial<Notification> };
    };
    Views: {
      order_summary: { Row: Order & { customer_name: string; customer_email: string; item_count: number } };
      top_products: { Row: Product & { units_sold: number; revenue: number } };
    };
    Functions: Record<string, never>;
    Enums: {
      audience_type: Audience;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      notification_trigger: NotificationTrigger;
    };
  };
};
