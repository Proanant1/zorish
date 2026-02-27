import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, AtSign, MessageCircle, TrendingUp, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NotificationPrefsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const toggleSetting = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <AppLayout title="Notifications">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-notif-title">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose what notifications you receive</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive push notifications</p>
                </div>
              </div>
              <Switch
                checked={user.notifPush ?? true}
                onCheckedChange={(v) => toggleSetting("notifPush", v)}
                data-testid="switch-notif-push"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={user.notifEmail ?? false}
                onCheckedChange={(v) => toggleSetting("notifEmail", v)}
                data-testid="switch-notif-email"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity</CardTitle>
            <CardDescription>Notifications about your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <AtSign className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mentions & Tags</p>
                  <p className="text-xs text-muted-foreground">When someone mentions you</p>
                </div>
              </div>
              <Switch
                checked={user.notifMentions ?? true}
                onCheckedChange={(v) => toggleSetting("notifMentions", v)}
                data-testid="switch-notif-mentions"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Messages</p>
                  <p className="text-xs text-muted-foreground">New Private Chat messages</p>
                </div>
              </div>
              <Switch
                checked={user.notifMessages ?? true}
                onCheckedChange={(v) => toggleSetting("notifMessages", v)}
                data-testid="switch-notif-messages"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Discover</CardTitle>
            <CardDescription>Stay updated with trends and local news</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trending Alerts</p>
                  <p className="text-xs text-muted-foreground">When topics are trending near you</p>
                </div>
              </div>
              <Switch
                checked={user.notifTrending ?? true}
                onCheckedChange={(v) => toggleSetting("notifTrending", v)}
                data-testid="switch-notif-trending"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">State-Based Alerts</p>
                  <p className="text-xs text-muted-foreground">Important updates from your state</p>
                </div>
              </div>
              <Switch
                checked={user.notifStateAlerts ?? false}
                onCheckedChange={(v) => toggleSetting("notifStateAlerts", v)}
                data-testid="switch-notif-state"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Special</CardTitle>
            <CardDescription>India-specific notification options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Cricket Match Alerts</p>
                <p className="text-xs text-muted-foreground">Live score updates and discussions</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Election Updates</p>
                <p className="text-xs text-muted-foreground">Political news and election results</p>
              </div>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
