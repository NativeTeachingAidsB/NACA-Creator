import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, type QueuedRequest } from '@/lib/naca-offline-queue';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedRequest[]>(offlineQueue.getQueue());
  const [isOnline, setIsOnline] = useState(offlineQueue.isNetworkOnline());

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(setQueue);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const flush = useCallback(async () => {
    await offlineQueue.flush();
  }, []);

  const clear = useCallback(() => {
    offlineQueue.clear();
  }, []);

  return {
    queue,
    queueLength: queue.length,
    isOnline,
    flush,
    clear,
    hasPendingRequests: queue.length > 0,
  };
}
