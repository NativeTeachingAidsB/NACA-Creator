import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AvatarThrobberProps {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
  accentColor?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function hashToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm"
};

const spinnerSizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12"
};

export function AvatarThrobber({
  src,
  fallback = "?",
  size = "md",
  isLoading = true,
  className,
  accentColor
}: AvatarThrobberProps) {
  const initials = getInitials(fallback);
  const color = accentColor || hashToColor(fallback);

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      data-testid="avatar-throbber"
    >
      {isLoading && (
        <Loader2 
          className={cn(
            "absolute animate-spin",
            spinnerSizeClasses[size]
          )}
          style={{ color }}
        />
      )}
      
      <div 
        className={cn(
          "rounded-full flex items-center justify-center font-semibold overflow-hidden",
          sizeClasses[size],
          isLoading ? "opacity-70" : "opacity-100"
        )}
        style={{ 
          backgroundColor: src ? 'transparent' : `${color}20`,
          color: color,
          border: `2px solid ${color}30`
        }}
      >
        {src ? (
          <img 
            src={src} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </div>
  );
}

interface InlineThrobberProps {
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

const inlineSpinnerSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5"
};

export function InlineThrobber({
  isLoading = true,
  size = "md",
  className,
  color
}: InlineThrobberProps) {
  if (!isLoading) return null;
  
  return (
    <Loader2 
      className={cn(
        "animate-spin",
        inlineSpinnerSizes[size],
        className
      )}
      style={color ? { color } : undefined}
      data-testid="inline-throbber"
    />
  );
}
