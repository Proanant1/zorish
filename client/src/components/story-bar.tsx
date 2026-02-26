import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryViewer } from "@/components/story-viewer";
import { CreateStory } from "@/components/create-story";
import type { Story, User } from "@shared/schema";

type StoryGroup = {
  user: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  stories: Story[];
  hasUnviewed: boolean;
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

export function StoryBar() {
  const { user } = useAuth();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: storyGroups, isLoading } = useQuery<StoryGroup[]>({
    queryKey: ["/api/stories/feed"],
    enabled: !!user,
  });

  if (!user) return null;

  const openViewer = (index: number) => {
    setSelectedGroupIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="border-b" data-testid="story-bar">
        <div className="flex items-center gap-3 px-3 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center gap-1 shrink-0"
            data-testid="button-add-story"
          >
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-muted">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(user.displayName))}>
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="h-3 w-3" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium w-14 text-center truncate">
              Your Story
            </span>
          </button>

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-2 w-10" />
              </div>
            ))
          ) : (
            storyGroups?.map((group, index) => (
              <button
                key={group.user.id}
                onClick={() => openViewer(index)}
                className="flex flex-col items-center gap-1 shrink-0"
                data-testid={`story-avatar-${group.user.id}`}
              >
                <div className={cn(
                  "rounded-full p-[2px]",
                  group.hasUnviewed
                    ? "bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-500"
                    : "bg-muted"
                )}>
                  <div className="rounded-full p-[2px] bg-background">
                    <Avatar className="h-12 w-12">
                      {group.user.avatarUrl && <AvatarImage src={group.user.avatarUrl} alt={group.user.displayName} />}
                      <AvatarFallback className={cn("text-white text-xs font-semibold", getAvatarColor(group.user.displayName))}>
                        {getInitials(group.user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium w-14 text-center truncate">
                  {group.user.displayName.split(" ")[0]}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {viewerOpen && storyGroups && storyGroups.length > 0 && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={selectedGroupIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <CreateStory open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
