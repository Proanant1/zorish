import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Send, BadgeCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CommentWithUser = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    verified: boolean;
  };
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

interface CommentSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export function CommentSheet({ postId, open, onClose, onCommentAdded }: CommentSheetProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: () => fetch(`/api/posts/${postId}/comments`).then(r => r.json()),
    enabled: open,
  });

  const addCommentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/posts/${postId}/comments`, { content: commentText.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      setCommentText("");
      onCommentAdded?.();
    },
  });

  const handleSubmit = () => {
    if (!commentText.trim() || !user) return;
    addCommentMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="bottom"
        className="h-[78vh] flex flex-col p-0 rounded-t-2xl"
        data-testid="comment-sheet-content"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-primary" />
            Replies
            {comments.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">({comments.length})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No replies yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">Be the first to reply!</p>
              </div>
            </div>
          ) : (
            comments.map((comment, i) => (
              <div key={comment.id}>
                <div className="flex gap-3 py-3" data-testid={`comment-${comment.id}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    {comment.user.avatarUrl && <AvatarImage src={comment.user.avatarUrl} />}
                    <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(comment.user.displayName))}>
                      {getInitials(comment.user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-sm">{comment.user.displayName}</span>
                      {comment.user.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt
                          ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                          : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
                {i < comments.length - 1 && <Separator className="opacity-30" />}
              </div>
            ))
          )}
        </div>

        {user ? (
          <div className="px-4 pb-4 pt-2 border-t border-border/50 shrink-0 space-y-2">
            <Textarea
              placeholder="Write a reply... (Ctrl+Enter to send)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none text-sm"
              data-testid="input-comment"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{commentText.length}/500</span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="gap-2 saffron-gradient text-white border-none"
                data-testid="button-submit-comment"
              >
                <Send className="h-3.5 w-3.5" />
                {addCommentMutation.isPending ? "Sending..." : "Reply"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-2 border-t border-border/50 shrink-0">
            <p className="text-sm text-center text-muted-foreground">Sign in to reply</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
