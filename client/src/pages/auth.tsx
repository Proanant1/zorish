import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const communityMembers = [
  { initials: "RS", color: "#E97C3A" },
  { initials: "PK", color: "#7C5CBF" },
  { initials: "AT", color: "#3A9E6E" },
  { initials: "MS", color: "#C94B4B" },
  { initials: "DK", color: "#2B7EC1" },
  { initials: "SR", color: "#C2873A" },
  { initials: "NP", color: "#5A7EC9" },
];

function CommunityAvatars() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginTop: "28px" }}>
      {communityMembers.map((m, i) => (
        <div
          key={m.initials}
          title={m.initials}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: m.color,
            border: "2px solid #0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#fff",
            marginLeft: i === 0 ? 0 : "-8px",
            zIndex: communityMembers.length - i,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {m.initials}
        </div>
      ))}
      <p style={{ marginLeft: "14px", fontSize: "12px", color: "#737373", fontWeight: 400 }}>
        Join <span style={{ color: "#F5B041", fontWeight: 600 }}>10M+</span> creators
      </p>
    </div>
  );
}

function AuthInput({
  id, type = "text", placeholder, value, onChange, right, "data-testid": testId,
}: {
  id: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  right?: React.ReactNode;
  "data-testid"?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-testid={testId}
        style={{
          background: "#111111",
          border: `1px solid ${focused ? "#F5B041" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "12px",
          color: "#F5F5F5",
          width: "100%",
          padding: "13px 16px",
          paddingRight: right ? "44px" : "16px",
          fontSize: "14px",
          outline: "none",
          transition: "border-color 0.2s ease",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {right && (
        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#737373", cursor: "pointer", display: "flex", alignItems: "center" }}>
          {right}
        </span>
      )}
    </div>
  );
}

function AuthSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          color: value ? "#F5F5F5" : "#737373",
          fontSize: "14px",
          padding: "13px 16px",
          height: "auto",
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{msg}</p>;
}

function GoldButton({ children, type = "button", disabled, testId }: {
  children: React.ReactNode; type?: "button" | "submit"; disabled?: boolean; testId?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      data-testid={testId}
      style={{
        width: "100%",
        background: disabled ? "rgba(245,176,65,0.45)" : "#F5B041",
        color: "#0A0A0A",
        border: "none",
        borderRadius: "12px",
        padding: "14px",
        fontSize: "15px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.18s ease",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#737373",
  marginBottom: "7px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

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
    const errs: Record<string, string> = {};
    if (loginUsername.length < 3) errs.username = "Must be at least 3 characters";
    if (loginPassword.length < 6) errs.password = "Must be at least 6 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(loginUsername, loginPassword);
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (regDisplayName.length < 2) errs.displayName = "Must be at least 2 characters";
    if (regUsername.length < 3) errs.username = "Must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(regUsername) && regUsername.length >= 3) errs.username = "Only letters, numbers, underscores";
    if (!regEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errs.email = "Enter a valid email";
    if (regPassword.length < 6) errs.password = "Must be at least 6 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await register({ username: regUsername, password: regPassword, displayName: regDisplayName, email: regEmail, state: regState, languagePreference: regLanguage });
    } catch (e: any) {
      toast({ title: "Registration failed", description: e.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
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
      toast({ title: "Error", description: e.message || "Something went wrong.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const divider: React.CSSProperties = {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "20px 0",
  };

  const switchText: React.CSSProperties = {
    textAlign: "center",
    fontSize: "13px",
    color: "#737373",
    marginTop: "20px",
  };

  const switchLink: React.CSSProperties = {
    color: "#F5B041",
    fontWeight: 600,
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", fontFamily: "'Inter', 'Poppins', sans-serif" }}>

      {/* ── LEFT BRAND PANEL — desktop/tablet only ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: "42%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Very subtle warm glow behind Z */}
        <div style={{
          position: "absolute",
          width: "340px", height: "340px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,176,65,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", textAlign: "center" }}>
          <img
            src={zorishLogoUrl}
            alt="Zorish"
            style={{ width: "120px", height: "120px", marginBottom: "24px" }}
          />
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #F5B041 0%, #F8D070 60%, #F5B041 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "12px",
          }}>
            Zorish
          </h1>
          <p style={{ fontSize: "15px", color: "#737373", fontWeight: 400 }}>Apna Social Space</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Mobile-only brand header */}
          <div className="flex lg:hidden" style={{ flexDirection: "column", alignItems: "center", marginBottom: "36px" }}>
            <img src={zorishLogoUrl} alt="Zorish" style={{ width: "72px", height: "72px", marginBottom: "16px" }} />
            <p
              style={{ fontSize: "28px", fontWeight: 800, background: "linear-gradient(135deg, #F5B041, #F8D070)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.02em" }}
              data-testid="text-app-title"
            >
              Zorish
            </p>
            <p style={{ fontSize: "13px", color: "#737373", marginTop: "4px" }}>Apna Social Space</p>
          </div>

          {/* ── FORGOT PASSWORD ── */}
          {mode === "forgot" && (
            <div>
              <button
                onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); setErrors({}); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", color: "#737373", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", marginBottom: "28px", padding: 0 }}
                data-testid="button-back-to-login"
              >
                <ArrowLeft size={14} /> Back to Log In
              </button>

              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#F5F5F5", marginBottom: "6px" }}>Forgot Password</h2>
              <p style={{ fontSize: "13px", color: "#737373", marginBottom: "28px", lineHeight: 1.5 }}>
                Enter the email on your account and we'll send a reset link.
              </p>

              {forgotSent ? (
                <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                  <CheckCircle2 size={52} color="#22C55E" />
                  <p style={{ fontWeight: 600, color: "#F5F5F5", fontSize: "16px" }}>Check your inbox!</p>
                  <p style={{ fontSize: "13px", color: "#737373", lineHeight: 1.5 }}>
                    If <strong style={{ color: "#F5F5F5" }}>{forgotEmail}</strong> is registered, you'll get a reset link shortly.
                  </p>
                  <GoldButton onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); }} testId="button-back-to-login-after-sent">
                    Back to Log In
                  </GoldButton>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={label}>Email address</label>
                    <AuthInput id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={setForgotEmail} data-testid="input-forgot-email" />
                    <FieldError msg={errors.forgotEmail} />
                  </div>
                  <GoldButton type="submit" disabled={isSubmitting} testId="button-forgot-submit">
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </GoldButton>
                </form>
              )}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <div>
              <div style={{ marginBottom: "32px" }}>
                <div className="hidden lg:flex" style={{ alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <img src={zorishLogoUrl} alt="Z" style={{ width: "28px", height: "28px" }} />
                  <span style={{ fontSize: "13px", color: "#737373" }}>Sign in to Zorish</span>
                </div>
                <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#F5F5F5", letterSpacing: "-0.01em" }}>Log In</h2>
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={label} htmlFor="login-username">Username</label>
                  <AuthInput id="login-username" placeholder="Enter username" value={loginUsername} onChange={setLoginUsername} data-testid="input-login-username" />
                  <FieldError msg={errors.username} />
                </div>
                <div>
                  <label style={label} htmlFor="login-password">Password</label>
                  <AuthInput
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={setLoginPassword}
                    data-testid="input-login-password"
                    right={
                      <span onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    }
                  />
                  <FieldError msg={errors.password} />
                </div>

                <div style={{ marginTop: "4px" }}>
                  <GoldButton type="submit" disabled={isSubmitting} testId="button-login-submit">
                    {isSubmitting ? "Logging in..." : "Log In"}
                  </GoldButton>
                </div>
              </form>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  onClick={() => { setMode("forgot"); setErrors({}); }}
                  style={{ color: "#737373", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "13px" }}
                  data-testid="button-forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>

              <div style={divider} />

              <CommunityAvatars />

              <p style={switchText}>
                New to Zorish?{" "}
                <button
                  onClick={() => { setMode("register"); setErrors({}); }}
                  style={switchLink}
                  data-testid="button-register-tab"
                >
                  Sign Up
                </button>
              </p>

              <p style={{ textAlign: "center", fontSize: "11px", color: "#737373", marginTop: "16px", lineHeight: 1.5 }}>
                By logging in, you agree to our{" "}
                <span style={{ color: "#A1A1A1" }}>Terms</span> &{" "}
                <span style={{ color: "#A1A1A1" }}>Privacy Policy</span>.
              </p>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {mode === "register" && (
            <div>
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <img src={zorishLogoUrl} alt="Z" style={{ width: "22px", height: "22px" }} />
                  <span style={{ fontSize: "12px", color: "#737373", fontWeight: 500 }}>Sign Up to Zorish</span>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#F5F5F5", letterSpacing: "-0.01em", marginBottom: "4px" }}>Create your account</h2>
                <p style={{ fontSize: "13px", color: "#737373" }}>Join 10M+ creators on Apna Social Space</p>
              </div>

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={label} htmlFor="reg-displayname">Full Name</label>
                  <AuthInput id="reg-displayname" placeholder="Your full name" value={regDisplayName} onChange={setRegDisplayName} data-testid="input-register-displayname" />
                  <FieldError msg={errors.displayName} />
                </div>
                <div>
                  <label style={label} htmlFor="reg-username">Username</label>
                  <AuthInput id="reg-username" placeholder="Choose a username" value={regUsername} onChange={setRegUsername} data-testid="input-register-username" />
                  <FieldError msg={errors.username} />
                </div>
                <div>
                  <label style={label} htmlFor="reg-email">Email</label>
                  <AuthInput id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={setRegEmail} data-testid="input-register-email" />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label style={label} htmlFor="reg-password">Password</label>
                  <AuthInput
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={setRegPassword}
                    data-testid="input-register-password"
                    right={
                      <span onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    }
                  />
                  <FieldError msg={errors.password} />
                </div>
                <div>
                  <label style={label}>State <span style={{ textTransform: "none", color: "#525252" }}>(optional)</span></label>
                  <AuthSelect value={regState} onChange={setRegState} options={indianStates} placeholder="Select your state" />
                </div>
                <div>
                  <label style={label}>Language</label>
                  <AuthSelect value={regLanguage} onChange={setRegLanguage} options={languages} placeholder="Select language" />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <GoldButton type="submit" disabled={isSubmitting} testId="button-register-submit">
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                  </GoldButton>
                </div>
              </form>

              <CommunityAvatars />

              <p style={switchText}>
                Already on Zorish?{" "}
                <button
                  onClick={() => { setMode("login"); setErrors({}); }}
                  style={switchLink}
                  data-testid="button-login-tab"
                >
                  Log In
                </button>
              </p>

              <p style={{ textAlign: "center", fontSize: "11px", color: "#525252", marginTop: "12px", lineHeight: 1.6 }}>
                By signing up, you agree to our{" "}
                <span style={{ color: "#737373" }}>Terms of Service</span>{" "}
                and{" "}
                <span style={{ color: "#737373" }}>Privacy Policy</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
