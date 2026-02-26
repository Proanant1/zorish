import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserBadge } from "@/components/user-badge";
import { Input } from "@/components/ui/input";
import {
  Send, ArrowLeft, Image, Video, Mic, FileText, MapPin, Loader2, Paperclip, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { useTheme } from "@/lib/theme";
import type { Message, User } from "@shared/schema";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

function formatMessageTime(dateStr: string | Date | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string | Date | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function shouldShowDateSeparator(current: Message, prev: Message | null) {
  if (!prev) return true;
  const currentDate = new Date(current.createdAt!).toDateString();
  const prevDate = new Date(prev.createdAt!).toDateString();
  return currentDate !== prevDate;
}

type UserInfo = Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>;

function MessageBubble({ msg, isMine, otherUser, showSeen }: { msg: Message; isMine: boolean; otherUser: UserInfo; showSeen?: boolean }) {
  const renderContent = () => {
    switch (msg.messageType) {
      case "image":
        return (
          <div>
            {msg.mediaUrl && (
              <img
                src={msg.mediaUrl}
                alt="Shared image"
                className="max-w-[240px] rounded-lg cursor-pointer"
                onClick={() => window.open(msg.mediaUrl!, "_blank")}
                data-testid={`msg-image-${msg.id}`}
              />
            )}
            {msg.content && <p className="mt-1 text-sm">{msg.content}</p>}
          </div>
        );
      case "video":
        return (
          <div>
            {msg.mediaUrl && (
              <video
                src={msg.mediaUrl}
                controls
                className="max-w-[240px] rounded-lg"
                data-testid={`msg-video-${msg.id}`}
              />
            )}
            {msg.content && <p className="mt-1 text-sm">{msg.content}</p>}
          </div>
        );
      case "audio":
        return (
          <div>
            {msg.mediaUrl && (
              <audio
                src={msg.mediaUrl}
                controls
                className="max-w-[240px]"
                data-testid={`msg-audio-${msg.id}`}
              />
            )}
          </div>
        );
      case "document":
        return (
          <a
            href={msg.mediaUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline"
            data-testid={`msg-document-${msg.id}`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{msg.fileName || "Document"}</span>
          </a>
        );
      case "location":
        return (
          <a
            href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline"
            data-testid={`msg-location-${msg.id}`}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span>View Location</span>
          </a>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>;
    }
  };

  return (
    <div className={cn("flex flex-col", isMine ? "items-end" : "items-start")} data-testid={`message-${msg.id}`}>
      <div className={cn("flex gap-2 px-3", isMine ? "justify-end" : "justify-start", "w-full")}>
        {!isMine && (
          <Avatar className="h-7 w-7 shrink-0 mt-1">
            {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} />}
            <AvatarFallback className={cn("text-white text-[10px] font-semibold", getAvatarColor(otherUser.displayName))}>
              {getInitials(otherUser.displayName)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2",
          isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}>
          {renderContent()}
          <p className={cn(
            "text-[10px] mt-0.5 text-right",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formatMessageTime(msg.createdAt)}
          </p>
        </div>
      </div>
      {isMine && showSeen && msg.read && (
        <div className="flex items-center gap-1 px-4 mt-0.5" data-testid={`msg-seen-${msg.id}`}>
          {otherUser.avatarUrl ? (
            <Avatar className="h-3.5 w-3.5">
              <AvatarImage src={otherUser.avatarUrl} />
              <AvatarFallback className={cn("text-white text-[8px]", getAvatarColor(otherUser.displayName))}>
                {getInitials(otherUser.displayName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn("h-3.5 w-3.5 rounded-full flex items-center justify-center text-white text-[8px]", getAvatarColor(otherUser.displayName))}>
              {getInitials(otherUser.displayName)[0]}
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">Seen</span>
        </div>
      )}
    </div>
  );
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);

  const { uploadFile, isUploading } = useUpload({
    onError: (err) => toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const { data: otherUserData, isLoading: userLoading } = useQuery<UserInfo>({
    queryKey: ["/api/users/id", userId],
    enabled: !!userId,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", userId],
    refetchInterval: 5000,
    enabled: !!userId,
  });

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages.length, scrollToBottom]);

  const sendMutation = useMutation({
    mutationFn: async (data: {
      receiverId: string;
      content?: string;
      messageType?: string;
      mediaUrl?: string;
      fileName?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    setText("");
    sendMutation.mutate({ receiverId: userId, content: trimmed, messageType: "text" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !attachmentType) return;

    const result = await uploadFile(file);
    if (result) {
      sendMutation.mutate({
        receiverId: userId,
        messageType: attachmentType,
        mediaUrl: result.objectPath,
        fileName: file.name,
        content: "",
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAttachmentType(null);
  };

  const handleAttachment = (type: string) => {
    setAttachmentType(type);
    if (fileInputRef.current) {
      switch (type) {
        case "image":
          fileInputRef.current.accept = "image/*";
          break;
        case "video":
          fileInputRef.current.accept = "video/*";
          break;
        case "audio":
          fileInputRef.current.accept = "audio/*";
          break;
        case "document":
          fileInputRef.current.accept = "*/*";
          break;
      }
      fileInputRef.current.click();
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", description: "Your browser doesn't support geolocation.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!userId) return;
        sendMutation.mutate({
          receiverId: userId,
          messageType: "location",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          content: "Shared location",
        });
      },
      () => {
        toast({ title: "Location access denied", description: "Please allow location access.", variant: "destructive" });
      }
    );
  };

  const otherUser: UserInfo = otherUserData || {
    id: userId || "",
    username: "",
    displayName: "User",
    avatarUrl: "",
    verified: false,
    badgeType: "none",
  };

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {theme === "dark" && (
        <>
          <div className="bokeh-bg" aria-hidden="true" />
          <div className="bokeh-orbs" aria-hidden="true" />
          <div className="vignette-overlay" aria-hidden="true" />
          <div className="dof-overlay" aria-hidden="true" />
        </>
      )}

      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md" data-testid="chat-header">
        <div className="flex items-center gap-3 px-3 h-14">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors shrink-0"
            data-testid="button-back-chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link href={otherUser.username ? `/user/${otherUser.username}` : "#"}>
            <div className="flex items-center gap-2.5 cursor-pointer" data-testid="chat-user-info">
              <Avatar className="h-9 w-9">
                {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} />}
                <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(otherUser.displayName))}>
                  {getInitials(otherUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm truncate">{otherUser.displayName}</span>
                  <UserBadge badgeType={otherUser.badgeType as any} verified={!!otherUser.verified} size="sm" />
                </div>
                {otherUser.username && (
                  <p className="text-[11px] text-muted-foreground">@{otherUser.username}</p>
                )}
              </div>
            </div>
          </Link>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3 space-y-2 relative z-10"
        data-testid="messages-container"
      >
        {msgsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Avatar className="h-16 w-16 mb-3">
              {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} />}
              <AvatarFallback className={cn("text-white text-xl font-bold", getAvatarColor(otherUser.displayName))}>
                {getInitials(otherUser.displayName)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{otherUser.displayName}</p>
            <p className="text-xs text-muted-foreground mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          (() => {
            const lastReadSentIdx = messages.reduce((acc, m, i) =>
              m.senderId === user?.id && m.read ? i : acc, -1);
            return messages.map((msg, idx) => {
              const prev = idx > 0 ? messages[idx - 1] : null;
              const isMine = msg.senderId === user?.id;
              const showSeen = idx === lastReadSentIdx;
              return (
                <div key={msg.id}>
                  {shouldShowDateSeparator(msg, prev) && (
                    <div className="flex items-center justify-center my-3">
                      <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble msg={msg} isMine={isMine} otherUser={otherUser} showSeen={showSeen} />
                </div>
              );
            });
          })()
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        data-testid="input-file-upload"
      />

      <div className="sticky bottom-0 z-50 border-t bg-background/90 backdrop-blur-md px-3 py-2" data-testid="chat-input-bar">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" disabled={isUploading} data-testid="button-attach">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => handleAttachment("image")} data-testid="attach-image">
                <Image className="h-4 w-4 mr-2" /> Photo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAttachment("video")} data-testid="attach-video">
                <Video className="h-4 w-4 mr-2" /> Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAttachment("audio")} data-testid="attach-audio">
                <Mic className="h-4 w-4 mr-2" /> Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAttachment("document")} data-testid="attach-document">
                <FileText className="h-4 w-4 mr-2" /> Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareLocation} data-testid="attach-location">
                <MapPin className="h-4 w-4 mr-2" /> Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-message"
          />

          <Button
            size="icon"
            onClick={handleSendText}
            disabled={!text.trim() || sendMutation.isPending}
            data-testid="button-send-message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
