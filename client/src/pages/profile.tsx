import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { PostCard } from "@/components/post-card";
import { PostSkeleton } from "@/components/post-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle as AlertTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin, Globe, LogOut, Bookmark, Pencil, Camera, ImagePlus, Loader2,
  Settings, Shield, Languages, BellRing, Ban, HelpCircle, Info, Heart, ChevronRight, MoreHorizontal, Users
} from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import type { PostWithUser, UserProfile } from "@shared/schema";

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

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: [`/api/users/${user?.username}`],
    enabled: !!user,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithUser[]>({
    queryKey: [`/api/posts?userId=${user?.id}`],
    enabled: !!user,
  });

  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListType, setFollowListType] = useState<"followers" | "following">("followers");

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

  const [editForm, setEditForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    gmail: "",
    linkedin: "",
    whatsapp: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [pendingAvatarPath, setPendingAvatarPath] = useState<string | null>(null);
  const [pendingHeaderPath, setPendingHeaderPath] = useState<string | null>(null);

  const { uploadFile } = useUpload();

  const openEdit = () => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || "",
        username: profile.username || "",
        bio: profile.bio || "",
        gmail: profile.gmail || "",
        linkedin: profile.linkedin || "",
        whatsapp: profile.whatsapp || "",
      });
      setAvatarPreview(profile.avatarUrl || null);
      setHeaderPreview(profile.headerUrl || null);
      setPendingAvatarPath(null);
      setPendingHeaderPath(null);
    }
    setEditOpen(true);
  };


  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingAvatar(true);

    try {
      const result = await uploadFile(file);
      if (result) {
        setPendingAvatarPath(result.objectPath);
        toast({ title: "Profile photo uploaded" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      setAvatarPreview(profile?.avatarUrl || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleHeaderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setHeaderPreview(localUrl);
    setUploadingHeader(true);

    try {
      const result = await uploadFile(file);
      if (result) {
        setPendingHeaderPath(result.objectPath);
        toast({ title: "Header photo uploaded" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
      setHeaderPreview(profile?.headerUrl || null);
    } finally {
      setUploadingHeader(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      if (user) queryClient.invalidateQueries({ queryKey: [`/api/users/${user.username}`] });
      if (editForm.username !== user?.username) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${editForm.username}`] });
      }
      toast({ title: "Profile updated" });
      setEditOpen(false);
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    const data: any = { ...editForm };
    if (pendingAvatarPath) data.avatarUrl = pendingAvatarPath;
    if (pendingHeaderPath) data.headerUrl = pendingHeaderPath;
    updateMutation.mutate(data);
  };

  if (!user) return null;

  const bannerSrc = profile?.headerUrl || null;

  return (
    <AppLayout title="About Me">
      {profileLoading ? (
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      ) : profile && (
        <div className="border-b">
          <div className="relative h-32 overflow-hidden">
            {bannerSrc ? (
              <img src={bannerSrc} alt="Header" className="w-full h-full object-cover" data-testid="img-header-banner" />
            ) : (
              <div className="h-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
            )}
            <button
              onClick={openEdit}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-lg hover:bg-background transition-colors"
              data-testid="button-edit-header"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-10">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background">
                  {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
                  <AvatarFallback className={cn("text-white text-xl font-bold", getAvatarColor(profile.displayName))}>
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={openEdit}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                  data-testid="button-edit-avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="hidden lg:flex gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={openEdit} data-testid="button-edit-profile">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Link href="/bookmarks">
                  <Button variant="secondary" size="sm">
                    <Bookmark className="h-4 w-4 mr-1" /> Saved
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => logout()} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-1" /> Log out
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold" data-testid="text-profile-name">{profile.displayName}</h2>
                <UserBadge badgeType={(profile as any).badgeType} verified={profile.verified} size="lg" />
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

      <div className="lg:hidden px-4 py-3 border-b flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={openEdit} data-testid="button-edit-profile-mobile">
          <Pencil className="h-4 w-4 mr-1" /> Edit Profile
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setMoreSheetOpen(true)} data-testid="button-more-menu-mobile">
          <MoreHorizontal className="h-4 w-4 mr-1" /> More
        </Button>
      </div>

      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="lg:hidden rounded-t-2xl max-h-[75vh] overflow-y-auto p-0" data-testid="sheet-more-menu">
          <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-3">
            <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 absolute top-2 left-1/2 -translate-x-1/2" />
            <SheetHeader className="mt-3">
              <SheetTitle className="text-base">More options</SheetTitle>
            </SheetHeader>
          </div>
          <div className="px-2 py-2 space-y-0.5">
            {[
              { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
              { label: "Settings", icon: Settings, path: "/settings" },
              { label: "Privacy", icon: Shield, path: "/privacy" },
              { label: "Language", icon: Languages, path: "/language" },
              { label: "Notifications", icon: BellRing, path: "/notification-prefs" },
              { label: "Blocked Users", icon: Ban, path: "/blocked" },
              { label: "Help & Support", icon: HelpCircle, path: "/help" },
              { label: "About", icon: Info, path: "/about" },
              { label: "Donate", icon: Heart, path: "/donate" },
            ].map((item) => (
              <Link key={item.label} href={item.path}>
                <button
                  onClick={() => setMoreSheetOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                  data-testid={`mobile-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </button>
              </Link>
            ))}
            <div className="border-t mx-4 my-1" />
            <button
              onClick={() => { setMoreSheetOpen(false); setLogoutDialogOpen(true); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
              data-testid="mobile-menu-logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left font-medium">Logout</span>
            </button>
          </div>
          <div className="h-6" />
        </SheetContent>
      </Sheet>

      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">Posts</h3>
      </div>

      {postsLoading ? (
        Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts && posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No posts yet</p>
        </div>
      )}

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelect}
        data-testid="input-file-avatar"
      />
      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeaderSelect}
        data-testid="input-file-header"
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {avatarPreview && <AvatarImage src={avatarPreview} />}
                    <AvatarFallback className={cn("text-white text-lg font-bold", getAvatarColor(editForm.displayName || "U"))}>
                      {getInitials(editForm.displayName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Header / Banner</Label>
              <div
                className="relative h-24 rounded-lg overflow-hidden border cursor-pointer group"
                onClick={() => headerInputRef.current?.click()}
                data-testid="button-upload-header"
              >
                {headerPreview ? (
                  <img src={headerPreview} alt="Header" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                  {uploadingHeader ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-white text-sm font-medium">
                      <ImagePlus className="h-5 w-5" />
                      Change Banner
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                  data-testid="input-edit-displayname"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm(f => ({ ...f, username: e.target.value }))}
                  data-testid="input-edit-username"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input
                  placeholder="Tell us about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  data-testid="input-edit-bio"
                />
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold">Social Links</h4>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <SiGmail className="h-4 w-4 text-red-500" /> Gmail
                </Label>
                <Input
                  placeholder="your.email@gmail.com"
                  value={editForm.gmail}
                  onChange={(e) => setEditForm(f => ({ ...f, gmail: e.target.value }))}
                  data-testid="input-edit-gmail"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FaLinkedin className="h-4 w-4 text-blue-600" /> LinkedIn
                </Label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm(f => ({ ...f, linkedin: e.target.value }))}
                  data-testid="input-edit-linkedin"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <SiWhatsapp className="h-4 w-4 text-green-500" /> WhatsApp
                </Label>
                <Input
                  placeholder="+91 9876543210"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm(f => ({ ...f, whatsapp: e.target.value }))}
                  data-testid="input-edit-whatsapp"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={updateMutation.isPending || uploadingAvatar || uploadingHeader}
              data-testid="button-save-profile"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                          <UserBadge badgeType={u.badgeType as any} verified={u.verified} size="sm" />
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

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent data-testid="dialog-logout">
          <AlertDialogHeader>
            <AlertTitle>Logout</AlertTitle>
            <AlertDialogDescription>Are you sure you want to logout of Zorish?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setLogoutDialogOpen(false); logout(); }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-logout"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
