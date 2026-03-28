import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { PostCard } from "@/components/post-card";
import { PostSkeleton } from "@/components/post-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Globe, UserPlus, UserMinus, Users, Loader2, Clock, MessageCircle } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { PostWithUser, UserProfile } from "@shared/schema";
import { useState } from "react";

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

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: [`/api/users/${username}`],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: [`/api/posts?userId=${profile?.id}`],
    enabled: !!profile,
  });

  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListType, setFollowListType] = useState<"followers" | "following">("followers");

  const isFollowing = profile?.isFollowing ?? false;
  const followRequestPending = profile?.followRequestPending ?? false;

  const { data: followListUsers = [], isLoading: followListLoading } = useQuery<
    Pick<UserProfile, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'verified' | 'badgeType'>[]
  >({
    queryKey: ['/api/users', profile?.id, followListType],
    queryFn: async () => {
      const res = await fetch(`/api/users/${profile?.id}/${followListType === "followers" ? "followers" : "following"}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: followListOpen && !!profile,
  });

  const openFollowList = (type: "followers" | "following") => {
    setFollowListType(type);
    setFollowListOpen(true);
  };

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${profile?.id}/follow`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
    },
  });

  const handleFollow = () => {
    followMutation.mutate();
  };

  const isOwnProfile = user?.username === username;

  return (
    <AppLayout title={profile?.displayName || "Profile"}>
      {profileLoading ? (
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ) : profile && (
        <div className="border-b">
          <div className="relative h-32 overflow-hidden">
            {profile.headerUrl ? (
              <img src={profile.headerUrl} alt="Header" className="w-full h-full object-cover" />
            ) : (
              <div className="h-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
            )}
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-10">
              <Avatar className="h-20 w-20 border-4 border-background">
                {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
                <AvatarFallback className={cn("text-white text-xl font-bold", getAvatarColor(profile.displayName))}>
                  {getInitials(profile.displayName)}
                </AvatarFallback>
              </Avatar>
              {!isOwnProfile && (
                <div className="flex items-center gap-2 mt-2">
                  <Link href={`/chat/${profile.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-message-user"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" /> Message
                    </Button>
                  </Link>
                  <Button
                    variant={isFollowing ? "secondary" : followRequestPending ? "outline" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={followMutation.isPending}
                    data-testid="button-match"
                  >
                    {isFollowing ? (
                      <><UserMinus className="h-4 w-4 mr-1" /> Matched</>
                    ) : followRequestPending ? (
                      <><Clock className="h-4 w-4 mr-1" /> Requested</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-1" /> Match</>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold">{profile.displayName}</h2>
                <UserBadge badgeType={(profile as any).badgeType} verified={!!profile.verified} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {profile.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {profile.state}
                  </span>
                )}
                {profile.languagePreference && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> {profile.languagePreference}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                {profile.gmail && (
                  <a
                    href={`mailto:${profile.gmail}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    title={profile.gmail}
                    data-testid="link-gmail"
                  >
                    <SiGmail className="h-4 w-4" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors"
                    title="LinkedIn"
                    data-testid="link-linkedin"
                  >
                    <FaLinkedin className="h-4 w-4" />
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                    title="WhatsApp"
                    data-testid="link-whatsapp"
                  >
                    <SiWhatsapp className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                <button onClick={() => openFollowList("following")} className="hover:underline cursor-pointer" data-testid="button-matched-count">
                  <strong>{profile.followingCount}</strong> <span className="text-muted-foreground">Matched</span>
                </button>
                <button onClick={() => openFollowList("followers")} className="hover:underline cursor-pointer" data-testid="button-matchers-count">
                  <strong>{profile.followersCount}</strong> <span className="text-muted-foreground">Matchers</span>
                </button>
                <span><strong>{profile.postsCount}</strong> <span className="text-muted-foreground">Posts</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {postsLoading ? (
        Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts && posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No posts yet</p>
        </div>
      )}

      <Dialog open={followListOpen} onOpenChange={setFollowListOpen}>
        <DialogContent className="max-w-sm max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {followListType === "followers" ? "Matchers" : "Matched"}
            </DialogTitle>
          </DialogHeader>
          {followListLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : followListUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {followListType === "followers" ? "No Matchers yet" : "Not Matched with anyone yet"}
            </p>
          ) : (
            <ul className="space-y-1">
              {followListUsers.map((u) => (
                <li key={u.id}>
                  <Link href={`/user/${u.username}`}>
                    <button
                      onClick={() => setFollowListOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                      data-testid={`follow-list-user-${u.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        {u.avatarUrl && <AvatarImage src={u.avatarUrl} />}
                        <AvatarFallback className={cn("text-white text-sm font-semibold", getAvatarColor(u.displayName))}>
                          {getInitials(u.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm truncate">{u.displayName}</span>
                          <UserBadge badgeType={u.badgeType as any} verified={!!u.verified} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
