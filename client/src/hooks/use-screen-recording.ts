import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  featureKey: string | null;
}

interface UseScreenRecordingOptions {
  onRecordingComplete?: (blob: Blob, featureKey: string) => void;
  onRecordingCancelled?: () => void;
  reminderIntervalMs?: number;
}

export function useScreenRecording(options: UseScreenRecordingOptions = {}) {
  const { 
    onRecordingComplete, 
    onRecordingCancelled,
    reminderIntervalMs = 30000 
  } = options;
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    featureKey: null,
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reminderRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (reminderRef.current) {
      clearInterval(reminderRef.current);
      reminderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const stopRecording = useCallback((save: boolean = true) => {
    if (!mediaRecorderRef.current || !state.isRecording) return;
    
    const featureKey = state.featureKey;
    
    if (save && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      cleanup();
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        featureKey: null,
      });
      onRecordingCancelled?.();
      toast({
        title: "Recording cancelled",
        description: "The recording was discarded.",
        variant: "destructive",
      });
    }
  }, [state.isRecording, state.featureKey, cleanup, onRecordingCancelled]);

  const startRecording = useCallback(async (featureKey: string) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: false,
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
          ? 'video/webm;codecs=vp9' 
          : 'video/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        cleanup();
        
        if (chunksRef.current.length > 0 && blob.size > 0) {
          onRecordingComplete?.(blob, featureKey);
          toast({
            title: "Recording saved",
            description: "Your help video has been saved successfully.",
          });
        }
        
        setState({
          isRecording: false,
          isPaused: false,
          duration: 0,
          featureKey: null,
        });
      };
      
      stream.getVideoTracks()[0].onended = () => {
        stopRecording(true);
      };
      
      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);
      
      reminderRef.current = setInterval(() => {
        toast({
          title: "Still recording",
          description: "Press Enter to save or Escape to cancel.",
        });
      }, reminderIntervalMs);
      
      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        featureKey,
      });
      
      toast({
        title: "Recording started",
        description: "Perform your actions. Press Enter to save, Escape to cancel.",
      });
      
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not access screen capture. Please try again.",
        variant: "destructive",
      });
    }
  }, [cleanup, onRecordingComplete, reminderIntervalMs, stopRecording]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isRecording) return;
      
      if (event.key === "Escape") {
        event.preventDefault();
        stopRecording(false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        stopRecording(true);
      }
    };
    
    if (state.isRecording) {
      window.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    formatDuration,
  };
}
