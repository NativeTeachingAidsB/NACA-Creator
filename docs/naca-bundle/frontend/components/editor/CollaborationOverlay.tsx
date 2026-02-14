import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface CollaboratorUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursorX?: number;
  cursorY?: number;
  isOnline: boolean;
}

export interface Comment {
  id: string;
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: Date;
  replies: CommentReply[];
  resolved: boolean;
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

// Real users will be provided via props when collaboration is connected
// Empty arrays used as defaults - no mock/dummy users shown
const DEFAULT_USERS: CollaboratorUser[] = [];
const DEFAULT_COMMENTS: Comment[] = [];

interface UserCursorProps {
  user: CollaboratorUser;
  zoom: number;
}

function UserCursor({ user, zoom }: UserCursorProps) {
  const [position, setPosition] = useState({ x: user.cursorX || 0, y: user.cursorY || 0 });
  const animationRef = useRef<number | null>(null);
  const targetRef = useRef({ x: user.cursorX || 0, y: user.cursorY || 0 });

  useEffect(() => {
    targetRef.current = { x: user.cursorX || 0, y: user.cursorY || 0 };
  }, [user.cursorX, user.cursorY]);

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setPosition(prev => {
        const dx = targetRef.current.x - prev.x;
        const dy = targetRef.current.y - prev.y;
        const speed = 8;
        
        return {
          x: prev.x + dx * Math.min(speed * delta, 1),
          y: prev.y + dy * Math.min(speed * delta, 1),
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomOffsetX = (Math.random() - 0.5) * 60;
      const randomOffsetY = (Math.random() - 0.5) * 60;
      targetRef.current = {
        x: (user.cursorX || 200) + randomOffsetX,
        y: (user.cursorY || 200) + randomOffsetY,
      };
    }, 2000 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [user.cursorX, user.cursorY]);

  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-300"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 10000,
        transform: 'translate(-2px, -2px)',
      }}
      data-testid={`cursor-${user.id}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M5.65376 12.456H2.03125L13.0317 1.45575V5.62052L5.65376 12.456Z"
          fill={user.color}
          transform="translate(0, 2)"
        />
        <path
          d="M2.03125 12.456L5.65376 12.456L8.5 20L6 15L2.03125 12.456Z"
          fill={user.color}
          transform="translate(0, 2)"
        />
        <path
          d="M5.65376 12.456H2.03125L13.0317 1.45575V5.62052L5.65376 12.456Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
          transform="translate(0, 2)"
        />
      </svg>
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap shadow-sm"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}

interface AvatarStackProps {
  users: CollaboratorUser[];
  maxVisible?: number;
  className?: string;
}

export function AvatarStack({ users, maxVisible = 5, className }: AvatarStackProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - maxVisible);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn("flex items-center -space-x-2", className)}
          data-testid="avatar-stack"
        >
          {visibleUsers.map((user, index) => (
            <Avatar
              key={user.id}
              className={cn(
                "h-7 w-7 border-2 border-background ring-2 transition-transform hover:scale-110 hover:z-10",
                user.isOnline && "ring-green-400"
              )}
              style={{ 
                zIndex: visibleUsers.length - index,
                borderColor: user.color,
              }}
              data-testid={`avatar-${user.id}`}
            >
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback
                className="text-[10px] font-semibold text-white"
                style={{ backgroundColor: user.color }}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {overflowCount > 0 && (
            <div
              className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
              style={{ zIndex: 0 }}
              data-testid="avatar-overflow"
            >
              +{overflowCount}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <div className="space-y-1">
          <p className="font-semibold text-xs">{users.length} collaborator{users.length !== 1 ? 's' : ''} online</p>
          <div className="text-xs text-muted-foreground">
            {users.map(u => u.name).join(", ")}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface CommentPinProps {
  comment: Comment;
  zoom: number;
  isSelected: boolean;
  onClick: () => void;
}

export function CommentPin({ comment, zoom, isSelected, onClick }: CommentPinProps) {
  const totalReplies = comment.replies.length;
  const scale = Math.max(0.5, Math.min(1, 100 / zoom));

  return (
    <div
      className="absolute cursor-pointer transition-transform duration-200 hover:scale-110"
      style={{
        left: comment.x,
        top: comment.y,
        zIndex: isSelected ? 10002 : 10001,
        transform: `translate(-50%, -100%) scale(${scale})`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      data-testid={`comment-pin-${comment.id}`}
    >
      <div className="relative">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
            isSelected && "ring-2 ring-offset-2 ring-offset-background"
          )}
          style={{ 
            backgroundColor: comment.userColor,
            boxShadow: isSelected 
              ? `0 0 0 3px ${comment.userColor}40, 0 4px 12px rgba(0,0,0,0.15)` 
              : '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
        </div>
        {totalReplies > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center"
            variant="default"
            data-testid={`comment-badge-${comment.id}`}
          >
            {totalReplies + 1}
          </Badge>
        )}
        <div
          className="absolute left-1/2 bottom-0 w-0 h-0 -translate-x-1/2 translate-y-full"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `8px solid ${comment.userColor}`,
          }}
        />
      </div>
    </div>
  );
}

interface CommentThreadProps {
  comment: Comment;
  onClose: () => void;
  onAddReply: (commentId: string, content: string) => void;
}

function CommentThread({ comment, onClose, onAddReply }: CommentThreadProps) {
  const [replyText, setReplyText] = useState("");

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(comment.id, replyText.trim());
      setReplyText("");
    }
  };

  return (
    <div 
      className="w-72 bg-popover border rounded-lg shadow-xl overflow-hidden"
      data-testid={`comment-thread-${comment.id}`}
    >
      <div 
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: `${comment.userColor}20` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: comment.userColor }}
          >
            {comment.userName[0]}
          </div>
          <span className="text-sm font-medium">{comment.userName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
          data-testid="close-comment-thread"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <div className="px-3 py-2 border-b">
          <p className="text-sm">{comment.content}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatTime(comment.timestamp)}</p>
        </div>
        
        {comment.replies.map((reply) => (
          <div key={reply.id} className="px-3 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-medium">{reply.userName}</span>
              <span className="text-xs text-muted-foreground">· {formatTime(reply.timestamp)}</span>
            </div>
            <p className="text-sm">{reply.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
        <input
          type="text"
          placeholder="Reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="flex-1 text-sm px-2 py-1 rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          data-testid="comment-reply-input"
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-7 w-7"
          disabled={!replyText.trim()}
          data-testid="comment-reply-submit"
        >
          <Send className="h-3 w-3" />
        </Button>
      </form>
    </div>
  );
}

interface CollaborationOverlayProps {
  isEnabled: boolean;
  isCommentMode: boolean;
  zoom: number;
  panX: number;
  panY: number;
  onAddComment?: (x: number, y: number) => void;
}

export function CollaborationOverlay({
  isEnabled,
  isCommentMode,
  zoom,
  panX,
  panY,
  onAddComment,
}: CollaborationOverlayProps) {
  const [users] = useState<CollaboratorUser[]>(DEFAULT_USERS);
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const handlePinClick = useCallback((commentId: string) => {
    setSelectedCommentId(prev => prev === commentId ? null : commentId);
  }, []);

  const handleCloseThread = useCallback(() => {
    setSelectedCommentId(null);
  }, []);

  const handleAddReply = useCallback((commentId: string, content: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...c.replies,
            {
              id: `reply-${Date.now()}`,
              userId: "current-user",
              userName: "You",
              content,
              timestamp: new Date(),
            }
          ]
        };
      }
      return c;
    }));
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!isCommentMode || !onAddComment) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left - panX) / scale;
    const y = (e.clientY - rect.top - panY) / scale;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      x,
      y,
      userId: "current-user",
      userName: "You",
      userColor: "#8b5cf6",
      content: "New comment",
      timestamp: new Date(),
      replies: [],
      resolved: false,
    };
    
    setComments(prev => [...prev, newComment]);
    setSelectedCommentId(newComment.id);
    onAddComment(x, y);
  }, [isCommentMode, zoom, panX, panY, onAddComment]);

  const selectedComment = comments.find(c => c.id === selectedCommentId);

  if (!isEnabled) return null;

  return (
    <>
      {users.filter(u => u.cursorX !== undefined && u.cursorY !== undefined).map(user => (
        <UserCursor key={user.id} user={user} zoom={zoom} />
      ))}
      
      {comments.map(comment => (
        <CommentPin
          key={comment.id}
          comment={comment}
          zoom={zoom}
          isSelected={selectedCommentId === comment.id}
          onClick={() => handlePinClick(comment.id)}
        />
      ))}
      
      {selectedComment && (
        <div
          className="absolute"
          style={{
            left: selectedComment.x + 20,
            top: selectedComment.y - 10,
            zIndex: 10003,
          }}
        >
          <CommentThread
            comment={selectedComment}
            onClose={handleCloseThread}
            onAddReply={handleAddReply}
          />
        </div>
      )}
      
      {isCommentMode && (
        <div
          className="absolute inset-0 cursor-crosshair"
          style={{ zIndex: 9999 }}
          onClick={handleCanvasClick}
        />
      )}
    </>
  );
}

export function CommentModeButton({
  isActive,
  onClick,
  className,
  iconClassName,
}: {
  isActive: boolean;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            className,
            isActive && "bg-accent text-accent-foreground"
          )}
          onClick={onClick}
          data-testid="button-comment-mode"
        >
          <MessageCircle className={iconClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isActive ? "Exit Comment Mode" : "Add Comment"}</TooltipContent>
    </Tooltip>
  );
}

export function CollaborationToolbarSection({
  className,
  users = DEFAULT_USERS,
}: {
  className?: string;
  users?: CollaboratorUser[];
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {users.length > 0 && <AvatarStack users={users} maxVisible={4} />}
    </div>
  );
}
