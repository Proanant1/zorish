import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { User } from "@shared/schema";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = query.trim();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: [`/api/search/users?q=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <AppLayout title="Find">
      <div className="px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      {debouncedQuery.length >= 2 ? (
        usersLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <div>
            {users.map((u) => (
              <Link key={u.id} href={`/user/${u.username}`}>
                <div className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:bg-muted transition-colors" data-testid={`search-user-${u.username}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(u.displayName))}>
                      {getInitials(u.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No users found for "{debouncedQuery}"</p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Discover People</h3>
          <p className="mt-1 text-sm text-muted-foreground">Search for users to connect with</p>
        </div>
      )}
    </AppLayout>
  );
}
