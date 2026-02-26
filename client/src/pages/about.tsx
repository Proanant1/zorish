import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Globe, Star, Shield, Users, Zap } from "lucide-react";
import logoImg from "@assets/Convert_to_PNG_project1_1771827032078.png";

export default function AboutPage() {
  return (
    <AppLayout title="About">
      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center text-center py-6">
          <img src={logoImg} alt="Freefinity India" className="h-20 w-20 rounded-2xl object-contain mb-4" data-testid="img-about-logo" />
          <h2 className="text-2xl font-bold" data-testid="text-about-title">Freefinity India</h2>
          <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              Made in India
            </Badge>
            <Badge variant="outline" className="gap-1 text-orange-500 border-orange-500/30">
              <Heart className="h-3 w-3 fill-orange-500" />
              Bharat
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-500" /> Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Freefinity India is India's own social media platform representing Freedom Without Limits for India.
              Built to connect Indians with each other and celebrate the diversity of our nation.
              Your Voice. Your Bharat. No Limits. We believe in giving voice to every Indian,
              supporting regional languages, and building a safe digital space that respects our culture and values.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Multi-Language Support</p>
                  <p className="text-xs text-muted-foreground">Support for 12+ Indian languages with content translation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Match & Connect</p>
                  <p className="text-xs text-muted-foreground">Follow people across India and build your community</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trending Hashtags</p>
                  <p className="text-xs text-muted-foreground">Discover what's trending across India in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Privacy First</p>
                  <p className="text-xs text-muted-foreground">Your data stays safe with granular privacy controls</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "India Voice Rooms - Live audio discussions",
                "Cricket Live Rooms - Real-time match discussions",
                "FreefinityRank - Top creators leaderboard",
                "State Trending - Region-specific trends",
                "Education Hub - Study groups & mentoring",
                "Creator Monetization - Earn from your content",
                "UPI Tipping - Support your favorite creators",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                  <p className="text-xs text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <a href="mailto:isomen.shadow@gmail.com" className="text-sm text-primary">isomen.shadow@gmail.com</a>
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="text-sm text-muted-foreground">Support</span>
              <a href="mailto:onenanant@gmail.com" className="text-sm text-primary">onenanant@gmail.com</a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">
            Made with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> in India
          </p>
          <p className="text-xs text-muted-foreground mt-1">&copy; 2025 Freefinity India. All rights reserved.</p>
        </div>
      </div>
    </AppLayout>
  );
}
