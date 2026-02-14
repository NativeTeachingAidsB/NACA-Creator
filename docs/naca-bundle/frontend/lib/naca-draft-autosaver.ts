import { nacaApi, NACADraft } from './naca-api';
import { offlineQueue } from './naca-offline-queue';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
type StatusHandler = (status: SaveStatus, message?: string) => void;

interface PendingChange {
  draftId: string;
  changes: Partial<{
    name: string;
    description: string;
    title: string;
    subtitle: string;
  }>;
  timestamp: number;
}

class DraftAutoSaver {
  private saveDelay: number;
  private pendingChanges: PendingChange | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private status: SaveStatus = 'idle';
  private statusHandlers: Set<StatusHandler> = new Set();
  private lastSavedAt: number | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(saveDelay: number = 2000) {
    this.saveDelay = saveDelay;
  }

  queueSave(draftId: string, changes: PendingChange['changes']) {
    this.pendingChanges = { draftId, changes, timestamp: Date.now() };
    this.retryCount = 0;
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.setStatus('pending');
    
    this.saveTimeout = setTimeout(() => this.executeSave(), this.saveDelay);
  }

  private async executeSave() {
    if (!this.pendingChanges) return;
    
    const { draftId, changes } = this.pendingChanges;
    
    if (!navigator.onLine) {
      this.queueForOffline(draftId, changes);
      return;
    }
    
    this.setStatus('saving');
    
    try {
      await nacaApi.updateDraft(draftId, changes);
      this.pendingChanges = null;
      this.saveTimeout = null;
      this.retryCount = 0;
      this.lastSavedAt = Date.now();
      this.setStatus('saved');
      
      setTimeout(() => {
        if (this.status === 'saved') {
          this.setStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('[DraftAutoSaver] Save failed:', error);
      
      if (!navigator.onLine) {
        this.queueForOffline(draftId, changes);
      } else if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000;
        this.setStatus('error', `Retrying in ${delay / 1000}s...`);
        this.saveTimeout = setTimeout(() => this.executeSave(), delay);
      } else {
        this.setStatus('error', error instanceof Error ? error.message : 'Save failed after retries');
        this.pendingChanges = null;
        this.saveTimeout = null;
        this.retryCount = 0;
      }
    }
  }
  
  private queueForOffline(draftId: string, changes: PendingChange['changes']) {
    offlineQueue.add({
      url: `/api/naca-proxy/api/activity-editor/drafts/${draftId}`,
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'X-Community-Subdomain': nacaApi.getSubdomain(),
      },
      body: JSON.stringify(changes),
    });
    this.pendingChanges = null;
    this.saveTimeout = null;
    this.retryCount = 0;
    this.setStatus('pending', 'Queued for sync when online');
  }

  private setStatus(status: SaveStatus, message?: string) {
    this.status = status;
    this.statusHandlers.forEach(handler => handler(status, message));
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  getStatus(): SaveStatus {
    return this.status;
  }

  getLastSavedAt(): number | null {
    return this.lastSavedAt;
  }

  hasPendingChanges(): boolean {
    return this.pendingChanges !== null;
  }

  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    if (this.pendingChanges) {
      await this.executeSave();
    }
  }

  cancel() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.pendingChanges = null;
    this.setStatus('idle');
  }
}

export const draftAutoSaver = new DraftAutoSaver();
export type { SaveStatus };
