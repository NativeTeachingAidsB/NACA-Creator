import { useState, useEffect, useCallback } from 'react';
import { draftAutoSaver, type SaveStatus } from '@/lib/naca-draft-autosaver';

export function useDraftAutoSave() {
  const [status, setStatus] = useState<SaveStatus>(draftAutoSaver.getStatus());
  const [message, setMessage] = useState<string | undefined>();
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(draftAutoSaver.getLastSavedAt());

  useEffect(() => {
    const unsubscribe = draftAutoSaver.onStatusChange((newStatus, msg) => {
      setStatus(newStatus);
      setMessage(msg);
      setLastSavedAt(draftAutoSaver.getLastSavedAt());
    });
    
    return unsubscribe;
  }, []);

  const queueSave = useCallback((draftId: string, changes: Partial<{
    name: string;
    description: string;
    title: string;
    subtitle: string;
  }>) => {
    draftAutoSaver.queueSave(draftId, changes);
  }, []);

  const forceSave = useCallback(async () => {
    await draftAutoSaver.forceSave();
  }, []);

  const cancel = useCallback(() => {
    draftAutoSaver.cancel();
  }, []);

  return {
    status,
    message,
    lastSavedAt,
    hasPendingChanges: draftAutoSaver.hasPendingChanges(),
    queueSave,
    forceSave,
    cancel,
  };
}

export function useSaveIndicator() {
  const { status, message, lastSavedAt } = useDraftAutoSave();
  
  const getIndicatorText = useCallback(() => {
    switch (status) {
      case 'idle':
        return lastSavedAt ? 'Saved' : '';
      case 'pending':
        return message || 'Changes pending...';
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return message || 'Save failed';
      default:
        return '';
    }
  }, [status, message, lastSavedAt]);

  const getIndicatorColor = useCallback(() => {
    switch (status) {
      case 'idle':
      case 'saved':
        return 'text-green-600';
      case 'pending':
      case 'saving':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  }, [status]);

  return {
    status,
    text: getIndicatorText(),
    colorClass: getIndicatorColor(),
    isActive: status !== 'idle',
  };
}
