import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle2, Sparkles, Users, Globe } from "lucide-react";
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

const highlights = [
  { icon: Users, label: "Connect", desc: "Build your community across India" },
  { icon: Sparkles, label: "Share", desc: "Express yourself in your language" },
  { icon: Globe, label: "Discover", desc: "Explore what's trending near you" },
];

const inputStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "14px",
  color: "#F5F7FA",
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

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
          ...inputStyle,
          borderColor: focused ? "#F5B041" : "rgba(255,255,255,0.10)",
          paddingRight: right ? "44px" : "16px",
        }}
      />
      {right && (
        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#9BA3AF", cursor: "pointer", display: "flex", alignItems: "center" }}>
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
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "14px",
          color: value ? "#F5F7FA" : "#9BA3AF",
          fontSize: "14px",
          padding: "12px 16px",
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

function GoldButton({ children, onClick, type = "button", disabled, testId }: {
  children: React.ReactNode; onClick?: () => void;
  type?: "button" | "submit"; disabled?: boolean; testId?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        width: "100%",
        background: disabled ? "rgba(245,176,65,0.5)" : "#F5B041",
        color: "#0A0A0A",
        border: "none",
        borderRadius: "20px",
        padding: "14px",
        fontSize: "15px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s ease",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

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
      await register({ username: regUsername, password: regPassword, displayName: regDisplayName, email: regEmail, state: regState, languagePreference: regLanguage });
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
      toast({ title: "Error", description: e.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const LoginForm = (
    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Username or Email</label>
        <AuthInput
          id="login-username"
          placeholder="Enter your username"
          value={loginUsername}
          onChange={setLoginUsername}
          data-testid="input-login-username"
        />
        <FieldError msg={errors.username} />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ fontSize: "13px", color: "#9BA3AF", fontWeight: 500 }}>Password</label>
          <button
            type="button"
            onClick={() => { setMode("forgot"); setErrors({}); }}
            style={{ fontSize: "12px", color: "#F5B041", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            data-testid="button-forgot-password-link"
          >
            Forgot password?
          </button>
        </div>
        <AuthInput
          id="login-password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
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
          {isSubmitting ? "Signing in..." : "Sign In"}
        </GoldButton>
      </div>
    </form>
  );

  const RegisterForm = (
    <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Full Name</label>
        <AuthInput id="reg-displayname" placeholder="Your name" value={regDisplayName} onChange={setRegDisplayName} data-testid="input-register-displayname" />
        <FieldError msg={errors.displayName} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Username</label>
        <AuthInput id="reg-username" placeholder="Choose a username" value={regUsername} onChange={setRegUsername} data-testid="input-register-username" />
        <FieldError msg={errors.username} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Email Address</label>
        <AuthInput id="reg-email" type="email" placeholder="you@example.com" value={regEmail} onChange={setRegEmail} data-testid="input-register-email" />
        <FieldError msg={errors.email} />
        <p style={{ fontSize: "11px", color: "#9BA3AF", marginTop: "4px" }}>Used for password recovery only. Not shown publicly.</p>
      </div>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Password</label>
        <AuthInput
          id="reg-password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password (min 6 chars)"
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
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>State <span style={{ color: "#9BA3AF", fontWeight: 400 }}>(optional)</span></label>
        <AuthSelect value={regState} onChange={setRegState} options={indianStates} placeholder="Select your state" />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Language</label>
        <AuthSelect value={regLanguage} onChange={setRegLanguage} options={languages} placeholder="Select language" />
      </div>
      <div style={{ marginTop: "4px" }}>
        <GoldButton type="submit" disabled={isSubmitting} testId="button-register-submit">
          {isSubmitting ? "Creating account..." : "Create Account"}
        </GoldButton>
      </div>
    </form>
  );

  const ForgotForm = (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <button
        type="button"
        onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); setErrors({}); }}
        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#9BA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, alignSelf: "flex-start" }}
        data-testid="button-back-to-login"
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#F5F7FA", marginBottom: "6px" }}>Forgot Password</h3>
        <p style={{ fontSize: "13px", color: "#9BA3AF", lineHeight: 1.5 }}>Enter the email linked to your account and we'll send a reset link.</p>
      </div>
      {forgotSent ? (
        <div style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <CheckCircle2 size={48} color="#22C55E" />
          <p style={{ fontWeight: 600, color: "#F5F7FA" }}>Check your inbox!</p>
          <p style={{ fontSize: "13px", color: "#9BA3AF", lineHeight: 1.5 }}>
            If <strong style={{ color: "#F5F7FA" }}>{forgotEmail}</strong> is registered, you'll receive a reset link shortly.
          </p>
          <GoldButton onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail(""); }} testId="button-back-to-login-after-sent">
            Back to Sign In
          </GoldButton>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#9BA3AF", marginBottom: "8px", fontWeight: 500 }}>Email address</label>
            <AuthInput id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={setForgotEmail} data-testid="input-forgot-email" />
            <FieldError msg={errors.forgotEmail} />
          </div>
          <GoldButton type="submit" disabled={isSubmitting} testId="button-forgot-submit">
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </GoldButton>
        </form>
      )}
    </div>
  );

  const cardStyle: React.CSSProperties = {
    background: "#161616",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "32px",
    width: "100%",
  };

  const AuthCard = (
    <div style={cardStyle}>
      {mode === "forgot" ? ForgotForm : (
        <>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F5F7FA", marginBottom: "4px" }}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </h2>
            <p style={{ fontSize: "13px", color: "#9BA3AF" }}>
              {mode === "login" ? "Welcome back to Zorish" : "Join Zorish — Apna Social Space"}
            </p>
          </div>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setErrors({}); }}
              data-testid="button-login-tab"
              style={{
                flex: 1, borderRadius: "10px", padding: "8px",
                fontSize: "14px", fontWeight: 500, fontFamily: "inherit",
                background: mode === "login" ? "#F5B041" : "transparent",
                color: mode === "login" ? "#0A0A0A" : "#9BA3AF",
                border: "none", cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setErrors({}); }}
              data-testid="button-register-tab"
              style={{
                flex: 1, borderRadius: "10px", padding: "8px",
                fontSize: "14px", fontWeight: 500, fontFamily: "inherit",
                background: mode === "register" ? "#F5B041" : "transparent",
                color: mode === "register" ? "#0A0A0A" : "#9BA3AF",
                border: "none", cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              Sign Up
            </button>
          </div>

          {mode === "login" ? LoginForm : RegisterForm}

          {mode === "register" && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "#9BA3AF", marginTop: "20px", lineHeight: 1.5 }}>
              By creating an account, you agree to our{" "}
              <span style={{ color: "#F5B041" }}>Terms of Service</span>{" "}
              and{" "}
              <span style={{ color: "#F5B041" }}>Privacy Policy</span>.
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", fontFamily: "'Inter', 'Poppins', sans-serif" }}>

      {/* LEFT PANEL — desktop only */}
      <div
        className="hidden lg:flex"
        style={{
          width: "40%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow behind logo */}
        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(245,176,65,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <img src={zorishLogoUrl} alt="Zorish" style={{ width: "36px", height: "36px" }} />
            <span style={{ fontSize: "20px", fontWeight: 700, background: "linear-gradient(135deg, #F5B041, #F8D070)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Zorish
            </span>
          </div>

          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#F5F7FA", lineHeight: 1.2, marginBottom: "12px" }}>
            Welcome to<br />Zorish
          </h1>
          <p style={{ fontSize: "16px", color: "#9BA3AF", marginBottom: "48px" }}>Apna Social Space</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {highlights.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "rgba(245,176,65,0.10)",
                  border: "1px solid rgba(245,176,65,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={18} color="#F5B041" />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#F5F7FA", marginBottom: "2px" }}>{label}</p>
                  <p style={{ fontSize: "13px", color: "#9BA3AF", lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — auth form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          overflowY: "auto",
        }}
      >
        {/* Mobile-only logo */}
        <div className="flex lg:hidden" style={{ flexDirection: "column", alignItems: "center", marginBottom: "28px", gap: "8px" }}>
          <img src={zorishLogoUrl} alt="Zorish" style={{ width: "52px", height: "52px" }} />
          <p style={{ fontSize: "24px", fontWeight: 700, background: "linear-gradient(135deg, #F5B041, #F8D070)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} data-testid="text-app-title">
            Zorish
          </p>
          <p style={{ fontSize: "13px", color: "#9BA3AF", fontStyle: "italic" }}>Apna Social Space</p>
        </div>

        <div style={{ width: "100%", maxWidth: "440px" }}>
          {AuthCard}
        </div>

        <p style={{ marginTop: "20px", fontSize: "12px", color: "#9BA3AF", textAlign: "center", maxWidth: "340px", lineHeight: 1.6 }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "#F5B041" }}>Terms of Service</span>{" "}
          and{" "}
          <span style={{ color: "#F5B041" }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
