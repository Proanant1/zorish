import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, Lock, User, Eye, EyeOff, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: any) => {
      toast({ title: "Failed to change password", description: e.message, variant: "destructive" });
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

  if (!user) return null;

  return (
    <AppLayout title="Settings">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-settings-title">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>View and edit your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid="link-edit-profile">
                <Avatar className="h-12 w-12">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                  <AvatarFallback className={cn("text-white font-bold", getAvatarColor(user.displayName))}>
                    {user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  data-testid="switch-dark-mode"
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  data-testid="input-current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="w-full"
              data-testid="button-change-password"
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Account Verification</CardTitle>
            <CardDescription>Get a verified badge on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Verification Status</p>
                <p className="text-xs text-muted-foreground">
                  {user.verified ? "Your account is verified" : "Apply for verification badge"}
                </p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                user.verified ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {user.verified ? "Verified" : "Coming Soon"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Connected Accounts</CardTitle>
            <CardDescription>Link external accounts for easier login</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">G</span>
                  </div>
                  <span className="text-sm font-medium">Google</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-500">P</span>
                  </div>
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
