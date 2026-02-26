import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ban, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

type BlockedUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  blockedAt: string | null;
};

export default function BlockedUsersPage() {
  const { toast } = useToast();

  const { data: blockedUsers, isLoading } = useQuery<BlockedUser[]>({
    queryKey: ["/api/blocked-users"],
  });

  const unblockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/users/${userId}/block`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-users"] });
      toast({ title: "User unblocked" });
    },
    onError: (e: any) => {
      toast({ title: "Failed to unblock", description: e.message, variant: "destructive" });
    },
  });

  return (
    <AppLayout title="Blocked Users">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-blocked-title">Blocked Users</h2>
          <p className="text-sm text-muted-foreground mt-1">Users you've blocked can't see your profile or posts</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : blockedUsers && blockedUsers.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{blockedUsers.length} Blocked</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {blockedUsers.map((bu) => (
                <div
                  key={bu.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`blocked-user-${bu.id}`}
                >
                  <Avatar className="h-10 w-10">
                    {bu.avatarUrl && <AvatarImage src={bu.avatarUrl} />}
                    <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(bu.displayName))}>
                      {getInitials(bu.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{bu.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{bu.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unblockMutation.mutate(bu.id)}
                    disabled={unblockMutation.isPending}
                    data-testid={`button-unblock-${bu.id}`}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Blocked Users</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              You haven't blocked anyone yet. Block users from their profile to prevent them from interacting with you.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
