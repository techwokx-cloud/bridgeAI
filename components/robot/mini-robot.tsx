"use client";

import { useState, useEffect } from "react";

interface MiniRobotProps {
  state?: "idle" | "listening" | "thinking" | "speaking" | "happy";
  size?: "sm" | "md" | "lg";
  showExpression?: boolean;
  /** Optional emotion-driven expression, layered on top of `state` for idle/thinking. */
  emotion?: "neutral" | "warm" | "concerned" | "curious";
  /** One-time wake pulse — set true when Bridge is the one initiating (e.g. the dashboard "noticed something" card), so it visually reads as "waking up to tell you something" rather than a plain static portrait. */
  wake?: boolean;
}

export function MiniRobot({
  state = "idle",
  size = "md",
  showExpression = true,
  emotion = "neutral",
  wake = false,
}: MiniRobotProps) {
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-44 h-44",
  };

  const bodyAnimation =
    state === "speaking"
      ? "robotBounce 0.6s ease-in-out infinite"
      : state === "listening"
        ? "robotListening 1s ease-in-out infinite"
        : state === "thinking"
          ? "robotThinking 2.4s ease-in-out infinite"
          : "robotFloat 3s ease-in-out infinite";

  return (
    <div
      className={`${sizeMap[size]} relative flex items-center justify-center`}
      style={{ animation: bodyAnimation }}
    >
      {wake && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            animation: "robotWake 1.8s ease-out 2",
            border: "2px solid #78d8d5",
          }}
        />
      )}
      <style>{`
        @keyframes robotFloat {
          0% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(3px, -6px) rotate(1deg);
          }
          50% {
            transform: translate(0px, -10px) rotate(0deg);
          }
          75% {
            transform: translate(-3px, -6px) rotate(-1deg);
          }
          100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
        }

        @keyframes robotThinking {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-4px) rotate(3deg);
          }
        }

        @keyframes robotWake {
          0% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes robotBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes robotListening {
          0%, 100% {
            transform: rotateZ(0deg);
          }
          25% {
            transform: rotateZ(-5deg);
          }
          75% {
            transform: rotateZ(5deg);
          }
        }

        @keyframes robotPulse {
          0%, 100% {
            r: 6;
            filter: drop-shadow(0 0 8px rgba(40, 184, 196, 0.6));
          }
          50% {
            r: 8;
            filter: drop-shadow(0 0 15px rgba(40, 184, 196, 0.9));
          }
        }

        @keyframes miniBlink {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes miniWave {
          0%, 100% {
            transform: rotate(0deg);
          }
          15% {
            transform: rotate(-18deg);
          }
          30% {
            transform: rotate(10deg);
          }
          45% {
            transform: rotate(-18deg);
          }
          60%, 100% {
            transform: rotate(0deg);
          }
        }

        .chest-light-mini {
          animation: robotPulse 1.5s ease-in-out infinite;
        }

        .mini-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: miniBlink 4.5s ease-in-out infinite;
        }

        .mini-arm-right {
          transform-box: fill-box;
          transform-origin: top center;
          animation: miniWave 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      <svg
        viewBox="0 0 80 100"
        className="w-full h-full"
        style={{
          filter: "drop-shadow(0 8px 12px rgba(99, 70, 160, 0.15))",
        }}
      >
        <defs>
          <linearGradient
            id="miniHeadGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e9e4f1" />
          </linearGradient>
          <linearGradient
            id="miniBodyGrad"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f7f4fa" />
            <stop offset="100%" stopColor="#e9e4f1" />
          </linearGradient>
        </defs>

        {/* Head */}
        <rect
          x="20"
          y="8"
          width="40"
          height="28"
          rx="8"
          fill="url(#miniHeadGrad)"
          stroke="#d9d1e6"
          strokeWidth="1"
        />

        {/* Antenna */}
        <line
          x1="40"
          y1="4"
          x2="40"
          y2="10"
          stroke="#7a58cc"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="3" r="2.5" fill="#b96fe1" />

        {/* Face screen */}
        <rect
          x="24"
          y="12"
          width="32"
          height="18"
          rx="6"
          fill="#322a4b"
        />

        {/* Eyes */}
        <circle className="mini-eye" cx="32" cy="18" r="2.5" fill="#c99af1" />
        <circle className="mini-eye" cx="48" cy="18" r="2.5" fill="#c99af1" />

        {/* Eye shine */}
        <circle cx="32" cy="17.5" r="0.8" fill="#ffffff" opacity="0.7" />
        <circle cx="48" cy="17.5" r="0.8" fill="#ffffff" opacity="0.7" />

        {/* Mouth - changes based on state */}
        {state === "speaking" && (
          <>
            <ellipse cx="40" cy="26" rx="1.5" ry="2" fill="#c99af1" />
          </>
        )}
        {state === "listening" && (
          <path
            d="M 36 26 Q 40 28 44 26"
            stroke="#c99af1"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {state === "happy" && (
          <path
            d="M 36 25 Q 40 27 44 25"
            stroke="#c99af1"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {(state === "idle" || state === "thinking") && emotion === "neutral" && (
          <path
            d="M 36 26 L 44 26"
            stroke="#c99af1"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )}
        {(state === "idle" || state === "thinking") && emotion === "warm" && (
          <path
            d="M 35 25 Q 40 28 45 25"
            stroke="#c99af1"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {(state === "idle" || state === "thinking") && emotion === "concerned" && (
          <path
            d="M 35 27 Q 40 25 45 27"
            stroke="#c99af1"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {(state === "idle" || state === "thinking") && emotion === "curious" && (
          <path
            d="M 36 25.5 Q 40 27 45 25"
            stroke="#c99af1"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Body */}
        <rect
          x="24"
          y="38"
          width="32"
          height="32"
          rx="8"
          fill="url(#miniBodyGrad)"
          stroke="#d0c7df"
          strokeWidth="1"
        />

        {/* Chest light */}
        {showExpression && (
          <circle
            cx="40"
            cy="50"
            r="6"
            fill="#78d8d5"
            className="chest-light-mini"
          />
        )}

        {/* Arms - simple */}
        <rect
          x="18"
          y="44"
          width="4"
          height="16"
          rx="2"
          fill="#e2dbea"
          stroke="#cec4dd"
          strokeWidth="0.5"
        />
        <rect
          className="mini-arm-right"
          x="58"
          y="44"
          width="4"
          height="16"
          rx="2"
          fill="#e2dbea"
          stroke="#cec4dd"
          strokeWidth="0.5"
        />

        {/* Legs */}
        <rect
          x="28"
          y="72"
          width="6"
          height="12"
          rx="3"
          fill="#e2dbea"
          stroke="#cec4dd"
          strokeWidth="0.5"
        />
        <rect
          x="46"
          y="72"
          width="6"
          height="12"
          rx="3"
          fill="#e2dbea"
          stroke="#cec4dd"
          strokeWidth="0.5"
        />

        {/* Feet */}
        <ellipse cx="31" cy="85" rx="3" ry="2" fill="#d0c7df" />
        <ellipse cx="49" cy="85" rx="3" ry="2" fill="#d0c7df" />
      </svg>
    </div>
  );
}
