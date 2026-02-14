import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useScreenRecording, type RecordingState } from "@/hooks/use-screen-recording";
import { RecordingOverlay } from "@/components/ui/recording-overlay";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RecordingContextValue extends RecordingState {
  startRecording: (featureKey: string) => Promise<void>;
  stopRecording: (save?: boolean) => void;
  formatDuration: (seconds: number) => string;
  isUploading: boolean;
}

const RecordingContext = createContext<RecordingContextValue | null>(null);

async function uploadRecording(blob: Blob, featureKey: string): Promise<{ videoUrl: string; id: string }> {
  const formData = new FormData();
  formData.append("video", blob, `${featureKey}-${Date.now()}.webm`);
  formData.append("featureKey", featureKey);
  formData.append("testDescription", `Screen recording for ${featureKey}`);
  
  const response = await fetch("/api/help-video-candidates/upload", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to upload recording");
  }
  
  return response.json();
}

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: ({ blob, featureKey }: { blob: Blob; featureKey: string }) => 
      uploadRecording(blob, featureKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpVideoCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["featureHelp"] });
    },
  });
  
  const handleRecordingComplete = useCallback((blob: Blob, featureKey: string) => {
    uploadMutation.mutate({ blob, featureKey });
  }, [uploadMutation]);
  
  const {
    isRecording,
    isPaused,
    duration,
    featureKey,
    startRecording,
    stopRecording,
    formatDuration,
  } = useScreenRecording({
    onRecordingComplete: handleRecordingComplete,
  });
  
  const value = useMemo((): RecordingContextValue => ({
    isRecording,
    isPaused,
    duration,
    featureKey,
    startRecording,
    stopRecording,
    formatDuration,
    isUploading: uploadMutation.isPending,
  }), [isRecording, isPaused, duration, featureKey, startRecording, stopRecording, formatDuration, uploadMutation.isPending]);

  return (
    <RecordingContext.Provider value={value}>
      {children}
      <RecordingOverlay
        isRecording={isRecording}
        duration={duration}
        formatDuration={formatDuration}
        onStop={() => stopRecording(true)}
        onCancel={() => stopRecording(false)}
        featureKey={featureKey}
      />
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  return context;
}

export function useRecordingRequired() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error("useRecordingRequired must be used within a RecordingProvider");
  }
  return context;
}
