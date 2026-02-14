import { nacaApi, NACANotification } from './naca-api';

type NotificationHandler = (notification: NACANotification) => void;

interface NotificationPollerConfig {
  pollInterval: number;
  onNotification?: NotificationHandler;
  onUnreadCountChange?: (count: number) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_POLL_INTERVAL = 30 * 1000; // 30 seconds

class NotificationPoller {
  private pollInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private lastChecked: Date | null = null;
  private isActive: boolean = false;
  private handlers: Set<NotificationHandler> = new Set();
  private unreadCountHandlers: Set<(count: number) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private currentUnreadCount: number = 0;
  private seenNotificationIds: Set<string> = new Set();

  constructor(config?: Partial<NotificationPollerConfig>) {
    this.pollInterval = config?.pollInterval ?? DEFAULT_POLL_INTERVAL;
    
    if (config?.onNotification) {
      this.handlers.add(config.onNotification);
    }
    if (config?.onUnreadCountChange) {
      this.unreadCountHandlers.add(config.onUnreadCountChange);
    }
    if (config?.onError) {
      this.errorHandlers.add(config.onError);
    }
    
    this.loadSeenNotifications();
  }

  private loadSeenNotifications() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('naca_seen_notifications');
      if (stored) {
        this.seenNotificationIds = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('[NotificationPoller] Failed to load seen notifications:', e);
    }
  }

  private persistSeenNotifications() {
    if (typeof window === 'undefined') return;
    
    try {
      const idsArray = Array.from(this.seenNotificationIds).slice(-100);
      localStorage.setItem('naca_seen_notifications', JSON.stringify(idsArray));
    } catch (e) {
      console.warn('[NotificationPoller] Failed to persist seen notifications:', e);
    }
  }

  async poll(): Promise<void> {
    if (!nacaApi.isConfigured() || !nacaApi.isAuthenticated()) {
      return;
    }
    
    try {
      const { notifications, unreadCount } = await nacaApi.getNotifications(true);
      
      if (unreadCount !== this.currentUnreadCount) {
        this.currentUnreadCount = unreadCount;
        this.unreadCountHandlers.forEach(handler => handler(unreadCount));
      }
      
      const newNotifications = notifications.filter(n => !this.seenNotificationIds.has(n.id));
      
      for (const notification of newNotifications) {
        this.seenNotificationIds.add(notification.id);
        this.handlers.forEach(handler => handler(notification));
      }
      
      if (newNotifications.length > 0) {
        this.persistSeenNotifications();
      }
      
      this.lastChecked = new Date();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn('[NotificationPoller] Poll failed:', err.message);
      this.errorHandlers.forEach(handler => handler(err));
    }
  }

  start(): void {
    if (this.isActive) return;
    
    console.log(`[NotificationPoller] Starting with ${this.pollInterval / 1000}s interval`);
    this.isActive = true;
    
    this.poll();
    
    this.intervalId = setInterval(() => this.poll(), this.pollInterval);
  }

  stop(): void {
    if (!this.isActive) return;
    
    console.log('[NotificationPoller] Stopping');
    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onNotification(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onUnreadCountChange(handler: (count: number) => void): () => void {
    this.unreadCountHandlers.add(handler);
    handler(this.currentUnreadCount);
    return () => this.unreadCountHandlers.delete(handler);
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  getUnreadCount(): number {
    return this.currentUnreadCount;
  }

  getLastChecked(): Date | null {
    return this.lastChecked;
  }

  isRunning(): boolean {
    return this.isActive;
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await nacaApi.markNotificationAsRead(notificationId);
      this.currentUnreadCount = Math.max(0, this.currentUnreadCount - 1);
      this.unreadCountHandlers.forEach(handler => handler(this.currentUnreadCount));
    } catch (error) {
      console.error('[NotificationPoller] Failed to mark as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await nacaApi.markAllNotificationsAsRead();
      this.currentUnreadCount = 0;
      this.unreadCountHandlers.forEach(handler => handler(0));
    } catch (error) {
      console.error('[NotificationPoller] Failed to mark all as read:', error);
    }
  }
}

export const notificationPoller = new NotificationPoller();
export type { NotificationPollerConfig, NotificationHandler };
