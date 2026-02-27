import { ExternalLink } from "lucide-react";
import type { AdItem } from "@/lib/ad-data";

export function AdCard({ ad }: { ad: AdItem }) {
  return (
    <article
      data-testid={`ad-card-${ad.id}`}
      className="border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: ad.brandColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                letterSpacing: "0.02em",
              }}
              aria-hidden="true"
            >
              {ad.brandInitials}
            </div>
            <div>
              <p
                style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2 }}
                data-testid={`ad-brand-name-${ad.id}`}
              >
                {ad.brandName}
              </p>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "1px" }}>
                @{ad.brandHandle}
              </p>
            </div>
          </div>

          <span
            data-testid={`ad-sponsored-label-${ad.id}`}
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#F5B041",
              background: "rgba(245,176,65,0.08)",
              border: "1px solid rgba(245,176,65,0.18)",
              borderRadius: "6px",
              padding: "3px 8px",
              flexShrink: 0,
              letterSpacing: "0.03em",
            }}
          >
            Sponsored
          </span>
        </div>

        <p
          style={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--foreground)",
            marginBottom: ad.ctaLabel ? "16px" : "0",
          }}
          data-testid={`ad-content-${ad.id}`}
        >
          {ad.content}
        </p>

        {ad.ctaLabel && (
          <a
            href={ad.ctaUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`ad-cta-${ad.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#F5B041",
              color: "#0A0A0A",
              borderRadius: "20px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {ad.ctaLabel}
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}
