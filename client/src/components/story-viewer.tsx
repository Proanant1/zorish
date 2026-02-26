import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story, User } from "@shared/schema";

type StoryGroup = {
  user: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  stories: Story[];
  hasUnviewed: boolean;
};

const avatarColors = [
  "bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-sky-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h`;
}

const STORY_DURATION = 5000;

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

export function StoryViewer({ storyGroups, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const currentGroup = storyGroups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const viewMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await apiRequest("POST", `/api/stories/${storyId}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories/feed"] });
    },
  });

  const goNext = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, storyGroups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [storyIndex, groupIndex, storyGroups]);

  useEffect(() => {
    if (currentStory) {
      viewMutation.mutate(currentStory.id);
    }
  }, [currentStory?.id]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const interval = 50;
    timerRef.current = setInterval(() => {
      const nowElapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min((nowElapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        elapsedRef.current = 0;
        goNext();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      elapsedRef.current += Date.now() - startTimeRef.current;
    };
  }, [paused, goNext, storyIndex, groupIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev]);

  if (!currentGroup || !currentStory) return null;

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" data-testid="story-viewer">
      <button
        className="absolute top-0 left-0 right-0 bottom-0"
        onClick={onClose}
        data-testid="story-viewer-backdrop"
      />

      <div className="relative w-full max-w-md h-full max-h-[100dvh] flex flex-col bg-black z-10">
        <div className="flex gap-0.5 px-2 pt-2 z-20" data-testid="story-progress-bars">
          {currentGroup.stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-3 py-2 z-20">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-1 ring-white/20">
              {currentGroup.user.avatarUrl && (
                <AvatarImage src={currentGroup.user.avatarUrl} alt={currentGroup.user.displayName} />
              )}
              <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(currentGroup.user.displayName))}>
                {getInitials(currentGroup.user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold" data-testid="text-story-username">
                {currentGroup.user.displayName}
              </span>
              <span className="text-white/60 text-xs" data-testid="text-story-time">
                {formatTimeAgo(currentStory.createdAt)}
              </span>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onClose}
            data-testid="button-close-story"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          className="flex-1 relative flex items-center justify-center cursor-pointer select-none"
          onClick={handleTap}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          data-testid="story-content-area"
        >
          {currentStory.mediaType === "text" || (!currentStory.mediaUrl && currentStory.content) ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-rose-500 to-orange-500 p-8">
              <p className="text-white text-xl font-bold text-center leading-relaxed max-w-xs" data-testid="text-story-content">
                {currentStory.content}
              </p>
            </div>
          ) : currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl || ""}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              data-testid="video-story"
            />
          ) : (
            <img
              src={currentStory.mediaUrl || ""}
              alt="Story"
              className="w-full h-full object-contain"
              data-testid="img-story"
            />
          )}

          {currentStory.content && currentStory.mediaUrl && (
            <div className="absolute bottom-8 left-0 right-0 px-6 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-white text-sm text-center" data-testid="text-story-caption">
                  {currentStory.content}
                </p>
              </div>
            </div>
          )}
        </div>

        {groupIndex > 0 && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white visibility-visible"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            data-testid="button-story-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {groupIndex < storyGroups.length - 1 && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white visibility-visible"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            data-testid="button-story-next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
