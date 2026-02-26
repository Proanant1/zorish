import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import {
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Users, BarChart2, Clock, Crown, GraduationCap,
  RefreshCw, Shield, Sparkles, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/app-layout";

declare global {
  interface Window { Razorpay: any; }
}

const PAGE_BG = "#0C0F0A";
const SURFACE = "#151A14";
const SURFACE2 = "#1A201A";

const BADGES = [
  {
    id: "blue",
    label: "Identity Verified",
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.35)",
    border: "rgba(59,130,246,0.3)",
    price: "₹29 / 3 months",
    priceValue: 2900,
    period: "3 months",
    type: "paid",
    icon: Shield,
    description: "Confirm your real identity and earn the trust badge that shows your account is genuinely verified.",
    features: ["Identity confirmed by FreeFinity", "Blue tick on profile & posts", "Higher trust in search results", "KYC + Phone OTP required", "Renewal reminder before expiry"],
  },
  {
    id: "gold",
    label: "High Authority",
    color: "#D4AF37",
    glow: "rgba(212,175,55,0.35)",
    border: "rgba(212,175,55,0.3)",
    price: "Free — Invite Only",
    priceValue: 0,
    period: "Permanent",
    type: "admin",
    icon: Crown,
    description: "Exclusive badge granted by the FreeFinity India team to exceptionally influential accounts.",
    features: ["Admin evaluation required", "Extremely rare — very selective", "Gold glow on all content", "Permanent once granted", "Request review to be considered"],
  },
  {
    id: "emerald",
    label: "Regional Leader",
    color: "#138808",
    glow: "rgba(19,136,8,0.35)",
    border: "rgba(19,136,8,0.3)",
    price: "Free — Earned",
    priceValue: 0,
    period: "Auto-renewed",
    type: "earned",
    icon: Users,
    description: "Automatically granted when you reach 2,000 Matchers and 10,000 monthly impressions with no violations.",
    features: ["2,000+ Matchers required", "10,000 monthly impressions", "No account violations", "Auto-granted when criteria met", "Auto-removed if criteria drops"],
  },
  {
    id: "purple",
    label: "Monetized Creator",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.35)",
    border: "rgba(139,92,246,0.3)",
    price: "₹79 / month",
    priceValue: 7900,
    period: "Monthly",
    type: "subscription",
    icon: Sparkles,
    description: "Unlock creator monetization, revenue dashboard, analytics, and boosted reach as an active subscriber.",
    features: ["Channel creation tools", "Revenue dashboard access", "Full analytics suite", "Priority boost on content", "Active while subscription is active"],
  },
  {
    id: "indigo",
    label: "Student Verified",
    color: "#6366F1",
    glow: "rgba(99,102,241,0.35)",
    border: "rgba(99,102,241,0.3)",
    price: "Free",
    priceValue: 0,
    period: "Academic year",
    type: "student",
    icon: GraduationCap,
    description: "Verified student badge with access to campus communities, campus trending feed, and Student Safe Mode.",
    features: ["College ID verification", "Campus-only communities", "Campus trending feed", "Student Safe Mode enabled", "Limited ads & promotions"],
  },
];

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
    approved: { label: "Approved", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
    pending: { label: "Pending Review", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
    expired: { label: "Expired", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
    none: { label: "Not Applied", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  };
  const s = map[status] || map.none;
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

function BadgeCircle({ color, glow, size = 48 }: { color: string; glow: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ filter: `drop-shadow(0 0 8px ${glow})` }}>
      <defs>
        <radialGradient id={`bg-${color.replace("#", "")}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#bg-${color.replace("#", "")})`} />
      <circle cx="24" cy="24" r="21" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity="0.15" />
      <polyline points="15,24.5 21.5,31 33,18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmeraldTracker() {
  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/verify/emerald-eligibility"],
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#138808" }} />
    </div>
  );

  const d = data || {};
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
            <Users className="h-3.5 w-3.5" />
            Matchers
          </span>
          <span style={{ color: d.meetsFollowers ? "#34D399" : "#9CA3AF" }}>
            {(d.followersCount || 0).toLocaleString()} / {(d.followersRequired || 2000).toLocaleString()}
            {d.meetsFollowers && " ✓"}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F2920" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.followersPercent || 0}%`, background: "#138808" }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
            <BarChart2 className="h-3.5 w-3.5" />
            Monthly Impressions
          </span>
          <span style={{ color: d.meetsImpressions ? "#34D399" : "#9CA3AF" }}>
            {(d.monthlyImpressions || 0).toLocaleString()} / {(d.impressionsRequired || 10000).toLocaleString()}
            {d.meetsImpressions && " ✓"}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F2920" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.impressionsPercent || 0}%`, background: "#138808" }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#9CA3AF" }}>Eligibility Status</span>
        <StatusPill status={d.eligible ? "active" : "none"} />
      </div>
      {d.eligible && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(19,136,8,0.12)", border: "1px solid rgba(19,136,8,0.3)" }}>
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#138808" }} />
          <span style={{ color: "#34D399" }}>You're eligible! Badge will be auto-granted shortly.</span>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs gap-1.5 mt-1"
        style={{ color: "#6B7280" }}
        onClick={() => refetch()}
        data-testid="button-refresh-emerald"
      >
        <RefreshCw className="h-3 w-3" /> Refresh eligibility
      </Button>
    </div>
  );
}

function StudentForm({ user, onSuccess }: { user: any; onSuccess: () => void }) {
  const { toast } = useToast();
  const [collegeName, setCollegeName] = useState((user as any)?.studentCollegeName || "");
  const studentStatus = (user as any)?.studentStatus || "none";

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/verify/submit-student", { collegeName });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({ title: "Application Submitted", description: "Your student verification is under review." });
        onSuccess();
      }
    },
    onError: () => toast({ title: "Error", description: "Could not submit. Try again.", variant: "destructive" }),
  });

  if (studentStatus === "approved") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}>
        <CheckCircle2 className="h-4 w-4" style={{ color: "#6366F1" }} />
        <span style={{ color: "#A5B4FC" }}>Student verification approved for <strong>{(user as any)?.studentCollegeName}</strong></span>
      </div>
    );
  }

  if (studentStatus === "pending") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <Clock className="h-4 w-4 flex-shrink-0" style={{ color: "#FBBF24" }} />
          <span style={{ color: "#FDE68A" }}>Application submitted for <strong>{(user as any)?.studentCollegeName}</strong> — under review.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "#6B7280" }}>Enter your college or university name to begin verification.</p>
      <Input
        placeholder="e.g. IIT Delhi, Delhi University, VIT..."
        value={collegeName}
        onChange={e => setCollegeName(e.target.value)}
        className="text-sm border-zinc-700 bg-zinc-900/60 text-white placeholder:text-zinc-600"
        data-testid="input-college-name"
      />
      <p className="text-[11px]" style={{ color: "#4B5563" }}>
        Our team will verify your enrollment status. You may be asked to upload your college ID.
      </p>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || collegeName.trim().length < 3}
        className="w-full text-sm font-semibold"
        style={{ background: "#6366F1", color: "white" }}
        data-testid="button-submit-student"
      >
        {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit for Verification"}
      </Button>
    </div>
  );
}

function GoldRequest({ user }: { user: any }) {
  const { toast } = useToast();
  const kycStatus = (user as any)?.kycStatus || "none";

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/verify/request-gold", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Request Submitted", description: "Our team will evaluate your account for the Gold badge." });
    },
    onError: () => toast({ title: "Error", description: "Could not submit request. Try again.", variant: "destructive" }),
  });

  if (kycStatus === "pending") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}>
        <Clock className="h-4 w-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
        <span style={{ color: "#FDE68A" }}>Review request submitted. Our team will evaluate your account.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-lg text-[11px]" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
        <span style={{ color: "#9CA3AF" }}>This badge is invite-only and reviewed entirely by our team. You cannot purchase it.</span>
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full text-sm font-semibold"
        style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}
        data-testid="button-request-gold"
      >
        {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Request Review"}
      </Button>
    </div>
  );
}

export default function GetVerifiedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("blue");
  const [payingFor, setPayingFor] = useState<string | null>(null);

  const { data: config } = useQuery<{ configured: boolean; keyId: string | null }>({
    queryKey: ["/api/verify/config"],
  });

  const activeBadge = (user as any)?.badgeType || "none";

  const createOrderMutation = useMutation({
    mutationFn: async (badgeType: string) => {
      const res = await apiRequest("POST", "/api/verify/create-order", { badgeType });
      return res.json();
    },
    onSuccess: async (data, badgeType) => {
      if (data.message) {
        toast({ title: "Payment Unavailable", description: data.message, variant: "destructive" });
        setPayingFor(null);
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast({ title: "Error", description: "Could not load payment gateway.", variant: "destructive" });
        setPayingFor(null);
        return;
      }
      const badge = BADGES.find(b => b.id === badgeType)!;
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FreeFinity India",
        description: `${badge.label} — ${badge.period}`,
        order_id: data.orderId,
        prefill: { name: user?.displayName || "", contact: (user as any)?.phoneNumber || "" },
        theme: { color: badge.color },
        modal: { ondismiss: () => setPayingFor(null) },
        handler: async (response: any) => {
          try {
            const res = await apiRequest("POST", "/api/verify/confirm-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const result = await res.json();
            if (result.ok) {
              queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
              toast({ title: "Badge Activated!", description: `Your ${badge.label} badge is now live.` });
              setPayingFor(null);
            }
          } catch {
            toast({ title: "Error", description: "Payment verification failed. Contact support.", variant: "destructive" });
          }
        },
      });
      rzp.open();
    },
    onError: () => {
      toast({ title: "Error", description: "Could not start payment. Try again.", variant: "destructive" });
      setPayingFor(null);
    },
  });

  const activeBadgeData = BADGES.find(b => b.id === activeBadge);

  return (
    <AppLayout>
      <div
        className="min-h-screen pb-20"
        style={{ background: PAGE_BG }}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #138808 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#6B7280", background: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#151A14")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Verification Center</h1>
              <p className="text-xs" style={{ color: "#4B5563" }}>Choose your badge · Build trust · Grow faster</p>
            </div>
            {activeBadgeData && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs" style={{ color: "#6B7280" }}>Active</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: activeBadgeData.color, background: activeBadgeData.glow }}>
                  {activeBadgeData.label}
                </span>
              </div>
            )}
          </div>

          {/* No payment configured notice */}
          {!config?.configured && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl mb-5 text-xs"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#FBBF24" }} />
              <span style={{ color: "#9CA3AF" }}>
                UPI payments are not yet configured. Paid badges (Blue, Purple) will be available once the admin sets up the payment gateway. Free badges (Gold request, Emerald, Student) still work.
              </span>
            </div>
          )}

          {/* ── MOBILE LAYOUT: vertical accordion cards ── */}
          <div className="md:hidden space-y-3">
            {BADGES.map(badge => {
              const isOpen = activeTab === badge.id;
              const hasThisBadge = activeBadge === badge.id;
              const isExpired = hasThisBadge && (user as any)?.verificationExpiry && new Date((user as any).verificationExpiry) < new Date();
              return (
                <div
                  key={badge.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: SURFACE, border: `1px solid ${isOpen ? badge.border : "#1A201A"}` }}
                >
                  {/* Card header — always visible, tap to toggle */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-4 text-left"
                    onClick={() => setActiveTab(isOpen ? "" : badge.id)}
                    data-testid={`tab-mobile-badge-${badge.id}`}
                  >
                    <BadgeCircle color={badge.color} glow={badge.glow} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white">{badge.label}</span>
                        {hasThisBadge && !isExpired && <StatusPill status="active" />}
                        {isExpired && <StatusPill status="expired" />}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: badge.color }}>{badge.price}</div>
                    </div>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                      style={{ color: "#6B7280", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div
                      className="px-4 pb-5 space-y-4"
                      style={{ borderTop: `1px solid ${badge.border}` }}
                    >
                      <p className="text-sm pt-3" style={{ color: "#9CA3AF" }}>{badge.description}</p>

                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold tracking-wider" style={{ color: "#4B5563" }}>WHAT YOU GET</p>
                        <div className="space-y-1.5">
                          {badge.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "#9CA3AF" }}>
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: badge.color }} />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2" style={{ borderTop: "1px solid #1F2920" }}>
                        {badge.type === "earned" && <EmeraldTracker />}
                        {badge.type === "student" && <StudentForm user={user} onSuccess={() => {}} />}
                        {badge.type === "admin" && <GoldRequest user={user} />}
                        {(badge.type === "paid" || badge.type === "subscription") && (
                          <div className="space-y-3">
                            {hasThisBadge && !isExpired ? (
                              <div>
                                {(user as any)?.verificationExpiry && (
                                  <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#6B7280" }}>
                                    <Clock className="h-3.5 w-3.5" />
                                    Valid until {new Date((user as any).verificationExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                  </div>
                                )}
                                <Button
                                  onClick={() => { setPayingFor(badge.id); createOrderMutation.mutate(badge.id); }}
                                  disabled={createOrderMutation.isPending || !config?.configured}
                                  className="w-full text-sm font-semibold"
                                  style={{ background: badge.color + "20", color: badge.color, border: `1px solid ${badge.color}44` }}
                                  data-testid={`button-renew-${badge.id}`}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" /> Renew {badge.label}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#0C0F0A", border: "1px solid #1F2920" }}>
                                  <div>
                                    <p className="font-semibold text-sm text-white">{badge.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>{badge.period}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-base" style={{ color: badge.color }}>{badge.price.split("/")[0].trim()}</p>
                                    <p className="text-[10px]" style={{ color: "#4B5563" }}>incl. GST</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => { setPayingFor(badge.id); createOrderMutation.mutate(badge.id); }}
                                  disabled={(createOrderMutation.isPending && payingFor === badge.id) || !config?.configured}
                                  className="w-full text-sm font-semibold h-11"
                                  style={{ background: badge.color, color: "white" }}
                                  data-testid={`button-pay-${badge.id}`}
                                >
                                  {createOrderMutation.isPending && payingFor === badge.id ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                  ) : !config?.configured ? "Payment Not Yet Available"
                                    : <>Pay {badge.price.split("/")[0].trim()} via UPI</>}
                                </Button>
                                {config?.configured && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <img src="https://razorpay.com/favicon.ico" className="h-3 w-3" alt="" />
                                    <span className="text-[11px]" style={{ color: "#4B5563" }}>Secured by Razorpay · UPI, Cards, Net Banking</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* How it works — mobile */}
            <div className="rounded-2xl p-4 mt-1" style={{ background: SURFACE2, border: "1px solid #1A201A" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "#4B5563" }}>HOW VERIFICATION WORKS</p>
              <div className="space-y-3">
                {[
                  { n: "1", t: "Choose your badge", d: "Select the tier that fits your account type and goals." },
                  { n: "2", t: "Complete the process", d: "Pay via UPI, submit documents, or meet criteria — based on badge type." },
                  { n: "3", t: "Badge goes live", d: "Your badge appears on your profile and all posts instantly." },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }}>
                      {n}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{t}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#4B5563" }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP LAYOUT: sidebar tabs + panel ── */}
          <div className="hidden md:flex gap-4">
            {/* Left sidebar tabs */}
            <div className="flex flex-col gap-1 w-52 flex-shrink-0">
              {BADGES.map(badge => {
                const isActive = activeTab === badge.id;
                const hasThisBadge = activeBadge === badge.id;
                return (
                  <button
                    key={badge.id}
                    onClick={() => setActiveTab(badge.id)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full")}
                    style={{
                      background: isActive ? badge.glow : "transparent",
                      border: isActive ? `1px solid ${badge.border}` : "1px solid transparent",
                      color: isActive ? badge.color : "#6B7280",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#151A14"; e.currentTarget.style.color = "#9CA3AF"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; } }}
                    data-testid={`tab-badge-${badge.id}`}
                  >
                    <BadgeCircle color={badge.color} glow={badge.glow} size={22} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{badge.label}</div>
                      <div className="text-[10px]" style={{ color: isActive ? badge.color + "99" : "#4B5563" }}>{badge.price}</div>
                    </div>
                    {hasThisBadge && <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: badge.color }} />}
                  </button>
                );
              })}
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0">
              {BADGES.filter(b => b.id === activeTab).map(badge => {
                const Icon = badge.icon;
                const hasThisBadge = activeBadge === badge.id;
                const isExpired = hasThisBadge && (user as any)?.verificationExpiry && new Date((user as any).verificationExpiry) < new Date();

                return (
                  <div
                    key={badge.id}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: SURFACE, border: `1px solid ${badge.border}` }}
                  >
                    {/* Badge header */}
                    <div
                      className="p-5 pb-4"
                      style={{ background: `linear-gradient(135deg, ${badge.glow.replace("0.35", "0.12")} 0%, transparent 100%)` }}
                    >
                      <div className="flex items-start gap-4">
                        <BadgeCircle color={badge.color} glow={badge.glow} size={52} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-bold text-white">{badge.label}</h2>
                            {hasThisBadge && !isExpired && <StatusPill status="active" />}
                            {isExpired && <StatusPill status="expired" />}
                            {!hasThisBadge && badge.type === "student" && (user as any)?.studentStatus !== "none" && (
                              <StatusPill status={(user as any)?.studentStatus || "none"} />
                            )}
                            {!hasThisBadge && badge.type === "admin" && (user as any)?.kycStatus === "pending" && (
                              <StatusPill status="pending" />
                            )}
                          </div>
                          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{badge.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold" style={{ color: badge.color }}>{badge.price.split("/")[0].trim()}</div>
                          {badge.price.includes("/") && (
                            <div className="text-[11px]" style={{ color: "#4B5563" }}>/ {badge.price.split("/")[1].trim()}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Features */}
                      <div>
                        <p className="text-xs font-semibold mb-3" style={{ color: "#4B5563" }}>WHAT YOU GET</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {badge.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "#9CA3AF" }}>
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: badge.color }} />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action section */}
                      <div className="pt-4" style={{ borderTop: "1px solid #1F2920" }}>
                        {badge.type === "earned" && <EmeraldTracker />}
                        {badge.type === "student" && <StudentForm user={user} onSuccess={() => {}} />}
                        {badge.type === "admin" && <GoldRequest user={user} />}

                        {(badge.type === "paid" || badge.type === "subscription") && (
                          <div className="space-y-3">
                            {hasThisBadge && !isExpired ? (
                              <div>
                                {(user as any)?.verificationExpiry && (
                                  <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#6B7280" }}>
                                    <Clock className="h-3.5 w-3.5" />
                                    Valid until {new Date((user as any).verificationExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                  </div>
                                )}
                                <Button
                                  onClick={() => { setPayingFor(badge.id); createOrderMutation.mutate(badge.id); }}
                                  disabled={createOrderMutation.isPending || !config?.configured}
                                  className="w-full text-sm font-semibold"
                                  style={{ background: badge.color + "20", color: badge.color, border: `1px solid ${badge.color}44` }}
                                  data-testid={`button-renew-${badge.id}`}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Renew {badge.label}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm p-4 rounded-xl" style={{ background: "#0C0F0A", border: "1px solid #1F2920" }}>
                                  <div>
                                    <p className="font-semibold text-white">{badge.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>{badge.period} · Auto-renews</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg" style={{ color: badge.color }}>{badge.price.split("/")[0].trim()}</p>
                                    <p className="text-[11px]" style={{ color: "#4B5563" }}>incl. GST</p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => { setPayingFor(badge.id); createOrderMutation.mutate(badge.id); }}
                                  disabled={createOrderMutation.isPending && payingFor === badge.id || !config?.configured}
                                  className="w-full text-sm font-semibold h-11"
                                  style={{ background: badge.color, color: "white" }}
                                  data-testid={`button-pay-${badge.id}`}
                                >
                                  {createOrderMutation.isPending && payingFor === badge.id ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                  ) : !config?.configured ? (
                                    "Payment Not Yet Available"
                                  ) : (
                                    <>Pay {badge.price.split("/")[0].trim()} via UPI</>
                                  )}
                                </Button>
                                {config?.configured && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <img src="https://razorpay.com/favicon.ico" className="h-3 w-3" alt="" />
                                    <span className="text-[11px]" style={{ color: "#4B5563" }}>Secured by Razorpay · UPI, Cards, Net Banking</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* How it works */}
              <div
                className="rounded-2xl p-5 mt-4"
                style={{ background: SURFACE2, border: "1px solid #1A201A" }}
              >
                <p className="text-xs font-semibold mb-4" style={{ color: "#4B5563" }}>HOW VERIFICATION WORKS</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { n: "1", t: "Choose your badge", d: "Select the tier that fits your account type and goals." },
                    { n: "2", t: "Complete the process", d: "Pay via UPI, submit documents, or meet criteria — based on badge type." },
                    { n: "3", t: "Badge goes live", d: "Your badge appears on your profile and all posts instantly." },
                  ].map(({ n, t, d }) => (
                    <div key={n} className="flex gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }}
                      >
                        {n}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{t}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#4B5563" }}>{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
