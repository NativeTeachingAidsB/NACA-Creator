import { createContext, useContext, useRef, useCallback, useState, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import type { GameObject, Animation, Keyframe } from "@shared/schema";

interface TimelineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
}

interface TimelineContextValue {
  state: TimelineState;
  isLooping: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  toggleLoop: () => void;
  setDuration: (duration: number) => void;
  setZoom: (zoom: number) => void;
  registerCanvasRef: (ref: HTMLElement | null) => void;
  buildAndPlay: (
    objects: GameObject[],
    animations: Animation[],
    keyframesByAnimation: Record<string, Keyframe[]>
  ) => void;
  rebuildTimeline: (
    objects: GameObject[],
    animations: Animation[],
    keyframesByAnimation: Record<string, Keyframe[]>
  ) => void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

const PROPERTY_MAP: Record<string, string> = {
  x: "x",
  y: "y",
  rotation: "rotation",
  scaleX: "scaleX",
  scaleY: "scaleY",
  opacity: "opacity",
  width: "width",
  height: "height",
};

const DEFAULT_EASING = "power2.out";

function getInitialValue(object: GameObject, property: string): number {
  switch (property) {
    case "x": return object.x;
    case "y": return object.y;
    case "rotation": return object.rotation ?? 0;
    case "scaleX": return object.scaleX ?? 1;
    case "scaleY": return object.scaleY ?? 1;
    case "opacity": return object.opacity ?? 1;
    case "width": return object.width;
    case "height": return object.height;
    default: return 0;
  }
}

interface PropertyKeyframe {
  time: number;
  value: number | string;
  ease: string;
}

function groupKeyframesByProperty(keyframes: Keyframe[]): Record<string, PropertyKeyframe[]> {
  const grouped: Record<string, PropertyKeyframe[]> = {};
  
  keyframes.forEach((kf) => {
    if (!grouped[kf.property]) {
      grouped[kf.property] = [];
    }
    const value = typeof kf.value === "object" && kf.value !== null && "value" in (kf.value as object)
      ? (kf.value as { value: number | string }).value
      : kf.value as number | string;
      
    grouped[kf.property].push({
      time: kf.time,
      value,
      ease: kf.ease || DEFAULT_EASING,
    });
  });

  Object.keys(grouped).forEach((prop) => {
    grouped[prop].sort((a, b) => a.time - b.time);
  });

  return grouped;
}

export function TimelineProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const driverRef = useRef<{ progress: number }>({ progress: 0 });
  
  const [state, setState] = useState<TimelineState>({
    isPlaying: false,
    currentTime: 0,
    duration: 5,
    zoom: 1,
    fps: 30,
  });
  
  const [isLooping, setIsLooping] = useState(false);

  const registerCanvasRef = useCallback((ref: HTMLElement | null) => {
    canvasRef.current = ref;
  }, []);

  const createTimeline = useCallback((duration: number) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    driverRef.current = { progress: 0 };

    const tl = gsap.timeline({
      paused: true,
      repeat: isLooping ? -1 : 0,
      onUpdate: () => {
        const time = tl.time();
        setState((prev) => ({
          ...prev,
          currentTime: time,
        }));
      },
      onComplete: () => {
        if (!isLooping) {
          setState((prev) => ({ ...prev, isPlaying: false }));
        }
      },
    });

    tl.to(driverRef.current, { progress: 1, duration, ease: "none" }, 0);
    
    timelineRef.current = tl;
    return tl;
  }, [isLooping]);

  const buildTimeline = useCallback((
    objects: GameObject[],
    animations: Animation[],
    keyframesByAnimation: Record<string, Keyframe[]>
  ) => {
    const duration = state.duration;
    const tl = createTimeline(duration);
    
    if (!canvasRef.current) {
      console.warn("Canvas ref not registered for timeline animations");
      return tl;
    }

    animations.forEach((animation) => {
      const object = objects.find((o) => o.id === animation.objectId);
      if (!object) return;

      const keyframes = keyframesByAnimation[animation.id] || [];
      if (keyframes.length === 0) return;

      const element = canvasRef.current?.querySelector(
        `[data-object-id="${object.id}"]`
      );
      if (!element) return;

      const propertyGroups = groupKeyframesByProperty(keyframes);

      Object.entries(propertyGroups).forEach(([property, sortedKeyframes]) => {
        const gsapProperty = PROPERTY_MAP[property] || property;

        if (sortedKeyframes.length === 0) return;

        const firstKf = sortedKeyframes[0];
        if (firstKf.time > 0) {
          const initialValue = getInitialValue(object, property);
          tl.set(element, { [gsapProperty]: initialValue }, 0);
        }

        for (let i = 0; i < sortedKeyframes.length; i++) {
          const kf = sortedKeyframes[i];
          const startTime = i === 0 ? 0 : sortedKeyframes[i - 1].time;
          const tweenDuration = kf.time - startTime;

          if (tweenDuration > 0) {
            tl.to(
              element,
              {
                [gsapProperty]: kf.value,
                duration: tweenDuration,
                ease: kf.ease,
              },
              startTime
            );
          } else {
            tl.set(element, { [gsapProperty]: kf.value }, kf.time);
          }
        }
      });
    });

    return tl;
  }, [createTimeline, state.duration]);

  const rebuildTimeline = useCallback((
    objects: GameObject[],
    animations: Animation[],
    keyframesByAnimation: Record<string, Keyframe[]>
  ) => {
    const wasPlaying = state.isPlaying;
    const currentTime = state.currentTime;
    
    buildTimeline(objects, animations, keyframesByAnimation);
    
    if (timelineRef.current) {
      timelineRef.current.seek(currentTime, false);
      if (wasPlaying) {
        timelineRef.current.play();
      }
    }
  }, [buildTimeline, state.isPlaying, state.currentTime]);

  const buildAndPlay = useCallback((
    objects: GameObject[],
    animations: Animation[],
    keyframesByAnimation: Record<string, Keyframe[]>
  ) => {
    buildTimeline(objects, animations, keyframesByAnimation);
    
    if (timelineRef.current) {
      timelineRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [buildTimeline]);

  const play = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause();
      timelineRef.current.seek(0);
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, state.duration));
    if (timelineRef.current) {
      timelineRef.current.seek(clampedTime, false);
    }
    setState((prev) => ({
      ...prev,
      currentTime: clampedTime,
    }));
  }, [state.duration]);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      const newLoop = !prev;
      if (timelineRef.current) {
        timelineRef.current.repeat(newLoop ? -1 : 0);
      }
      return newLoop;
    });
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, duration }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom }));
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.repeat(isLooping ? -1 : 0);
    }
  }, [isLooping]);

  const value: TimelineContextValue = {
    state,
    isLooping,
    play,
    pause,
    stop,
    seek,
    toggleLoop,
    setDuration,
    setZoom,
    registerCanvasRef,
    buildAndPlay,
    rebuildTimeline,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimelineContext() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimelineContext must be used within a TimelineProvider");
  }
  return context;
}

export function useOptionalTimelineContext() {
  return useContext(TimelineContext);
}
