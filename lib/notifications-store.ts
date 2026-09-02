'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmailStatus } from './email-types';
import type { WhatsAppStatus } from './whatsapp-types';
import {
  defaultPreferences,
  type NotificationChannel,
  type NotificationTrigger,
  type NotificationPreferences,
} from './notifications-types';

export type { NotificationChannel, NotificationTrigger, NotificationPreferences };
export { defaultPreferences };

export type Notification = {
  id: string;
  orderId: string;
  channel: NotificationChannel;
  trigger: NotificationTrigger;
  recipient: string;        // email or phone
  subject?: string;         // email only
  body: string;
  status: EmailStatus | WhatsAppStatus;
  provider: 'resend' | 'sendgrid' | 'meta' | 'twilio' | 'mock';
  error?: string;
  sentAt: string;           // ISO
};

type NotificationsState = {
  notifications: Notification[];
  hydrated: boolean;
  setHydrated: () => void;
  addNotification: (n: Notification) => void;
  clearAll: () => void;
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      addNotification: (n) =>
        set((state) => ({ notifications: [n, ...state.notifications].slice(0, 200) })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'rukub-notifications',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

type PrefsState = {
  preferences: NotificationPreferences;
  hydrated: boolean;
  setHydrated: () => void;
  setPreference: (
    channel: NotificationChannel,
    trigger: NotificationTrigger,
    enabled: boolean
  ) => void;
};

export const useNotificationPrefs = create<PrefsState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setPreference: (channel, trigger, enabled) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [channel]: {
              ...state.preferences[channel],
              [trigger]: enabled,
            },
          },
        })),
    }),
    {
      name: 'rukub-notification-prefs',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
