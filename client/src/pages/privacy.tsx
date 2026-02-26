import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, MessageCircle, MessageSquare, Eye, Download, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PrivacyPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Privacy settings updated" });
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  return (
    <AppLayout title="Privacy">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-privacy-title">Privacy</h2>
          <p className="text-sm text-muted-foreground mt-1">Control who can see your content and interact with you</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Account Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private Account</p>
                <p className="text-xs text-muted-foreground">Only your Matchers can see your posts</p>
              </div>
              <Switch
                checked={user.isPrivate || false}
                onCheckedChange={(checked) => updateMutation.mutate({ isPrivate: checked })}
                data-testid="switch-private-account"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Hide Online Status</p>
                <p className="text-xs text-muted-foreground">Others won't see when you're active</p>
              </div>
              <Switch
                checked={user.hideOnlineStatus || false}
                onCheckedChange={(checked) => updateMutation.mutate({ hideOnlineStatus: checked })}
                data-testid="switch-hide-online"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Messaging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Who can message me</p>
                <p className="text-xs text-muted-foreground">Control who can send you Private Chats</p>
              </div>
              <Select
                value={user.allowMessagesFrom || "everyone"}
                onValueChange={(v) => updateMutation.mutate({ allowMessagesFrom: v })}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-messages-from">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Matchers Only</SelectItem>
                  <SelectItem value="nobody">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Who can comment</p>
                <p className="text-xs text-muted-foreground">Control who can comment on your posts</p>
              </div>
              <Select
                value={user.allowCommentsFrom || "everyone"}
                onValueChange={(v) => updateMutation.mutate({ allowCommentsFrom: v })}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-comments-from">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Matchers Only</SelectItem>
                  <SelectItem value="nobody">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ban className="h-4 w-4" /> Blocked Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/blocked">
              <Button variant="outline" className="w-full justify-between" data-testid="link-blocked-users">
                Manage Blocked Users
                <Ban className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" /> Story Visibility
            </CardTitle>
            <CardDescription>Control who can see your stories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Who can see my stories</p>
                <p className="text-xs text-muted-foreground">Choose who can view your stories</p>
              </div>
              <Select
                value={user.storyVisibility || "everyone"}
                onValueChange={(v) => updateMutation.mutate({ storyVisibility: v })}
              >
                <SelectTrigger className="w-[140px]" data-testid="select-story-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Matchers Only</SelectItem>
                  <SelectItem value="nobody">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data & Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <Download className="h-4 w-4" /> Download My Data
              <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive" disabled>
              <Trash2 className="h-4 w-4" /> Delete Account
              <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
