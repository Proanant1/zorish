import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserBadge } from "@/components/user-badge";
import {
  Heart, MessageCircle, Share2, Volume2, VolumeX,
  Loader2, ChevronUp, ChevronDown, Play, Clapperboard, ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { PostWithUser } from "@shared/schema";

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

function ReelCard({
  post,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onComment,
  onShare,
}: {
  post: PostWithUser;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: (postId: string) => void;
  onComment: (post: PostWithUser) => void;
  onShare: (post: PostWithUser) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [heartAnim, setHeartAnim] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const handleVideoClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
    }
    lastTapRef.current = now;

    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(c => c + 1);
      onLike(post.id);
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleLikeBtn = () => {
    setLiked(l => {
      const newLiked = !l;
      setLikesCount(c => newLiked ? c + 1 : Math.max(0, c - 1));
      onLike(post.id);
      return newLiked;
    });
  };

  const handleShare = async () => {
    onShare(post);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.displayName} on FreeFinity India`,
          text: post.content,
          url: window.location.origin,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div
      className="relative flex-shrink-0 w-full h-full bg-black overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
      data-testid={`reel-card-${post.id}`}
    >
      <video
        ref={videoRef}
        src={post.videoUrl ?? ""}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        onLoadedData={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={handleVideoClick}
        data-testid={`video-${post.id}`}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/40 rounded-full p-4">
            <Play className="h-10 w-10 text-white fill-white" />
          </div>
        </div>
      )}

      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart
            className="h-24 w-24 text-red-500 fill-red-500 animate-ping"
            style={{ animationDuration: "0.6s", animationIterationCount: 1 }}
          />
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 35%, transparent 60%)",
        }}
        onClick={handleVideoClick}
      />

      <div className="absolute bottom-0 left-0 right-16 px-4 pb-6 z-10">
        <Link href={`/user/${post.user.username}`}>
          <div className="flex items-center gap-2.5 mb-3 cursor-pointer group">
            <Avatar className="h-9 w-9 ring-2 ring-white/30 group-hover:ring-white/60 transition-all">
              {post.user.avatarUrl && <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(post.user.displayName))}>{getInitials(post.user.displayName)}</AvatarFallback>}
              {post.user.avatarUrl ? <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(post.user.displayName))}>{getInitials(post.user.displayName)}</AvatarFallback> : null}
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm drop-shadow">{post.user.displayName}</span>
                <UserBadge badgeType={(post.user as any).badgeType} verified={post.user.verified} size="sm" />
              </div>
              <span className="text-white/70 text-xs">@{post.user.username}</span>
            </div>
          </div>
        </Link>

        {post.content && (
          <p className="text-white text-sm leading-relaxed drop-shadow-md line-clamp-3" data-testid={`reel-caption-${post.id}`}>
            {post.content}
          </p>
        )}
      </div>

      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-5 z-10">
        <button
          onClick={handleLikeBtn}
          className="flex flex-col items-center gap-1 group"
          data-testid={`reel-like-${post.id}`}
        >
          <div className={cn(
            "flex items-center justify-center h-11 w-11 rounded-full transition-all duration-200",
            liked ? "bg-red-500/20" : "bg-black/30 hover:bg-black/50"
          )}>
            <Heart className={cn(
              "h-6 w-6 transition-all duration-200",
              liked ? "fill-red-500 text-red-500 scale-110" : "text-white"
            )} />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">{likesCount > 0 ? likesCount : ""}</span>
        </button>

        <button
          onClick={() => onComment(post)}
          className="flex flex-col items-center gap-1 group"
          data-testid={`reel-comment-${post.id}`}
        >
          <div className="flex items-center justify-center h-11 w-11 rounded-full bg-black/30 hover:bg-black/50 transition-all">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">{(post.commentsCount ?? 0) > 0 ? post.commentsCount : ""}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
          data-testid={`reel-share-${post.id}`}
        >
          <div className="flex items-center justify-center h-11 w-11 rounded-full bg-black/30 hover:bg-black/50 transition-all">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">Share</span>
        </button>

        <button
          onClick={onMuteToggle}
          className="flex items-center justify-center h-11 w-11 rounded-full bg-black/30 hover:bg-black/50 transition-all"
          data-testid="reel-mute-toggle"
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
        </button>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const { data: videos = [], isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts/videos"],
    staleTime: 60000,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("POST", `/api/posts/${postId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/videos"] });
    },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((direction: "up" | "down") => {
    const container = containerRef.current;
    if (!container) return;
    const itemHeight = container.clientHeight;
    const target = direction === "down"
      ? Math.min(activeIndex + 1, videos.length - 1)
      : Math.max(activeIndex - 1, 0);
    container.scrollTo({ top: target * itemHeight, behavior: "smooth" });
    setActiveIndex(target);
  }, [activeIndex, videos.length]);

  const handleShare = async (post: PostWithUser) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.user.displayName, text: post.content, url: window.location.origin });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Link copied!" });
    }
  };

  const BackButton = () => (
    <button
      onClick={() => navigate("/")}
      className="absolute top-4 left-4 z-50 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-2 text-sm font-medium transition-all backdrop-blur-sm"
      data-testid="button-reels-back"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-black">
        <BackButton />
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
          <p className="text-sm text-white/60">Loading Reels...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-black">
        <BackButton />
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
            <Clapperboard className="h-10 w-10 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">No Reels Yet</p>
            <p className="text-white/50 text-sm mt-1">
              Be the first to share a video reel. Upload a video from the feed to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-40 lg:ml-[260px]" data-testid="reels-page">
      <BackButton />
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {videos.map((post, idx) => (
          <div key={post.id} style={{ height: "100dvh", scrollSnapAlign: "start", flexShrink: 0 }}>
            <ReelCard
              post={post}
              isActive={idx === activeIndex}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(m => !m)}
              onLike={(id) => likeMutation.mutate(id)}
              onComment={() => {}}
              onShare={handleShare}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 hidden lg:flex">
        <button
          onClick={() => scrollTo("up")}
          disabled={activeIndex === 0}
          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 flex items-center justify-center transition-all"
          data-testid="reel-scroll-up"
        >
          <ChevronUp className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={() => scrollTo("down")}
          disabled={activeIndex === videos.length - 1}
          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 disabled:opacity-30 flex items-center justify-center transition-all"
          data-testid="reel-scroll-down"
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-24 lg:bottom-6 flex gap-1.5 z-50">
        {videos.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-full transition-all duration-300",
              idx === activeIndex
                ? "w-4 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
