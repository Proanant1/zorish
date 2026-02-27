import { useLocation, Link } from "wouter";
import {
  Home, Search, Bell, MessageCircle, Bookmark, Clapperboard,
  User, Settings, Shield, Languages, BellRing, Ban,
  HelpCircle, LogOut, Info, Heart, BadgeCheck, Share2
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

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

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Search, label: "Find" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/chat", icon: MessageCircle, label: "Private Chat" },
  { path: "/bookmarks", icon: Bookmark, label: "Saved" },
  { path: "/creator-studio", icon: Clapperboard, label: "Creator Studio" },
  { path: "/profile", icon: User, label: "About Me" },
];

const moreItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Privacy", icon: Shield, path: "/privacy" },
  { label: "Language", icon: Languages, path: "/language" },
  { label: "Notification Prefs", icon: BellRing, path: "/notification-prefs" },
  { label: "Blocked Users", icon: Ban, path: "/blocked" },
  { label: "Help & Support", icon: HelpCircle, path: "/help" },
  { label: "About", icon: Info, path: "/about" },
  { label: "Donate", icon: Heart, path: "/donate" },
];

interface MobileMenuSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenuSheet({ open, onClose }: MobileMenuSheetProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const handleNav = () => onClose();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Zorish", text: "Check out Zorish — Apna Social Space!", url: window.location.origin });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.origin);
    }
    onClose();
  };

  const handleLogout = () => {
    onClose();
    if (window.confirm("Are you sure you want to logout of Zorish?")) logout();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col overflow-y-auto">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {user && (
            <Link href="/profile" onClick={handleNav}>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar className="h-11 w-11">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                  <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(user.displayName))}>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
            </Link>
          )}
        </SheetHeader>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <Link href="/get-verified" onClick={handleNav}>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all mb-2",
                isActive("/get-verified")
                  ? "bg-primary/15 text-primary"
                  : "text-primary hover:bg-muted border border-primary/20"
              )}
              data-testid="mobile-nav-get-verified"
            >
              <BadgeCheck className="h-5 w-5" />
              <span>Get Verified</span>
              <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">NEW</span>
            </button>
          </Link>

          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} onClick={handleNav}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-card text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}

          <div className="my-2 border-t" />

          {moreItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} onClick={handleNav}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-card text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}

          <button
            onClick={handleShare}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            data-testid="mobile-nav-share"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Zorish</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            data-testid="mobile-nav-logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
