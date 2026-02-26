import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserBadge } from "@/components/user-badge";
import { MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState } from "react";
import type { User, Message } from "@shared/schema";
import { Input } from "@/components/ui/input";

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

type Conversation = {
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>;
  lastMessage: Message;
  unreadCount: number;
};

function formatTime(dateStr: string | Date | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

function getMessagePreview(msg: Message, isSender: boolean) {
  const prefix = isSender ? "You: " : "";
  switch (msg.messageType) {
    case "image": return `${prefix}Sent a photo`;
    case "video": return `${prefix}Sent a video`;
    case "audio": return `${prefix}Sent audio`;
    case "document": return `${prefix}${msg.fileName || "Sent a file"}`;
    case "location": return `${prefix}Shared location`;
    default: return `${prefix}${msg.content || ""}`;
  }
}

export default function ChatPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 10000,
  });

  const filtered = searchTerm.trim()
    ? conversations.filter(c =>
        c.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : conversations;

  return (
    <AppLayout title="Private Chat">
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-conversations"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1 px-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold" data-testid="text-no-conversations">
            {searchTerm ? "No conversations found" : "No messages yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
            {searchTerm
              ? "Try a different search term"
              : "Start a conversation by visiting someone's profile and tapping Message."}
          </p>
        </div>
      ) : (
        <div className="divide-y" data-testid="conversation-list">
          {filtered.map((conv) => {
            const isSender = conv.lastMessage.senderId === user?.id;
            return (
              <Link key={conv.user.id} href={`/chat/${conv.user.id}`}>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 hover-elevate transition-colors text-left"
                  data-testid={`conversation-${conv.user.id}`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-12 w-12">
                      {conv.user.avatarUrl && <AvatarImage src={conv.user.avatarUrl} />}
                      <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(conv.user.displayName))}>
                        {getInitials(conv.user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("font-semibold text-sm truncate", conv.unreadCount > 0 && "font-bold")}>
                        {conv.user.displayName}
                      </span>
                      <UserBadge badgeType={conv.user.badgeType as any} verified={!!conv.user.verified} size="sm" />
                    </div>
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {getMessagePreview(conv.lastMessage, isSender)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn(
                      "text-[11px]",
                      conv.unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1" data-testid={`unread-count-${conv.user.id}`}>
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
