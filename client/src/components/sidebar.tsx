import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  Home, Search, Bell, MessageCircle, Bookmark, Clapperboard,
  User, MoreHorizontal, Share2, Settings, Shield, Languages,
  BellRing, Ban, HelpCircle, LogOut, ChevronUp, Info, Heart, BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import zorishLogoUrl from "@assets/zorish-z.svg";

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

const mainNavItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/reels", icon: Clapperboard, label: "Reels" },
  { path: "/search", icon: Search, label: "Find" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/chat", icon: MessageCircle, label: "Private Chat" },
  { path: "/bookmarks", icon: Bookmark, label: "Saved" },
  { path: "/creator-studio", icon: Clapperboard, label: "Creator Studio" },
  { path: "/get-verified", icon: BadgeCheck, label: "Get Verified", highlight: true },
  { path: "/profile", icon: User, label: "About Me" },
];

const moreMenuItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Privacy", icon: Shield, path: "/privacy" },
  { label: "Language", icon: Languages, path: "/language" },
  { label: "Notifications", icon: BellRing, path: "/notification-prefs" },
  { label: "Blocked Users", icon: Ban, path: "/blocked" },
  { label: "Help & Support", icon: HelpCircle, path: "/help" },
  { label: "About", icon: Info, path: "/about" },
  { label: "Donate", icon: Heart, path: "/donate" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: notifCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 30000,
    enabled: !!user,
  });
  const unreadCount = notifCountData?.count ?? 0;

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Zorish", text: "Check out Zorish — Apna Social Space!", url: window.location.origin });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col border-r bg-background z-50" data-testid="sidebar-desktop">
        <div className="px-5 py-5">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer" data-testid="sidebar-logo">
              <img
                src={zorishLogoUrl}
                alt="Zorish"
                className="h-9 w-9 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xl font-bold tracking-tight block gold-text">Zorish</span>
                <span className="text-[10px] text-muted-foreground leading-none">Apna Social Space</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            const isHighlight = (item as any).highlight;
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "nav-active bg-card text-primary"
                      : isHighlight
                        ? "text-primary hover:bg-muted hover:text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="relative">
                    <item.icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
                    {item.path === "/notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                  {isHighlight && !active && (
                    <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">NEW</span>
                  )}
                </button>
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                moreOpen
                  ? "nav-active bg-card text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="nav-more"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
              <ChevronUp className={cn("h-4 w-4 ml-auto transition-transform", !moreOpen && "rotate-180")} />
            </button>

            {moreOpen && (
              <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-border pl-3" data-testid="more-dropdown">
                {moreMenuItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} href={item.path}>
                      <button
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                          active
                            ? "bg-card text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        data-testid={`nav-more-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setMoreOpen(false); if (window.confirm("Are you sure you want to logout of Zorish?")) logout(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-all hover:bg-destructive/10"
                  data-testid="nav-more-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 pb-3 space-y-3">
          <Button
            onClick={handleShare}
            className="w-full rounded-xl gap-2 text-sm font-semibold"
            size="lg"
            data-testid="button-share-app"
          >
            <Share2 className="h-4 w-4" />
            Share Zorish
          </Button>

          {user && (
            <Link href="/profile">
              <div className="flex items-center gap-3 rounded-xl p-2.5 cursor-pointer hover:bg-muted transition-colors" data-testid="sidebar-user-profile">
                <Avatar className="h-9 w-9">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                  <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(user.displayName))}>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
