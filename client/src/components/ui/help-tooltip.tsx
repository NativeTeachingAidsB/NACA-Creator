import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, Play, Pause, X, Video, Trash2, Circle, RefreshCw } from "lucide-react";
import { useFeatureHelpByKey, useRecordHelpView, useUpdateFeatureHelp } from "@/hooks/use-feature-help";
import { useUserSettings } from "@/hooks/use-user-settings";
import { cn } from "@/lib/utils";
import { useRecording } from "@/contexts/RecordingContext";
import { toast } from "@/hooks/use-toast";

interface HelpTooltipProps {
  featureKey: string;
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  showIcon?: boolean;
  iconSize?: number;
  className?: string;
}

export function HelpTooltip({
  featureKey,
  children,
  side = "top",
  align = "center",
  showIcon = true,
  iconSize = 14,
  className,
}: HelpTooltipProps) {
  const { settings } = useUserSettings();
  const { data: help, isLoading } = useFeatureHelpByKey(featureKey);
  const recordView = useRecordHelpView();
  const updateHelp = useUpdateFeatureHelp();
  const recording = useRecording();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hasRecordedView = React.useRef(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const showVideo = settings.videoHelpEnabled && help?.videoUrl;
  const helpTooltipsEnabled = settings.showHelpTooltips;
  const hasVideo = !!help?.videoUrl;
  const canRecord = !!recording && !recording.isRecording;
  
  const handleStartRecording = React.useCallback(() => {
    if (recording && !recording.isRecording) {
      setIsOpen(false);
      recording.startRecording(featureKey);
    }
  }, [recording, featureKey]);
  
  const handleDeleteVideo = React.useCallback(() => {
    if (help?.id) {
      updateHelp.mutate({ id: help.id, videoUrl: "" });
      toast({
        title: "Video removed",
        description: "The help video has been deleted.",
      });
    }
  }, [help?.id, updateHelp]);

  React.useEffect(() => {
    if (isOpen && help && !hasRecordedView.current && helpTooltipsEnabled) {
      hasRecordedView.current = true;
      recordView.mutate(featureKey);
    }
  }, [isOpen, help, featureKey, recordView, helpTooltipsEnabled]);

  React.useEffect(() => {
    if (isOpen && videoRef.current && showVideo && settings.autoPlayVideos) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen, showVideo, settings.autoPlayVideos]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // If help tooltips are disabled, just render children without tooltip wrapper
  if (!helpTooltipsEnabled) {
    return children ? <>{children}</> : null;
  }

  if (!help && !isLoading) {
    return children ? <>{children}</> : null;
  }

  const trigger = children || (
    showIcon && (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
          className
        )}
        data-testid={`help-tooltip-${featureKey}`}
      >
        <HelpCircle size={iconSize} />
      </button>
    )
  );

  return (
    <HoverCard openDelay={300} closeDelay={150} open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className="w-80 p-0 overflow-hidden"
        data-testid={`help-content-${featureKey}`}
      >
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : help ? (
          <div className="flex flex-col">
            {showVideo && help.videoUrl && (
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={help.videoUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                  data-testid={`help-video-toggle-${featureKey}`}
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white" />
                  )}
                </button>
              </div>
            )}
            <div className="p-3 space-y-1.5">
              <h4 className="font-medium text-sm">{help.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {help.description}
              </p>
              {help.shortcutKey && (
                <div className="pt-1.5 flex flex-wrap gap-1.5">
                  {help.shortcutKey.split(",").map((shortcut: string, i: number) => (
                    <kbd
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border"
                    >
                      {shortcut.trim()}
                    </kbd>
                  ))}
                </div>
              )}
              
              {canRecord && (
                <div className="pt-2 flex items-center gap-1.5 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs flex-1"
                    onClick={handleStartRecording}
                    data-testid={`help-record-${featureKey}`}
                  >
                    {hasVideo ? (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Re-record
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                        Record
                      </>
                    )}
                  </Button>
                  {hasVideo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDeleteVideo}
                      data-testid={`help-delete-video-${featureKey}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

interface HelpPopoverProps {
  featureKey: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function HelpPopover({
  featureKey,
  children,
  side = "right",
  align = "start",
}: HelpPopoverProps) {
  const { settings } = useUserSettings();
  const { data: help, isLoading } = useFeatureHelpByKey(featureKey);
  const recordView = useRecordHelpView();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hasRecordedView = React.useRef(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const showVideo = settings.videoHelpEnabled && help?.videoUrl;
  const helpTooltipsEnabled = settings.showHelpTooltips;

  React.useEffect(() => {
    if (isOpen && help && !hasRecordedView.current && helpTooltipsEnabled) {
      hasRecordedView.current = true;
      recordView.mutate(featureKey);
    }
  }, [isOpen, help, featureKey, recordView, helpTooltipsEnabled]);

  React.useEffect(() => {
    if (isOpen && videoRef.current && showVideo && settings.autoPlayVideos) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen, showVideo, settings.autoPlayVideos]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // If help tooltips are disabled, just render children without popover wrapper
  if (!helpTooltipsEnabled) {
    return <>{children}</>;
  }

  if (!help && !isLoading) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-96 p-0 overflow-hidden"
        data-testid={`help-popover-${featureKey}`}
      >
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : help ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
              <h4 className="font-medium text-sm">{help.title}</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                data-testid={`help-popover-close-${featureKey}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {showVideo && help.videoUrl && (
              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  src={help.videoUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted
                  playsInline
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
            <div className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {help.description}
              </p>
              {help.shortcutKey && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {help.shortcutKey.split(",").map((shortcut: string, i: number) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
                    >
                      {shortcut.trim()}
                    </kbd>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

interface HelpBadgeProps {
  featureKey: string;
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function HelpBadge({ featureKey, label, side = "top" }: HelpBadgeProps) {
  const { data: help } = useFeatureHelpByKey(featureKey);

  if (!help) return null;

  return (
    <HelpTooltip featureKey={featureKey} side={side}>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded cursor-help">
        {label || "?"} 
        <HelpCircle size={10} />
      </span>
    </HelpTooltip>
  );
}
