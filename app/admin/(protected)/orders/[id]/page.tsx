'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Package,
  Home,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Save,
  XCircle,
  RotateCcw,
  Save as SaveIcon,
  Send,
  Bell,
  Loader2,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useDbOrder, updateDbOrder, type OrderStatus as DbStatus } from '@/lib/hooks/useDbOrders';
import {
  useNotificationsStore,
  useNotificationPrefs,
  type NotificationTrigger,
} from '@/lib/notifications-store';
import { useI18n } from '@/lib/i18n';
import { formatSAR, cn } from '@/lib/utils';

const statusInfo: Record<string, { text: string; color: string; description: string }> = {
  pending: {
    text: 'بانتظار التأكيد',
    color: 'bg-wood-400/15 text-wood-700 border-wood-500/30',
    description: 'الطلب قيد المراجعة من الفريق',
  },
  confirmed: {
    text: 'مؤكد',
    color: 'bg-sage-100 text-sage-700 border-sage-500/30',
    description: 'تم تأكيد الطلب بنجاح',
  },
  processing: {
    text: 'قيد التجهيز',
    color: 'bg-ink-900/8 text-ink-700 border-ink-900/10',
    description: 'يتم تجهيز الطلب في المستودع',
  },
  shipped: {
    text: 'تم الشحن',
    color: 'bg-sage-100 text-sage-700 border-sage-500/30',
    description: 'تم شحن الطلب وفي الطريق',
  },
  delivered: {
    text: 'مسلّم',
    color: 'bg-sage-100 text-sage-700 border-sage-500/30',
    description: 'تم التوصيل بنجاح',
  },
  cancelled: {
    text: 'ملغي',
    color: 'bg-red-100 text-red-700 border-red-500/30',
    description: 'تم إلغاء الطلب',
  },
  refunded: {
    text: 'مسترد',
    color: 'bg-ink-900/8 text-ink-700 border-ink-900/10',
    description: 'تم استرداد المبلغ',
  },
};

const paymentLabel: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  tap: 'بطاقة / Apple Pay (Tap)',
  tabby: 'تقسيط Tabby (4 دفعات)',
};

const allStatuses: DbStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

// Map status change to notification trigger
const statusToTrigger: Record<DbStatus, NotificationTrigger> = {
  pending: 'order_created',
  confirmed: 'order_confirmed',
  processing: 'order_confirmed',
  shipped: 'order_shipped',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
  refunded: 'order_cancelled',
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const { locale } = useI18n();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const router = useRouter();

  // Fetch from DB
  const { order: dbOrder, loading, error, refetch } = useDbOrder(id);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const [editingStatus, setEditingStatus] = useState<DbStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [lastNotif, setLastNotif] = useState<{ trigger: NotificationTrigger; email?: any; whatsapp?: any } | null>(null);

  useEffect(() => {
    if (dbOrder?.tracking_number) {
      setTrackingInput(dbOrder.tracking_number);
    }
  }, [dbOrder?.tracking_number]);

  if (loading) {
    return (
      <>
        <AdminHeader title="تحميل..." />
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-6 w-6 animate-spin text-sage-500" />
        </div>
      </>
    );
  }

  if (error || !dbOrder) {
    return (
      <>
        <AdminHeader title="الطلب غير موجود" />
        <div className="p-6">
          <p className="mb-4 text-sm text-ink-500">{error ?? 'لم يتم العثور على الطلب.'}</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700"
          >
            <Arrow className="h-4 w-4" />
            العودة للطلبات
          </Link>
        </div>
      </>
    );
  }

  // Map DB order to view model
  const order = {
    id: dbOrder.id,
    status: dbOrder.status,
    items: (dbOrder.items ?? []).map((it) => ({
      productId: it.product_id,
      shortName: it.product_short_name ?? it.product_name,
      name: it.product_name,
      price: Number(it.price),
      quantity: it.quantity,
    })),
    shipping: {
      fullName: dbOrder.shipping_full_name,
      phone: dbOrder.shipping_phone,
      email: dbOrder.shipping_email ?? '',
      city: dbOrder.shipping_city,
      district: dbOrder.shipping_district,
      notes: dbOrder.shipping_notes ?? '',
    },
    payment: dbOrder.payment_method,
    subtotal: Number(dbOrder.subtotal),
    shippingCost: Number(dbOrder.shipping_cost),
    total: Number(dbOrder.total),
    cjOrderId: dbOrder.cj_order_id ?? undefined,
    trackingNumber: dbOrder.tracking_number ?? undefined,
    createdAt: dbOrder.placed_at,
    cjError: dbOrder.cj_error ?? undefined,
  };

  const info = statusInfo[order.status] ?? statusInfo.pending;
  const date = new Date(order.createdAt);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const timeStr = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  const sendNotification = async (trigger: NotificationTrigger) => {
    setSendingNotif(true);
    setLastNotif(null);
    try {
      const res = await fetch('/api/notifications/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, trigger }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل إرسال الإشعار');
      }
      // Log to local store for admin notification log
      if (data.email?.sent && order.shipping.email) {
        addNotification({
          id: data.email.id || `email_${Date.now()}`,
          orderId: order.id,
          channel: 'email',
          trigger,
          recipient: order.shipping.email,
          body: '',
          status: data.email.sent ? 'sent' : 'failed',
          provider: 'mock',
          error: data.email.error,
          sentAt: data.sentAt,
        });
      }
      if (data.whatsapp?.sent && order.shipping.phone) {
        addNotification({
          id: data.whatsapp.id || `wa_${Date.now()}`,
          orderId: order.id,
          channel: 'whatsapp',
          trigger,
          recipient: order.shipping.phone,
          body: '',
          status: data.whatsapp.sent ? 'sent' : 'failed',
          provider: 'mock',
          error: data.whatsapp.error,
          sentAt: data.sentAt,
        });
      }
      setLastNotif({ trigger, email: data.email, whatsapp: data.whatsapp });
      setTimeout(() => setLastNotif(null), 5000);
    } catch (e) {
      setLastNotif({ trigger, email: { sent: false, error: e instanceof Error ? e.message : 'Unknown' } });
      setTimeout(() => setLastNotif(null), 5000);
    } finally {
      setSendingNotif(false);
    }
  };

  const handleStatusChange = async (newStatus: DbStatus) => {
    setSaving(true);
    setEditingStatus(null);
    const oldStatus = order.status;
    try {
      await updateDbOrder(order.id, { status: newStatus });
      await refetch();
      if (oldStatus !== newStatus) {
        const trigger = statusToTrigger[newStatus] ?? 'order_confirmed';
        await sendNotification(trigger);
      }
    } catch (e) {
      console.error('Status change failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTracking = async () => {
    setSaving(true);
    try {
      await updateDbOrder(order.id, { trackingNumber: trackingInput });
      await refetch();
      await sendNotification('order_shipped');
    } catch (e) {
      console.error('Tracking save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title={`الطلب ${order.id}`}
        subtitle={`${dateStr} · ${timeStr}`}
        onRefresh={() => router.refresh()}
      />

      <div className="p-6">
        {/* Back link */}
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 transition-colors hover:text-sage-600"
        >
          <Arrow className="h-4 w-4" />
          العودة للطلبات
        </Link>

        {/* Status banner + actions */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-sage-500/15 bg-linen-50 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                  info.color
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {info.text}
              </span>
              <span className="rounded-full bg-linen-100 px-2.5 py-1 text-[10px] text-ink-500">
                {paymentLabel[order.payment] ?? order.payment}
              </span>
              {saving && (
                <span className="inline-flex items-center gap-1 text-[10px] text-ink-500">
                  <Clock className="h-3 w-3 animate-spin" />
                  جاري الحفظ...
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-700">{info.description}</p>
            {order.cjError && (
              <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                <p className="font-medium">خطأ CJ:</p>
                <p className="mt-1 font-mono">{order.cjError}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={editingStatus ?? order.status}
              onChange={(e) => setEditingStatus(e.target.value as DbStatus)}
              disabled={saving}
              className="rounded-full border border-sage-500/20 bg-linen-50 px-3 py-2 text-xs font-medium text-ink-700"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  تغيير إلى: {statusInfo[s].text}
                </option>
              ))}
            </select>
            {editingStatus && editingStatus !== order.status && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange(editingStatus)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage-500 px-3 py-2 text-xs font-medium text-linen-50 transition-colors hover:bg-sage-600 disabled:opacity-60"
                >
                  <SaveIcon className="h-3.5 w-3.5" />
                  {saving ? 'جاري...' : 'حفظ + إشعار'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStatus(null)}
                  className="inline-flex items-center gap-1 rounded-full border border-sage-500/20 bg-linen-50 px-3 py-2 text-xs font-medium text-ink-700"
                >
                  إلغاء
                </button>
              </>
            )}

            {sendingNotif && (
              <span className="inline-flex items-center gap-1 text-[10px] text-ink-500">
                <Send className="h-3 w-3 animate-pulse" />
                جارٍ إرسال الإشعار...
              </span>
            )}

            {lastNotif && !sendingNotif && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium',
                  lastNotif.email?.sent || lastNotif.whatsapp?.sent
                    ? 'bg-sage-100 text-sage-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                <CheckCircle2 className="h-3 w-3" />
                {lastNotif.email?.sent || lastNotif.whatsapp?.sent
                  ? `تم إرسال ${lastNotif.trigger}`
                  : `فشل: ${lastNotif.email?.error ?? 'غير معروف'}`}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-6">
              <h2 className="text-sm font-semibold text-ink-900">المنتجات ({order.items.length})</h2>
              <ul className="mt-4 divide-y divide-sage-500/5">
                {order.items.map((it) => (
                  <li key={it.productId} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{it.shortName}</p>
                      <p className="text-[10px] text-ink-500">
                        SKU: {it.productId} · {formatSAR(it.price)} × {it.quantity}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold tabular-nums text-ink-900">
                      {formatSAR(it.price * it.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-sage-500/10 pt-4 text-sm">
                <div className="flex items-center justify-between text-ink-500">
                  <span>المجموع الفرعي</span>
                  <span className="font-mono text-ink-900">{formatSAR(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-500">
                  <span>الشحن</span>
                  <span className="font-mono text-ink-900">
                    {order.shippingCost === 0 ? <span className="text-sage-600">مجاني</span> : formatSAR(order.shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-sage-500/10 pt-3">
                  <span className="font-semibold text-ink-900">الإجمالي</span>
                  <span className="font-mono text-xl font-semibold tabular-nums text-ink-900">
                    {formatSAR(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-6">
              <h2 className="text-sm font-semibold text-ink-900">الشحن والتتبع</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="رقم التتبع (من شركة الشحن)"
                    className="flex-1 rounded-xl border border-sage-500/20 bg-linen-50 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    disabled={sendingNotif}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sage-500 px-3 py-2 text-xs font-medium text-linen-50 transition-colors hover:bg-sage-600 disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {sendingNotif ? 'جاري الإرسال...' : 'حفظ + إشعار'}
                  </button>
                </div>

                {order.cjOrderId && (
                  <div className="rounded-2xl bg-sage-50/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">رقم CJ</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink-900">{order.cjOrderId}</p>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="rounded-2xl bg-wood-400/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500">رقم التتبع</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-ink-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity log (placeholder) */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-6">
              <h2 className="text-sm font-semibold text-ink-900">سجل النشاط</h2>
              <ol className="mt-4 space-y-3">
                <ActivityItem
                  Icon={CheckCircle2}
                  text="تم إنشاء الطلب"
                  time={dateStr + ' ' + timeStr}
                  color="text-sage-600"
                />
                <ActivityItem
                  Icon={order.status === 'pending_cj_sync' ? Clock : CheckCircle2}
                  text={order.cjOrderId ? 'تم مزامنة الطلب مع CJ' : 'في انتظار المزامنة مع CJ'}
                  time={order.cjOrderId ? 'مؤتمت' : '—'}
                  color={order.cjOrderId ? 'text-sage-600' : 'text-wood-600'}
                />
                {order.trackingNumber && (
                  <ActivityItem
                    Icon={Truck}
                    text="تم إضافة رقم التتبع"
                    time="حديثاً"
                    color="text-ink-700"
                  />
                )}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            {/* Customer */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">العميل</h3>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-ink-900">{order.shipping.fullName}</p>
                <p className="flex items-center gap-1.5 font-mono text-[10px] text-ink-500" dir="ltr">
                  <Phone className="h-3 w-3" />
                  {order.shipping.phone}
                </p>
                {order.shipping.email && (
                  <p className="flex items-center gap-1.5 font-mono text-[10px] text-ink-500" dir="ltr">
                    <Mail className="h-3 w-3" />
                    {order.shipping.email}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">عنوان التوصيل</h3>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-ink-700">
                  {order.shipping.district}
                </p>
                <p className="text-ink-700">
                  {order.shipping.city}، المملكة العربية السعودية
                </p>
                {order.shipping.notes && (
                  <p className="mt-2 rounded-lg bg-linen-100/60 px-2.5 py-1.5 text-xs text-ink-500">
                    {order.shipping.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-3xl border border-sage-500/15 bg-linen-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-500">الدفع</h3>
              <div className="mt-3 space-y-1 text-sm">
                <p className="font-medium text-ink-900">
                  {paymentLabel[order.payment] ?? order.payment}
                </p>
                <p className="text-xs text-ink-500">المبلغ: {formatSAR(order.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type ActivityItemProps = {
  Icon: typeof CheckCircle2;
  text: string;
  time: string;
  color: string;
};

function ActivityItem({ Icon, text, time, color }: ActivityItemProps) {
  return (
    <li className="flex items-start gap-3">
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', color)} strokeWidth={1.5} />
      <div className="flex-1">
        <p className="text-sm text-ink-900">{text}</p>
        <p className="font-mono text-[10px] text-ink-500">{time}</p>
      </div>
    </li>
  );
}
