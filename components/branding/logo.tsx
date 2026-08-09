"use client";

/**
 * Bridge mark: two nodes connected by a span, with a signal dot riding the
 * connection — reads as "autonomous link," not just "connection." This
 * replaces the old VitalityBridge heart+bridge mark now that the product
 * is Bridge, an agent that initiates rather than a life-companion chatbot.
 */
export function BridgeLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`${sizeMap[size]} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bridgeBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D5EF8" />
            <stop offset="100%" stopColor="#52D6D3" />
          </linearGradient>
          <filter id="bridgeLogoShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Badge */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#bridgeBadgeGradient)"
          filter="url(#bridgeLogoShadow)"
        />

        {/* Left node */}
        <circle cx="30" cy="58" r="7" fill="#FFFFFF" />
        {/* Right node */}
        <circle cx="70" cy="58" r="7" fill="#FFFFFF" />

        {/* Span connecting the two nodes */}
        <path
          d="M 30 58 Q 50 32 70 58"
          stroke="#FFFFFF"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Signal dot riding the span the "initiates on its own" cue */}
        <circle cx="50" cy="37" r="4.5" fill="#FF8DB3" />
      </svg>
    </div>
  );
}

export function BridgeWordmark() {
  return (
    <span className="font-serif text-xl font-semibold text-[#191533]">
      Bridge
    </span>
  );
}

export function BridgeLogotype() {
  return (
    <div className="flex items-center gap-3">
      <BridgeLogo size="md" />
      <div>
        <BridgeWordmark />
        <p className="text-xs text-[#7d748e]">An AI that doesn&apos;t wait</p>
      </div>
    </div>
  );
}

// Backward-compatible aliases so existing imports don't break mid-migration.
export const VitalityBridgeLogo = BridgeLogo;
export const VitalityBridgeWordmark = BridgeWordmark;
export const VitalityBridgeLogotype = BridgeLogotype;
