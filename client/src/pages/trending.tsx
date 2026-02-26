import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { AppLayout } from "@/components/app-layout";
import { PostCard } from "@/components/post-card";
import { PostSkeleton } from "@/components/post-skeleton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { PostWithUser, Hashtag } from "@shared/schema";

export default function TrendingPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const activeTag = params.get("tag");

  const { data: hashtags, isLoading: hashtagsLoading } = useQuery<Hashtag[]>({
    queryKey: ["/api/trending"],
  });

  const postsUrl = activeTag ? `/api/posts?hashtag=${activeTag}` : "/api/posts?sort=trending";
  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: [postsUrl],
  });

  return (
    <AppLayout title="Trending">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Trending in Bharat</h2>
        </div>
        {hashtagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Link href="/trending">
              <Badge
                variant={!activeTag ? "default" : "secondary"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {hashtags?.map((h) => (
              <Link key={h.id} href={`/trending?tag=${h.tag}`}>
                <Badge
                  variant={activeTag === h.tag ? "default" : "secondary"}
                  className="cursor-pointer gap-1"
                  data-testid={`badge-hashtag-${h.tag}`}
                >
                  <Hash className="h-3 w-3" />
                  {h.tag}
                  <span className="text-[10px] opacity-70">{h.postCount}</span>
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {hashtagsLoading || postsLoading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {!hashtagsLoading && hashtags && hashtags.length > 0 && (
            <div className="border-b">
              {hashtags.slice(0, 5).map((h, i) => (
                <Link key={h.id} href={`/trending?tag=${h.tag}`}>
                  <div className={cn(
                    "flex items-center justify-between gap-1 px-4 py-3 cursor-pointer hover:bg-muted transition-colors",
                    i < 4 && "border-b"
                  )} data-testid={`trending-item-${h.tag}`}>
                    <div>
                      <p className="text-xs text-muted-foreground">Trending #{i + 1}</p>
                      <p className="font-semibold text-sm">#{h.tag}</p>
                      <p className="text-xs text-muted-foreground">{h.postCount} posts</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          {posts?.map((post) => <PostCard key={post.id} post={post} />)}
          {posts?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <Hash className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">No trending posts yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTag ? `No posts found for #${activeTag}` : "Be the first to start a trend!"}
              </p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
