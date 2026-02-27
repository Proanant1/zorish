import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { MobileMenuSheet } from "@/components/mobile-menu-sheet";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

const PAGE_TITLES: Record<string, string> = {
  "/notifications": "Alerts",
  "/search": "Find",
  "/trending": "Trending",
  "/chat": "Private Chat",
  "/bookmarks": "Saved",
  "/reels": "Reels",
  "/creator-studio": "Creator Studio",
  "/profile": "About Me",
  "/get-verified": "Get Verified",
  "/settings": "Settings",
  "/privacy": "Privacy",
  "/language": "Language",
  "/notification-prefs": "Notifications",
  "/blocked": "Blocked Users",
  "/help": "Help & Support",
  "/about": "About",
  "/donate": "Donate",
};

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location === "/";
  const pageTitle = title
    || PAGE_TITLES[location]
    || Object.entries(PAGE_TITLES).find(([p]) => location.startsWith(p + "/"))?.[1]
    || "";

  return (
    <div className="min-h-screen bg-background relative">
      {theme === "dark" && (
        <>
          <div className="cosmic-bg" aria-hidden="true" />
          <div className="vignette-overlay" aria-hidden="true" />
        </>
      )}

      <Sidebar />

      <header className="lg:hidden sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md" data-testid="header-mobile">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-3">

          {isHome ? (
            <button
              className="shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="header-profile-avatar"
            >
              {user ? (
                <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-white/10">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                  <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(user.displayName))}>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8" />
              )}
            </button>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors shrink-0"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="absolute left-1/2 -translate-x-1/2">
            {isHome ? (
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lg font-black shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0B1026 0%, #121A3A 100%)',
                    border: '1px solid rgba(245,176,65,0.30)',
                    color: '#F5B041',
                    boxShadow: '0 0 10px rgba(245,176,65,0.15)',
                  }}
                >
                  Z
                </div>
                <h1 className="text-lg font-bold tracking-tight gold-text">Zorish</h1>
              </div>
            ) : (
              <h1 className="text-base font-semibold truncate max-w-[180px]">{pageTitle}</h1>
            )}
          </div>

          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle" className="btn-action shrink-0">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="lg:ml-[260px] pb-16 lg:pb-0 relative z-10">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </main>

      <BottomNav />
      <MobileMenuSheet open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  );
}
