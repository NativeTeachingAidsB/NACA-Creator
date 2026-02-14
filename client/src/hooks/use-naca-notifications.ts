import { useState, useEffect, useCallback } from 'react';
import { notificationPoller, type NotificationHandler } from '@/lib/naca-notification-poller';
import { NACANotification } from '@/lib/naca-api';

export function useNACANotifications() {
  const [unreadCount, setUnreadCount] = useState(notificationPoller.getUnreadCount());
  const [isPolling, setIsPolling] = useState(notificationPoller.isRunning());
  const [lastChecked, setLastChecked] = useState<Date | null>(notificationPoller.getLastChecked());

  useEffect(() => {
    const unsubCount = notificationPoller.onUnreadCountChange(setUnreadCount);
    
    const pollCheck = setInterval(() => {
      setIsPolling(notificationPoller.isRunning());
      setLastChecked(notificationPoller.getLastChecked());
    }, 1000);
    
    return () => {
      unsubCount();
      clearInterval(pollCheck);
    };
  }, []);

  const startPolling = useCallback(() => {
    notificationPoller.start();
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    notificationPoller.stop();
    setIsPolling(false);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    await notificationPoller.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationPoller.markAllAsRead();
  }, []);

  const onNotification = useCallback((handler: NotificationHandler) => {
    return notificationPoller.onNotification(handler);
  }, []);

  return {
    unreadCount,
    isPolling,
    lastChecked,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    onNotification,
  };
}

export function useNotificationHandler(handler: (notification: NACANotification) => void) {
  useEffect(() => {
    return notificationPoller.onNotification(handler);
  }, [handler]);
}
