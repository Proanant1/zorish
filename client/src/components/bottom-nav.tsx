import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Home, Search, User, Bell, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { useAuth } from "@/lib/auth";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/reels", icon: Clapperboard, label: "Reels" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/search", icon: Search, label: "Search" },
];

export function BottomNav() {
  const [location] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const { user } = useAuth();

  const { data: notifCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 30000,
    enabled: !!user,
  });
  const unreadCount = notifCountData?.count ?? 0;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl" data-testid="nav-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around py-1">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <span className="relative">
                    <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                    {item.path === "/notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold px-0.5">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
          <button
            onClick={() => setEditOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors text-muted-foreground"
            data-testid="nav-profile"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
