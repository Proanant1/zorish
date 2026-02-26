import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { PostCard } from "@/components/post-card";
import { PostSkeleton } from "@/components/post-skeleton";
import { Bookmark } from "lucide-react";
import type { PostWithUser } from "@shared/schema";

export default function BookmarksPage() {
  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/bookmarks"],
  });

  return (
    <AppLayout title="Saved">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts && posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No bookmarks yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Save posts to read later</p>
        </div>
      )}
    </AppLayout>
  );
}
