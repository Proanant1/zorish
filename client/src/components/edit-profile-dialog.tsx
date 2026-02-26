import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { SiGmail, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import type { UserProfile } from "@shared/schema";

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

export function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: [`/api/users/${user?.username}`],
    enabled: !!user && open,
  });

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
  const [initialized, setInitialized] = useState(false);

  const { uploadFile } = useUpload();

  if (profile && open && !initialized) {
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
    setInitialized(true);
  }

  if (!open && initialized) {
    setInitialized(false);
  }

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
      onOpenChange(false);
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

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelect}
        data-testid="input-file-avatar-global"
      />
      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeaderSelect}
        data-testid="input-file-header-global"
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <SiLinkedin className="h-4 w-4 text-blue-600" /> LinkedIn
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
    </>
  );
}
