import { cn } from "@/lib/utils";
import { Globe, FileText, ChevronRight } from "lucide-react";
import { useNacaCommunities, useNacaActivityDetails } from "@/hooks/use-naca";
import { AvatarThrobber, InlineThrobber } from "@/components/ui/avatar-throbber";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface CommunityContextBannerProps {
  communityId?: string | null;
  activityId?: string | null;
  activityName?: string;
  screenTitle?: string;
  isLoading?: boolean;
  className?: string;
}

function hashToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function CommunityContextBanner({
  communityId,
  activityId,
  activityName,
  screenTitle,
  isLoading = false,
  className
}: CommunityContextBannerProps) {
  const { data: communities } = useNacaCommunities();
  const { data: activityDetails, isLoading: isLoadingActivity } = useNacaActivityDetails(
    communityId || '',
    activityId || '',
    { enabled: !!communityId && !!activityId }
  );

  const community = communities?.find(c => c.id === communityId);
  
  if (!communityId || !community) {
    return null;
  }

  const accentColor = hashToColor(communityId);
  const displayActivityName = activityDetails?.name || activityName || 'Untitled Activity';
  const showLoading = isLoading || isLoadingActivity;

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/80 backdrop-blur-sm shadow-sm",
          className
        )}
        style={{
          borderColor: `${accentColor}40`,
          background: `linear-gradient(135deg, ${accentColor}08, transparent)`
        }}
        data-testid="community-context-banner"
      >
        <div className="relative shrink-0">
          {community.logoUrl ? (
            <div className="relative">
              {showLoading && (
                <InlineThrobber 
                  size="lg" 
                  className="absolute -inset-1" 
                  color={accentColor}
                />
              )}
              <img 
                src={community.logoUrl} 
                alt="" 
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: `2px solid ${accentColor}40` }}
              />
            </div>
          ) : (
            <AvatarThrobber
              fallback={community.name}
              size="md"
              isLoading={showLoading}
              accentColor={accentColor}
            />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span 
                  className="text-xs font-semibold truncate max-w-[120px] cursor-default"
                  style={{ color: accentColor }}
                >
                  {community.name}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Working in community: {community.name}</p>
                {community.subdomain && (
                  <p className="text-xs text-muted-foreground">{community.subdomain}</p>
                )}
              </TooltipContent>
            </Tooltip>
            
            {community.subdomain && (
              <Badge 
                variant="outline" 
                className="text-[9px] px-1 py-0 h-4 shrink-0"
                style={{ 
                  borderColor: `${accentColor}30`,
                  color: accentColor
                }}
              >
                {community.subdomain}
              </Badge>
            )}
          </div>

          {activityId && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[150px] cursor-default">
                    {displayActivityName}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Activity: {displayActivityName}</p>
                  {screenTitle && (
                    <p className="text-xs text-muted-foreground">Screen: {screenTitle}</p>
                  )}
                </TooltipContent>
              </Tooltip>
              {showLoading && (
                <InlineThrobber size="sm" color={accentColor} />
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface CompactCommunityBadgeProps {
  communityId: string;
  activityName?: string;
  isLoading?: boolean;
  className?: string;
}

export function CompactCommunityBadge({
  communityId,
  activityName,
  isLoading = false,
  className
}: CompactCommunityBadgeProps) {
  const { data: communities } = useNacaCommunities();
  const community = communities?.find(c => c.id === communityId);

  if (!community) return null;

  const accentColor = hashToColor(communityId);

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
        className
      )}
      style={{
        backgroundColor: `${accentColor}15`,
        color: accentColor,
        border: `1px solid ${accentColor}30`
      }}
      data-testid="compact-community-badge"
    >
      {community.logoUrl ? (
        <img 
          src={community.logoUrl} 
          alt="" 
          className="w-4 h-4 rounded-full object-cover"
        />
      ) : (
        <Globe className="w-3 h-3" />
      )}
      <span className="truncate max-w-[80px]">{community.name}</span>
      {activityName && (
        <>
          <ChevronRight className="w-2.5 h-2.5 opacity-50" />
          <span className="truncate max-w-[60px] opacity-80">{activityName}</span>
        </>
      )}
      {isLoading && <InlineThrobber size="sm" color={accentColor} />}
    </div>
  );
}
