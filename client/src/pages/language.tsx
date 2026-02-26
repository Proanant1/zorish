import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Languages, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const availableLanguages = [
  { code: "English", label: "English", native: "English" },
  { code: "Hindi", label: "Hindi", native: "Hindi" },
  { code: "Tamil", label: "Tamil", native: "Tamil" },
  { code: "Telugu", label: "Telugu", native: "Telugu" },
  { code: "Marathi", label: "Marathi", native: "Marathi" },
  { code: "Bengali", label: "Bengali", native: "Bengali" },
  { code: "Kannada", label: "Kannada", native: "Kannada" },
  { code: "Gujarati", label: "Gujarati", native: "Gujarati" },
  { code: "Malayalam", label: "Malayalam", native: "Malayalam" },
  { code: "Punjabi", label: "Punjabi", native: "Punjabi" },
  { code: "Odia", label: "Odia", native: "Odia" },
  { code: "Urdu", label: "Urdu", native: "Urdu" },
];

export default function LanguagePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (lang: string) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", { languagePreference: lang });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/me"], updatedUser);
      toast({ title: "Language updated" });
    },
    onError: (e: any) => {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const currentLang = user.languagePreference || "English";

  return (
    <AppLayout title="Language">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" data-testid="text-language-title">Language</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose your preferred language for Freefinity India</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Languages className="h-4 w-4" /> App Language
            </CardTitle>
            <CardDescription>Select your preferred interface language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateMutation.mutate(lang.code)}
                  disabled={updateMutation.isPending}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all",
                    currentLang === lang.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground"
                  )}
                  data-testid={`lang-${lang.code.toLowerCase()}`}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{lang.label}</p>
                    <p className="text-xs text-muted-foreground">{lang.native}</p>
                  </div>
                  {currentLang === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Content Translation
            </CardTitle>
            <CardDescription>Automatic translation options for posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Translate Button</p>
                <p className="text-xs text-muted-foreground">Show translate option on posts in other languages</p>
              </div>
              <Switch checked={true} disabled data-testid="switch-translate" />
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                Tip: Use the translate button on any post to translate between English and Hindi.
                More languages coming soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
