import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, Repeat2, MessageCircle, UserPlus, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/app-layout";
import { useToast } from "@/hooks/use-toast";

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

type NotifWithUser = {
  id: string;
  type: string;
  postId: string | null;
  read: boolean | null;
  createdAt: string | null;
  fromUser: { id: string; username: string; displayName: string; avatarUrl: string | null };
};

type FollowRequestWithUser = {
  id: string;
  status: string;
  createdAt: string | null;
  requester: { id: string; username: string; displayName: string; avatarUrl: string | null };
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: notifs = [], isLoading } = useQuery<NotifWithUser[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: followRequests = [] } = useQuery<FollowRequestWithUser[]>({
    queryKey: ["/api/follow-requests"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/follow-requests/${id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "Follow request accepted" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/follow-requests/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-requests"] });
      toast({ title: "Follow request rejected" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  useEffect(() => {
    markReadMutation.mutate();
  }, []);

  return (
    <AppLayout title="Alerts">
    <div className="min-h-screen" data-testid="notifications-page">
      <div className="hidden lg:block sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3">
        <h1 className="text-lg font-bold">Alerts</h1>
      </div>

      {followRequests.length > 0 && (
        <div className="border-b" data-testid="follow-requests-section">
          <div className="px-4 py-2 bg-muted/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Match Requests</p>
          </div>
          <ul>
            {followRequests.map((fr) => (
              <li
                key={fr.id}
                className="flex items-center gap-3 px-4 py-3 border-b bg-primary/5"
                data-testid={`follow-request-${fr.id}`}
              >
                <Link href={`/user/${fr.requester.username}`}>
                  <Avatar className="h-10 w-10 cursor-pointer shrink-0">
                    {fr.requester.avatarUrl && <AvatarImage src={fr.requester.avatarUrl} />}
                    <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(fr.requester.displayName))}>
                      {getInitials(fr.requester.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <Link href={`/user/${fr.requester.username}`}>
                      <span className="font-semibold cursor-pointer hover:underline">{fr.requester.displayName}</span>
                    </Link>
                    {" "}
                    <span className="text-muted-foreground">wants to Match with you</span>
                  </p>
                  {fr.createdAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(fr.createdAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate(fr.id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    data-testid={`button-accept-request-${fr.id}`}
                  >
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectMutation.mutate(fr.id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    data-testid={`button-reject-request-${fr.id}`}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : notifs.length === 0 && followRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Heart className="h-10 w-10 opacity-30" />
          <p className="text-sm">No notifications yet.</p>
          <p className="text-xs opacity-60">Impressive, Re-Up, Reply, and new Matcher alerts will appear here.</p>
        </div>
      ) : (
        <ul>
          {notifs.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 border-b transition-colors",
                !n.read && "bg-primary/5"
              )}
              data-testid={`notification-${n.id}`}
            >
              <Link href={`/user/${n.fromUser.username}`}>
                <Avatar className="h-10 w-10 cursor-pointer shrink-0">
                  {n.fromUser.avatarUrl && <AvatarImage src={n.fromUser.avatarUrl} />}
                  <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(n.fromUser.displayName))}>
                    {getInitials(n.fromUser.displayName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
                  <Link href={`/user/${n.fromUser.username}`}>
                    <span className="font-semibold cursor-pointer hover:underline">{n.fromUser.displayName}</span>
                  </Link>
                  {" "}
                  <span className="text-muted-foreground">
                    {n.type === "impressive"
                      ? "found your post Impressive"
                      : n.type === "reup"
                      ? "Re-Up'd your post"
                      : n.type === "reply"
                      ? "replied to your post"
                      : n.type === "match"
                      ? "is now your Matcher"
                      : n.type === "follow_request"
                      ? "sent you a Match request"
                      : n.type}
                  </span>
                </p>
                {n.createdAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                )}
              </div>
              {n.type === "impressive" && (
                <Heart className="h-4 w-4 shrink-0 mt-1" style={{ fill: "#22C55E", color: "#22C55E" }} />
              )}
              {n.type === "reup" && (
                <Repeat2 className="h-4 w-4 shrink-0 mt-1" style={{ color: "#F59E0B" }} />
              )}
              {n.type === "reply" && (
                <MessageCircle className="h-4 w-4 shrink-0 mt-1" style={{ color: "#60A5FA" }} />
              )}
              {n.type === "match" && (
                <UserPlus className="h-4 w-4 shrink-0 mt-1" style={{ color: "#A78BFA" }} />
              )}
              {n.type === "follow_request" && (
                <UserPlus className="h-4 w-4 shrink-0 mt-1" style={{ color: "#F59E0B" }} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </AppLayout>
  );
}
