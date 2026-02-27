import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import zorishLogoUrl from "@assets/zorish-z.svg";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const languages = [
  "Hindi", "English", "Marathi", "Tamil", "Gujarati",
  "Bengali", "Bhojpuri", "Telugu", "Kannada", "Malayalam",
];

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regDisplayName, setRegDisplayName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regState, setRegState] = useState("");
  const [regLanguage, setRegLanguage] = useState("English");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (loginUsername.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (loginPassword.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(loginUsername, loginPassword);
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (regDisplayName.length < 2) newErrors.displayName = "Display name must be at least 2 characters";
    if (regUsername.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(regUsername) && regUsername.length >= 3) newErrors.username = "Only letters, numbers, and underscores";
    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) newErrors.email = "Enter a valid email address";
    if (regPassword.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await register({
        username: regUsername,
        password: regPassword,
        displayName: regDisplayName,
        email: regEmail,
        state: regState,
        languagePreference: regLanguage,
      });
    } catch (e: any) {
      toast({ title: "Registration failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ forgotEmail: "Enter a valid email address" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src={zorishLogoUrl} alt="Zorish" className="mx-auto h-20 w-20" />
          <h1 className="text-3xl font-bold tracking-tight gold-text" data-testid="text-app-title">Zorish</h1>
          <p className="text-sm text-muted-foreground italic">Apna Social Space</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {mode === "forgot" ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); setErrors({}); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Forgot Password</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the email linked to your account and we'll send you a reset link.
                  </p>
                </div>

                {forgotSent ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <p className="font-medium">Check your inbox!</p>
                    <p className="text-sm text-muted-foreground">
                      If <span className="font-medium text-foreground">{forgotEmail}</span> is linked to an account, you'll receive a password reset link within a few minutes.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); }}
                      data-testid="button-back-to-login-after-sent"
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          data-testid="input-forgot-email"
                        />
                      </div>
                      {errors.forgotEmail && <p className="text-xs text-destructive">{errors.forgotEmail}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-forgot-submit">
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 flex rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrors({}); }}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    data-testid="button-login-tab"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setErrors({}); }}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    data-testid="button-register-tab"
                  >
                    Sign up
                  </button>
                </div>

                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        data-testid="input-login-username"
                      />
                      {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          onClick={() => { setMode("forgot"); setErrors({}); }}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                          data-testid="button-forgot-password-link"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          data-testid="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-login-submit">
                      {isSubmitting ? "Logging in..." : "Log in"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-displayname">Display Name</Label>
                      <Input
                        id="reg-displayname"
                        placeholder="Your name"
                        value={regDisplayName}
                        onChange={(e) => setRegDisplayName(e.target.value)}
                        data-testid="input-register-displayname"
                      />
                      {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="Choose a username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        data-testid="input-register-username"
                      />
                      {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          data-testid="input-register-email"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      <p className="text-[10px] text-muted-foreground">Used for password recovery only. Not shown publicly.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          data-testid="input-register-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          data-testid="button-toggle-password-reg"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>State (optional)</Label>
                      <Select onValueChange={setRegState} value={regState}>
                        <SelectTrigger data-testid="select-register-state">
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select onValueChange={setRegLanguage} value={regLanguage}>
                        <SelectTrigger data-testid="select-register-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-register-submit">
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
