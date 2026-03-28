import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, ThumbsDown, MessageCircle, Repeat2, Star, Share2, Globe, Volume2, VolumeX } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PostWithUser } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { CommentSheet } from "@/components/comment-sheet";
import { useToast } from "@/hooks/use-toast";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const avatarColors = [
  "bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-sky-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function PollDisplay({ post }: { post: PostWithUser }) {
  const { user } = useAuth();
  const [votedIdx, setVotedIdx] = useState<number | null>(post.votedOption ?? null);
  const [localVotes, setLocalVotes] = useState<number[]>(post.pollVotes || []);

  const voteMutation = useMutation({
    mutationFn: async (optionIndex: number) => {
      await apiRequest("POST", `/api/posts/${post.id}/vote`, { optionIndex });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleVote = (idx: number) => {
    if (votedIdx !== null || !user) return;
    setVotedIdx(idx);
    const updated = [...localVotes];
    updated[idx] = (updated[idx] || 0) + 1;
    setLocalVotes(updated);
    voteMutation.mutate(idx);
  };

  const totalVotes = localVotes.reduce((a, b) => a + (b || 0), 0);
  const options = post.pollOptions || [];
  const hasVoted = votedIdx !== null;

  return (
    <div className="mt-2 space-y-2" data-testid={`poll-${post.id}`}>
      {post.pollQuestion && (
        <p className="text-sm font-medium">{post.pollQuestion}</p>
      )}
      {options.map((option, i) => {
        const votes = localVotes[i] || 0;
        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const isSelected = votedIdx === i;

        return (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={hasVoted}
            className={cn(
              "relative w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all overflow-hidden",
              hasVoted ? "cursor-default" : "cursor-pointer hover:border-primary/50",
              isSelected && "border-primary"
            )}
            data-testid={`poll-option-${post.id}-${i}`}
          >
            {hasVoted && (
              <div
                className={cn(
                  "absolute inset-0 rounded-lg transition-all",
                  isSelected ? "bg-primary/15" : "bg-muted/50"
                )}
                style={{ width: `${pct}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className={cn(isSelected && "font-medium")}>{option}</span>
              {hasVoted && (
                <span className="text-xs text-muted-foreground ml-2">{pct}%</span>
              )}
            </div>
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
}

function AudioPlayer({ url }: { url: string }) {
  return (
    <div className="mt-2 rounded-lg border p-2 bg-muted/30" data-testid="audio-player">
      <audio controls className="w-full h-8" src={url}>
        Your browser does not support audio.
      </audio>
    </div>
  );
}

export function PostCard({ post }: { post: PostWithUser }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(post.liked);
  const [disliked, setDisliked] = useState(post.disliked);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [reposted, setReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", "user"] });
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/dislike`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/bookmark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/repost`);
      return res.json();
    },
    onSuccess: (data: { reposted: boolean }) => {
      setReposted(data.reposted);
      setRepostCount(prev => data.reposted ? prev + 1 : Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: data.reposted ? "Re-Up'd!" : "Re-Up removed",
        description: data.reposted ? "Post shared to your followers." : "Post removed from your profile.",
      });
    },
  });

  const handleLike = () => {
    if (!user) return;
    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      if (disliked) {
        setDisliked(false);
        setDislikesCount(prev => prev - 1);
      }
    }
    likeMutation.mutate();
  };

  const handleDislike = () => {
    if (!user) return;
    if (disliked) {
      setDisliked(false);
      setDislikesCount(prev => prev - 1);
    } else {
      setDisliked(true);
      setDislikesCount(prev => prev + 1);
      if (liked) {
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }
    dislikeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!user) return;
    setBookmarked(!bookmarked);
    bookmarkMutation.mutate();
  };

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(post.content)}&langpair=en|hi`
      );
      const data = await res.json();
      if (data.responseData?.translatedText && data.responseData.translatedText !== post.content) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        const res2 = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(post.content)}&langpair=hi|en`
        );
        const data2 = await res2.json();
        if (data2.responseData?.translatedText) {
          setTranslatedText(data2.responseData.translatedText);
        } else {
          setTranslatedText("Translation unavailable");
        }
      }
    } catch {
      setTranslatedText("Translation unavailable");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const rawText = translatedText || post.content;
    const textToRead = rawText.replace(/#(\w+)/g, "$1").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = translatedText ? "hi-IN" : "en-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/user/${post.user.username}`;
    const shareText = `"${post.content.slice(0, 100)}${post.content.length > 100 ? "..." : ""}" — ${post.user.displayName} on Zorish`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Zorish", text: shareText, url: shareUrl });
        return;
      } catch { }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({ title: "Copied to clipboard", description: "Post link copied successfully." });
    } catch {
      toast({ title: "Share", description: shareUrl });
    }
  };

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <Link key={i} href={`/trending?tag=${part.slice(1)}`}>
            <span className="hashtag-teal font-medium cursor-pointer text-teal-400 dark:text-teal-400 hover:text-teal-300">{part}</span>
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <article className="border-b px-4 py-3 transition-colors" data-testid={`post-card-${post.id}`}>
      <div className="flex gap-3">
        <Link href={`/user/${post.user.username}`}>
          <Avatar className="h-10 w-10 cursor-pointer">
            {post.user.avatarUrl && <AvatarImage src={post.user.avatarUrl} />}
            <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(post.user.displayName))}>
              {getInitials(post.user.displayName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link href={`/user/${post.user.username}`}>
              <span className="font-semibold text-sm cursor-pointer" data-testid={`text-author-${post.id}`}>
                {post.user.displayName}
              </span>
            </Link>
            <UserBadge badgeType={(post.user as any).badgeType} verified={post.user.verified} size="sm" />
            <span className="text-xs text-muted-foreground">@{post.user.username}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo}</span>
          </div>

          {post.content && (
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-content-${post.id}`}>
              {renderContent(post.content)}
            </p>
          )}

          {(post as any).videoUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border bg-black">
              <video
                src={(post as any).videoUrl}
                controls
                preload="metadata"
                className="w-full max-h-80 object-contain"
                data-testid={`video-post-${post.id}`}
              />
            </div>
          )}

          {post.imageUrl && !(post as any).videoUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border">
              <img src={post.imageUrl} alt="" className="w-full object-cover max-h-80" data-testid={`img-post-${post.id}`} />
            </div>
          )}

          {post.audioUrl && (
            <AudioPlayer url={post.audioUrl} />
          )}

          {post.postType === "poll" && post.pollOptions && post.pollOptions.length > 0 && (
            <PollDisplay post={post} />
          )}

          {translatedText && (
            <div className="mt-2 rounded-lg bg-muted/50 p-2.5 text-sm leading-relaxed border border-gray-300/50" data-testid={`text-translated-${post.id}`}>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Translated</span>
              <p className="mt-0.5">{translatedText}</p>
            </div>
          )}

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
                <Link key={tag} href={`/trending?tag=${tag}`}>
                  <Badge variant="secondary" className="hashtag-badge text-xs cursor-pointer border">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-1 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-xs btn-impressive", liked && "active")}
              style={liked ? { color: "#22C55E" } : undefined}
              onClick={handleLike}
              title="Impressive"
              data-testid={`button-impressive-${post.id}`}
            >
              <Heart className={cn("h-4 w-4 transition-all duration-200")} style={liked ? { fill: "#22C55E", color: "#22C55E" } : undefined} />
              <span>{likesCount > 0 ? likesCount : ""}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-xs btn-dislike", disliked && "active")}
              style={disliked ? { color: "#EF4444" } : undefined}
              onClick={handleDislike}
              title="Not Impressive"
              data-testid={`button-dislike-${post.id}`}
            >
              <ThumbsDown className="h-4 w-4 transition-all duration-200" style={disliked ? { fill: "#EF4444", color: "#EF4444" } : undefined} />
              <span>{dislikesCount > 0 ? dislikesCount : ""}</span>
            </Button>
            {post.commentsEnabled === false ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-2" data-testid={`text-comments-disabled-${post.id}`}>
                <MessageCircle className="h-4 w-4" />
                <span>Off</span>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs btn-action"
                title="Reply"
                onClick={() => setCommentSheetOpen(true)}
                data-testid={`button-comment-${post.id}`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount > 0 ? commentsCount : ""}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-xs btn-reup", reposted && "active")}
              style={reposted ? { color: "#F59E0B" } : undefined}
              title="Re-Up"
              onClick={() => { if (!user) return; repostMutation.mutate(); }}
              disabled={repostMutation.isPending}
              data-testid={`button-reup-${post.id}`}
            >
              <Repeat2 className="h-4 w-4" style={reposted ? { color: "#F59E0B" } : undefined} />
              <span>{repostCount > 0 ? repostCount : ""}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1.5 text-xs btn-action", bookmarked && "text-amber-400")}
              onClick={handleBookmark}
              title="Save"
              data-testid={`button-bookmark-${post.id}`}
            >
              <Star className={cn("h-4 w-4 transition-all duration-200")} style={bookmarked ? { fill: "#F59E0B", color: "#F59E0B" } : undefined} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 text-xs btn-saffron-subtle", translatedText && "active")}
              onClick={handleTranslate}
              disabled={isTranslating}
              title="Translate"
              data-testid={`button-translate-${post.id}`}
            >
              <Globe className={cn("h-4 w-4", isTranslating && "animate-spin")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 text-xs btn-saffron-subtle", isSpeaking && "active")}
              onClick={handleListen}
              title="Listen"
              data-testid={`button-listen-${post.id}`}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs btn-action"
              title="Share"
              onClick={handleShare}
              data-testid={`button-share-${post.id}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CommentSheet
        postId={post.id}
        open={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
      />
    </article>
  );
}
