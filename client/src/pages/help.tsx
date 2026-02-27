import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, FileText, Shield, ChevronDown, ChevronRight, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    q: "What is Zorish?",
    a: "Zorish is India's premium social media platform — Apna Social Space. Share posts, connect with other users through Match (follow), and engage with trending content across India.",
  },
  {
    q: "What does 'Match' mean?",
    a: "Match is our term for Follow. When you Match someone, you'll see their posts in your feed. 'Matchers' are your followers, and 'Matched' are people you follow.",
  },
  {
    q: "What does 'Impressive' mean?",
    a: "Impressive is our Like feature. Tap the star icon on any post to mark it as Impressive and show the creator you enjoyed their content.",
  },
  {
    q: "How do I create a post?",
    a: "From the Home page, tap the text box at the top that says 'What's happening in India?' to compose your post. You can add hashtags to make your post discoverable.",
  },
  {
    q: "How do I change my profile picture?",
    a: "Go to your Profile, click Edit, and use the 'Change Photo' button to upload a new profile picture from your device.",
  },
  {
    q: "How do I translate a post?",
    a: "Each post has a Translate button that lets you translate between English and Hindi. More languages are coming soon!",
  },
  {
    q: "Can I listen to posts?",
    a: "Yes! Use the Listen button on any post to hear it read aloud using your device's text-to-speech feature.",
  },
  {
    q: "How do I block someone?",
    a: "Visit the user's profile and use the block option. Blocked users cannot see your profile or interact with your posts. You can manage blocked users from Settings > Privacy > Blocked Users.",
  },
  {
    q: "Is my data safe?",
    a: "Yes! We take data privacy seriously. Your password is securely hashed, and you can control your privacy settings from the Privacy page.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <AppLayout title="Help & Support">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-help-title">Help & Support</h2>
          <p className="text-sm text-muted-foreground mt-1">Find answers and get help</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-medium hover:text-primary transition-colors"
                  data-testid={`faq-${i}`}
                >
                  {item.q}
                  {openFaq === i ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="pb-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <MessageCircle className="h-4 w-4" /> Chat with Support Bot
              <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <a href="mailto:omenanant@gmail.com">
                <Mail className="h-4 w-4" /> Email Support
                <span className="ml-auto text-xs text-muted-foreground">omenanant@gmail.com</span>
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Legal & Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="text-sm font-semibold mb-1">Community Guidelines</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zorish is committed to creating a safe, respectful community for all users.
                  Please be respectful, avoid hate speech, misinformation, and harassment.
                  Content that violates Indian law or promotes illegal activities is strictly prohibited.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="text-sm font-semibold mb-1">Terms of Service</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By using Zorish, you agree to our terms of service. You must be 13 years
                  or older to use this platform. You are responsible for the content you post.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <h4 className="text-sm font-semibold mb-1">Privacy Policy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We respect your privacy. We collect minimal personal data required to provide
                  our services. We never sell your data to third parties. You can request data
                  deletion at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Grievance Officer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                In compliance with the Information Technology (Intermediary Guidelines and Digital Media
                Ethics Code) Rules, 2021, our Grievance Officer can be reached at
                <a href="mailto:grievance@zorish.app" className="text-primary ml-1">grievance@zorish.app</a>.
                We aim to respond to all grievances within 24 hours and resolve them within 15 days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
