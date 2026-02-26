import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserBadgeProps {
  badgeType?: string | null;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const BADGE_CONFIG: Record<string, {
  color: string;
  glow: string;
  label: string;
  description: string;
}> = {
  blue: {
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.6)",
    label: "Identity Verified",
    description: "This account has completed identity verification on FreeFinity India",
  },
  verified: {
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.6)",
    label: "Identity Verified",
    description: "This account has completed identity verification on FreeFinity India",
  },
  gold: {
    color: "#D4AF37",
    glow: "rgba(212,175,55,0.6)",
    label: "High Authority",
    description: "Exclusively assigned to high-authority accounts by FreeFinity India",
  },
  creator: {
    color: "#D4AF37",
    glow: "rgba(212,175,55,0.6)",
    label: "Creator",
    description: "Official creator account on FreeFinity India",
  },
  emerald: {
    color: "#138808",
    glow: "rgba(19,136,8,0.6)",
    label: "Regional Leader",
    description: "Recognized regional leader with strong community presence",
  },
  official: {
    color: "#138808",
    glow: "rgba(19,136,8,0.6)",
    label: "Official",
    description: "Official account on FreeFinity India",
  },
  purple: {
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.6)",
    label: "Monetized Creator",
    description: "Active monetized creator with revenue access on FreeFinity India",
  },
  indigo: {
    color: "#6366F1",
    glow: "rgba(99,102,241,0.6)",
    label: "Student Verified",
    description: "Verified student account with campus access",
  },
  partner: {
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.6)",
    label: "Partner",
    description: "Verified partner of FreeFinity India",
  },
};

const SIZE_PX: Record<string, number> = { sm: 14, md: 16, lg: 20 };

function BadgeSVG({ color, glow, px, hover = false }: { color: string; glow: string; px: number; hover?: boolean }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 0 3px ${glow})`,
        transition: "filter 0.2s ease, transform 0.2s ease",
        flexShrink: 0,
      }}
    >
      <defs>
        <radialGradient id={`g-${color.replace("#", "")}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <circle
        cx="10"
        cy="10"
        r="9.5"
        fill={`url(#g-${color.replace("#", "")})`}
        stroke={color}
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      <circle cx="10" cy="10" r="9" fill="none" stroke="white" strokeWidth="0.3" strokeOpacity="0.15" />
      <polyline
        points="6.5,10.2 9,12.7 13.5,7.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserBadge({ badgeType, verified, size = "md", showTooltip = true }: UserBadgeProps) {
  const effectiveBadge = badgeType && badgeType !== "none" ? badgeType : (verified ? "blue" : null);
  if (!effectiveBadge) return null;

  const config = BADGE_CONFIG[effectiveBadge];
  if (!config) return null;

  const px = SIZE_PX[size];
  const iconEl = (
    <span className="inline-flex items-center" style={{ cursor: showTooltip ? "help" : "default" }}>
      <BadgeSVG color={config.color} glow={config.glow} px={px} />
    </span>
  );

  if (!showTooltip) return iconEl;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{iconEl}</TooltipTrigger>
      <TooltipContent
        className="border text-white text-xs max-w-[200px] p-2.5"
        style={{ background: "#151A14", borderColor: config.color + "44" }}
      >
        <div className="font-semibold mb-0.5" style={{ color: config.color }}>{config.label}</div>
        <div className="text-zinc-400 text-[11px] leading-relaxed">{config.description}</div>
      </TooltipContent>
    </Tooltip>
  );
}
