import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { socketManager } from '../services/socket-manager';
import { useAuthStore } from '../stores/auth-store';
import { useNotificationStore } from '../stores/notification-store';
import type { NotificationItem } from './use-notifications';

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);
  const enqueueModal = useNotificationStore(state => state.enqueueModal);
  const incrementUnread = useNotificationStore(state => state.incrementUnread);

  // Connection and event listeners
  useEffect(() => {
    if (!token) {
      socketManager.disconnect();
      return;
    }

    socketManager.connect(token);

    socketManager.onNotification((notification: NotificationItem) => {
      incrementUnread();

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

      if (notification?.priority === "critical") {
        enqueueModal(notification);
      }
    });

    return () => {
      socketManager.disconnect();
    };
  }, [token, queryClient, enqueueModal, incrementUnread]);

  // AppState & NetInfo listeners
  useEffect(() => {
    let gracePeriodTimeout: ReturnType<typeof setTimeout>;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        gracePeriodTimeout = setTimeout(() => {
          socketManager.disconnect();
        }, 10000); // 10s grace period
      } else if (nextAppState === "active") {
        clearTimeout(gracePeriodTimeout);
        if (token && !socketManager.isConnected()) {
          socketManager.connect(token);
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        }
      }
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && token && !socketManager.isConnected()) {
        socketManager.connect(token);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      }
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeNetInfo();
      clearTimeout(gracePeriodTimeout);
    };
  }, [token, queryClient]);
};
