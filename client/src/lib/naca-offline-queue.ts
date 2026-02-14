interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  createdAt: string;
  retryCount: number;
}

const STORAGE_KEY = 'naca_offline_queue';
const MAX_RETRIES = 3;

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = true;
  private isFlushing: boolean = false;
  private listeners: Set<(queue: QueuedRequest[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.setupNetworkListeners();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} queued requests`);
      }
    } catch (e) {
      console.warn('[OfflineQueue] Failed to load from storage:', e);
      this.queue = [];
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineQueue] Failed to persist:', e);
    }
    
    this.notifyListeners();
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;
    
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Network online, flushing queue');
      this.isOnline = true;
      this.flush();
    });
    
    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Network offline');
      this.isOnline = false;
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  add(request: Omit<QueuedRequest, 'id' | 'createdAt' | 'retryCount'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    
    this.queue.push(queuedRequest);
    this.persist();
    
    console.log('[OfflineQueue] Added request:', queuedRequest.id, queuedRequest.url);
    
    if (this.isOnline) {
      this.flush();
    }
  }

  remove(id: string) {
    this.queue = this.queue.filter(r => r.id !== id);
    this.persist();
  }

  async flush(): Promise<void> {
    if (this.isFlushing || !this.isOnline || this.queue.length === 0) return;
    
    this.isFlushing = true;
    console.log(`[OfflineQueue] Flushing ${this.queue.length} requests`);
    
    const pending = [...this.queue];
    
    for (const request of pending) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        
        if (response.ok) {
          this.remove(request.id);
          console.log('[OfflineQueue] Successfully sent:', request.id);
        } else if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          console.log(`[OfflineQueue] Rate limited, retrying after ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
        } else if (response.status >= 500) {
          request.retryCount++;
          if (request.retryCount >= MAX_RETRIES) {
            console.warn('[OfflineQueue] Max retries reached, removing:', request.id);
            this.remove(request.id);
          } else {
            console.log(`[OfflineQueue] Server error, will retry (${request.retryCount}/${MAX_RETRIES})`);
          }
          break;
        } else {
          console.warn('[OfflineQueue] Request failed with:', response.status, 'removing:', request.id);
          this.remove(request.id);
        }
      } catch (error) {
        console.error('[OfflineQueue] Failed to flush request:', error);
        break;
      }
    }
    
    this.isFlushing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
    this.persist();
  }

  subscribe(listener: (queue: QueuedRequest[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }
}

export const offlineQueue = new OfflineQueue();
export type { QueuedRequest };
