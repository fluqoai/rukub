'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  useNotificationsStore,
  useNotificationPrefs,
  type Notification,
  type NotificationTrigger,
} from '@/lib/notifications-store';
import { cn } from '@/lib/utils';

const triggerLabel: Record<NotificationTrigger, string> = {
  order_created: 'إنشاء الطلب',
  order_confirmed: 'تأكيد الطلب',
  order_shipped: 'شحن الطلب',
  order_delivered: 'توصيل الطلب',
  order_cancelled: 'إلغاء الطلب',
};

const triggerColor: Record<NotificationTrigger, string> = {
  order_created: 'bg-wood-400/15 text-wood-700',
  order_confirmed: 'bg-sage-100 text-sage-700',
  order_shipped: 'bg-ink-900/8 text-ink-700',
  order_delivered: 'bg-sage-100 text-sage-700',
  order_cancelled: 'bg-red-100 text-red-700',
};

export default function AdminNotificationsPage() {
  const storedNotifications = useNotificationsStore((s) => s.notifications);
  const notifications = useMemo(
    () => storedNotifications.filter((notification) => notification.channel === 'email'),
    [storedNotifications]
  );
  const hydrated = useNotificationsStore((s) => s.hydrated);
  const clearAll = useNotificationsStore((s) => s.clearAll);
  const prefs = useNotificationPrefs((s) => s.preferences);
  const setPreference = useNotificationPrefs((s) => s.setPreference);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Notification | null>(null);

  const filtered = useMemo(() => {
    let result = notifications;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.orderId.toLowerCase().includes(q) ||
          n.recipient.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notifications, search]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      sent: notifications.filter((n) => n.status === 'sent' || n.status === 'delivered').length,
      failed: notifications.filter((n) => n.status === 'failed').length,
      email: notifications.filter((n) => n.channel === 'email').length,
    };
  }, [notifications]);

  const triggers: NotificationTrigger[] = [
    'order_created',
    'order_confirmed',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
  ];

  return (
    <>
      <AdminHeader
        title="الإشعارات"
        subtitle={`${stats.total} إشعار · ${stats.sent} مُرسل`}
      />

      <div className="p-6">
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          السجل والتفضيلات هنا محفوظة في هذا المتصفح فقط. تغييرها لا يغيّر إعدادات إرسال البريد من الخادم، ولا يُعد هذا سجلًا شاملًا لرسائل المتجر.
        </p>
        {/* Stats row */}
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatPill label="إجمالي" value={stats.total} Icon={Bell} color="sage" />
          <StatPill label="مُرسلة" value={stats.sent} Icon={CheckCircle2} color="sage" />
          <StatPill label="فشلت" value={stats.failed} Icon={XCircle} color="red" />
          <StatPill
            label="البريد الإلكتروني"
            value={stats.email}
            Icon={Mail}
            color="ink"
          />
        </div>

        {/* Preferences section */}
        <div className="mb-6 rounded-3xl border border-sage-500/10 bg-linen-50 p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink-900">تفضيلات هذا المتصفح</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-500/10 text-xs uppercase tracking-wider text-ink-500">
                  <th className="px-3 py-2 text-start font-medium">المُحفّز</th>
                  <th className="px-3 py-2 text-center font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {triggers.map((t) => (
                  <tr key={t} className="border-b border-sage-500/5">
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                          triggerColor[t]
                        )}
                      >
                        {triggerLabel[t]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Toggle
                        enabled={prefs.email[t]}
                        onChange={(v) => setPreference('email', t, v)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-sage-500/10 bg-linen-50 p-3">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-ink-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الإشعارات..."
              className="w-full border-none bg-transparent text-sm focus:outline-none"
            />
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" />
              مسح
            </button>
          )}
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-sage-500/10 bg-linen-50 p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-ink-300" strokeWidth={1.25} />
            <p className="mt-3 text-sm text-ink-700">
              {notifications.length === 0
                ? 'لا توجد إشعارات بعد. ستظهر هنا عند إرسال أول إشعار.'
                : 'لا توجد إشعارات تطابق الفلاتر.'}
            </p>
            <p className="mt-2 text-xs text-ink-500">
              الإشعارات تُرسل تلقائياً عند تغيير حالة الطلب من صفحة تفاصيل الطلب.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-sage-500/10 bg-linen-50">
            <div className="divide-y divide-sage-500/5">
              {filtered.map((n) => {
                const date = new Date(n.sentAt);
                const timeStr = date.toLocaleString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const statusInfo = {
                  sent: { Icon: CheckCircle2, color: 'text-sage-600', text: 'مُرسل' },
                  delivered: { Icon: CheckCircle2, color: 'text-sage-600', text: 'تم التوصيل' },
                  read: { Icon: CheckCircle2, color: 'text-sage-600', text: 'مقروء' },
                  failed: { Icon: XCircle, color: 'text-red-600', text: 'فشل' },
                  pending: { Icon: Clock, color: 'text-wood-600', text: 'بانتظار' },
                  bounced: { Icon: AlertCircle, color: 'text-red-600', text: 'مرتد' },
                }[n.status];

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelected(n)}
                    className="group flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-sage-50/50"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                        'bg-ink-900/8 text-ink-700'
                      )}
                    >
                      <Mail className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                            triggerColor[n.trigger]
                          )}
                        >
                          {triggerLabel[n.trigger]}
                        </span>
                        <span className="font-mono text-[10px] text-ink-500">
                          {n.orderId}
                        </span>
                        <span className="text-[10px] text-ink-300">·</span>
                        <span className="text-[10px] text-ink-500">{timeStr}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-700">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-ink-500" dir="ltr">
                        إلى: {n.recipient}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', statusInfo.color)}>
                        <statusInfo.Icon className="h-3 w-3" />
                        {statusInfo.text}
                      </span>
                      <ChevronRight className="h-3 w-3 text-ink-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <NotificationDetailModal notification={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

type StatPillProps = {
  label: string;
  value: number | string;
  Icon: typeof Bell;
  color?: 'sage' | 'wood' | 'ink' | 'red';
};

function StatPill({ label, value, Icon, color = 'sage' }: StatPillProps) {
  const colorMap = {
    sage: 'bg-sage-500/10 text-sage-700',
    wood: 'bg-wood-400/15 text-wood-700',
    ink: 'bg-ink-900/8 text-ink-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-sage-500/10 bg-linen-50 px-4 py-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colorMap[color])}>
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-500">{label}</p>
        <p className="font-mono text-sm font-semibold tabular-nums text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        enabled ? 'bg-sage-500' : 'bg-ink-300'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0.5 rtl:-translate-x-0.5'
        )}
      />
    </button>
  );
}

function NotificationDetailModal({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const date = new Date(notification.sentAt);
  const dateStr = date.toLocaleString('ar-SA');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-sage-500/20 bg-linen-50 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-sage-50 hover:text-ink-700"
        >
          ✕
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              'bg-ink-900/8 text-ink-700'
            )}
          >
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              Email · {triggerLabel[notification.trigger]}
            </p>
            <p className="font-mono text-[10px] text-ink-500">
              {notification.id}
            </p>
          </div>
        </div>

        {notification.subject && (
          <div className="mb-3 rounded-2xl bg-linen-100/60 p-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-500">الموضوع</p>
            <p className="mt-1 text-sm font-medium text-ink-900">{notification.subject}</p>
          </div>
        )}

        <div className="mb-3 rounded-2xl bg-linen-100/60 p-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-500">المستلم</p>
          <p className="mt-1 font-mono text-sm text-ink-900" dir="ltr">
            {notification.recipient}
          </p>
        </div>

        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-ink-500">المحتوى</p>
          <pre className="mt-1 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-ink-900/95 p-4 font-mono text-xs leading-relaxed text-linen-100">
            {notification.body}
          </pre>
        </div>

        <div className="flex items-center justify-between border-t border-sage-500/10 pt-3 text-[10px] text-ink-500">
          <span>المُزوّد: {notification.provider}</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
