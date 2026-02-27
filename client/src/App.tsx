import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import ResetPasswordPage from "@/pages/reset-password";
import FeedPage from "@/pages/feed";
import TrendingPage from "@/pages/trending";
import SearchPage from "@/pages/search";
import ChatPage from "@/pages/chat";
import ConversationPage from "@/pages/conversation";
import ProfilePage from "@/pages/profile";
import UserProfilePage from "@/pages/user-profile";
import BookmarksPage from "@/pages/bookmarks";
import CreatorStudioPage from "@/pages/creator-studio";
import SettingsPage from "@/pages/settings";
import PrivacyPage from "@/pages/privacy";
import LanguagePage from "@/pages/language";
import NotificationPrefsPage from "@/pages/notification-prefs";
import BlockedUsersPage from "@/pages/blocked";
import HelpPage from "@/pages/help";
import AboutPage from "@/pages/about";
import DonatePage from "@/pages/donate";
import GetVerifiedPage from "@/pages/get-verified";
import NotificationsPage from "@/pages/notifications";
import ReelsPage from "@/pages/reels";
import zorishLogoUrl from "@assets/zorish-z.svg";

function AuthenticatedRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <img src={zorishLogoUrl} alt="Zorish" className="h-12 w-12 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (window.location.pathname === "/reset-password") return <ResetPasswordPage />;
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={FeedPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/chat/:userId" component={ConversationPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/user/:username" component={UserProfilePage} />
      <Route path="/bookmarks" component={BookmarksPage} />
      <Route path="/creator-studio" component={CreatorStudioPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/language" component={LanguagePage} />
      <Route path="/notification-prefs" component={NotificationPrefsPage} />
      <Route path="/blocked" component={BlockedUsersPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/donate" component={DonatePage} />
      <Route path="/get-verified" component={GetVerifiedPage} />
      <Route path="/reels" component={ReelsPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AuthenticatedRouter />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
