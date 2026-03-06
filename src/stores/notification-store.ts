import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  body: string;
  priority: "info" | "warning" | "critical";
  createdAt: string;
}

export interface NotificationState {
  unreadCount: number;
  modalQueue: Notification[];
  incrementUnread: () => void;
  decrementUnread: () => void;
  setUnreadCount: (count: number) => void;
  enqueueModal: (notification: Notification) => void;
  dequeueModal: () => void;
}

/**
 * Notification store managing unread count and critical notification modal queue.
 * Used by the socket hook to track unread badges and queue critical modals.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  modalQueue: [],

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  enqueueModal: (notification) =>
    set((state) => ({ modalQueue: [...state.modalQueue, notification] })),

  dequeueModal: () =>
    set((state) => ({ modalQueue: state.modalQueue.slice(1) })),
}));
