import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { PostCard } from "@/components/post-card";
import { AdCard } from "@/components/ad-card";
import { AdSenseUnit } from "@/components/adsense-unit";
import { CreatePost } from "@/components/create-post";
import { PostSkeleton } from "@/components/post-skeleton";
import { StoryBar } from "@/components/story-bar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Users, UserCheck, LayoutGrid } from "lucide-react";
import type { PostWithUser } from "@shared/schema";
import { FEED_ADS, getAdForIndex } from "@/lib/ad-data";

const AD_FREQUENCY = 8;
const ADSENSE_SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ID as string | undefined;

type FeedTab = "foryou" | "following" | "groups";

const TABS: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "foryou", label: "For You", icon: LayoutGrid },
  { id: "following", label: "Matched", icon: UserCheck },
  { id: "groups", label: "Groups", icon: Users },
];

function FeedTabBar({ active, onChange }: { active: FeedTab; onChange: (tab: FeedTab) => void }) {
  return (
    <div className="sticky top-[56px] lg:top-0 z-40 bg-background/90 backdrop-blur-xl border-b" data-testid="feed-tab-bar">
      <div className="flex items-center w-full">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              data-testid={`tab-feed-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-sm font-medium transition-colors relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="hidden sm:flex items-center gap-1.5">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </span>
              <span className="sm:hidden text-xs font-semibold tracking-wide">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useIsAdFree() {
  const { user } = useAuth();
  return !!(user && user.subscriptionStatus && user.subscriptionStatus !== "none");
}

function renderFeedWithAds(posts: PostWithUser[], adFree: boolean) {
  const items: React.ReactNode[] = [];
  let adCount = 0;

  posts.forEach((post, index) => {
    items.push(<PostCard key={post.id} post={post} />);
    if (!adFree && (index + 1) % AD_FREQUENCY === 0) {
      if (ADSENSE_SLOT_ID) {
        items.push(<AdSenseUnit key={`adsense-${adCount}-${index}`} slotId={ADSENSE_SLOT_ID} adIndex={adCount} />);
      } else {
        const ad = getAdForIndex(adCount, FEED_ADS);
        items.push(<AdCard key={`ad-${adCount}-${index}`} ad={ad} />);
      }
      adCount++;
    }
  });

  return items;
}

function ForYouFeed() {
  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });
  const adFree = useIsAdFree();

  return (
    <>
      <StoryBar />
      <CreatePost />
      {isLoading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div data-testid="feed-posts-list">
          {renderFeedWithAds(posts, adFree)}
        </div>
      ) : (
        <EmptyState
          icon={<LayoutGrid className="h-8 w-8 text-muted-foreground" />}
          title="No posts yet"
          message="Start posting to see your feed come alive. Share what's happening in your world!"
        />
      )}
    </>
  );
}

function FollowingFeed() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts/following"],
    enabled: !!user,
  });
  const adFree = useIsAdFree();

  if (!user) {
    return (
      <EmptyState
        icon={<UserCheck className="h-8 w-8 text-muted-foreground" />}
        title="Sign in to see your feed"
        message="Match people and their posts will appear here."
      />
    );
  }

  return (
    <>
      {isLoading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div data-testid="feed-following-posts-list">
          {renderFeedWithAds(posts, adFree)}
        </div>
      ) : (
        <EmptyState
          icon={<UserCheck className="h-8 w-8 text-muted-foreground" />}
          title="No posts from people you've matched"
          message="Match more people to see their posts here."
        />
      )}
    </>
  );
}

function GroupsFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4" data-testid="groups-placeholder">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Groups coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">
          Create and join communities around topics you care about. Stay tuned!
        </p>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">{message}</p>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");

  return (
    <AppLayout>
      <FeedTabBar active={activeTab} onChange={setActiveTab} />
      <div data-testid={`feed-content-${activeTab}`}>
        {activeTab === "foryou" && <ForYouFeed />}
        {activeTab === "following" && <FollowingFeed />}
        {activeTab === "groups" && <GroupsFeed />}
      </div>
    </AppLayout>
  );
}
