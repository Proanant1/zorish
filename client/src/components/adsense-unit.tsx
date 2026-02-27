import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: { push: (opts: object) => void }[];
  }
}

const PUBLISHER_ID = "ca-pub-5710258072475728";

interface AdSenseUnitProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  className?: string;
  adIndex?: number;
}

export function AdSenseUnit({
  slotId,
  format = "auto",
  fullWidthResponsive = true,
  className,
  adIndex = 0,
}: AdSenseUnitProps) {
  const ref = useRef<HTMLElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && ref.current) {
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
      }
    }
  }, []);

  return (
    <article
      data-testid={`adsense-unit-${adIndex}`}
      className={`border-b ${className ?? ""}`}
      style={{ borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}
    >
      <div className="px-4 py-3">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 500,
              color: "#F5B041",
              background: "rgba(245,176,65,0.08)",
              border: "1px solid rgba(245,176,65,0.16)",
              borderRadius: "5px",
              padding: "2px 7px",
              letterSpacing: "0.04em",
            }}
          >
            Ad
          </span>
        </div>
        <ins
          ref={ref as React.RefObject<HTMLModElement>}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
        />
      </div>
    </article>
  );
}
