"use client";

import { useState, useEffect } from "react";

// Waypoints the robot drifts between, as percentages of its container.
// Kept within a safe band so the robot never clips the container edges.
const ROAM_WAYPOINTS = [
  { x: 50, y: 45 },
  { x: 25, y: 30 },
  { x: 70, y: 55 },
  { x: 40, y: 65 },
  { x: 62, y: 25 },
];

export function AnimatedRobot() {
  const [scrollY, setScrollY] = useState(0);
  const [robotState, setRobotState] = useState<
    "idle" | "hover" | "fly" | "jump" | "wave"
  >("hover");
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [waypointIndex, setWaypointIndex] = useState(0);

  // Drift to a new position every few seconds — this is what makes the
  // robot roam around the hero area rather than just posing in place.
  useEffect(() => {
    const interval = setInterval(() => {
      setWaypointIndex((i) => (i + 1) % ROAM_WAYPOINTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const position = ROAM_WAYPOINTS[waypointIndex];

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track mouse for robot follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Change robot state periodically
  useEffect(() => {
    const states: typeof robotState[] = ["hover", "wave", "fly", "jump"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setRobotState(states[currentIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[520px] w-full min-w-[320px]">
      <div
        className="absolute flex items-center justify-center transition-[left,top] duration-[3500ms] ease-in-out"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
      <style>{`
        @keyframes robotHover {
          0%, 100% {
            transform: translateY(0px) rotateZ(-2deg);
          }
          50% {
            transform: translateY(-20px) rotateZ(2deg);
          }
        }

        @keyframes robotFly {
          0% {
            transform: translateX(-100px) translateY(0) rotateZ(-15deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
            transform: translateX(0) translateY(-40px) rotateZ(-5deg);
          }
          50% {
            transform: translateX(50px) translateY(-80px) rotateZ(5deg);
          }
          75% {
            transform: translateX(0) translateY(-40px) rotateZ(-5deg);
          }
          100% {
            transform: translateX(-100px) translateY(0) rotateZ(-15deg);
            opacity: 0;
          }
        }

        @keyframes robotJump {
          0% {
            transform: translateY(0) scaleY(1);
          }
          25% {
            transform: translateY(-80px) scaleY(0.9);
          }
          50% {
            transform: translateY(-100px) scaleY(0.85);
          }
          75% {
            transform: translateY(-40px) scaleY(1.05);
          }
          100% {
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes robotWave {
          0% {
            transform: rotateZ(0deg);
          }
          10% {
            transform: rotateZ(-25deg);
          }
          20% {
            transform: rotateZ(0deg);
          }
          30% {
            transform: rotateZ(-25deg);
          }
          40% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(0deg);
          }
        }

        @keyframes robotEyesHappy {
          0%, 100% {
            cy: 48;
          }
          50% {
            cy: 50;
          }
        }

        @keyframes robotEyesBlink {
          0%, 49%, 100% {
            ry: 6;
          }
          50%, 51% {
            ry: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(201, 154, 241, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(201, 154, 241, 0.9));
          }
        }

        @keyframes chestLightPulse {
          0%, 100% {
            r: 8;
            filter: drop-shadow(0 0 12px rgba(40, 184, 196, 0.6));
          }
          50% {
            r: 10;
            filter: drop-shadow(0 0 20px rgba(40, 184, 196, 0.9));
          }
        }

        .robot-hover {
          animation: robotHover 3s ease-in-out infinite;
        }

        .robot-fly {
          animation: robotFly 2s ease-in-out infinite;
        }

        .robot-jump {
          animation: robotJump 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .robot-wave {
          transform-origin: 100px 80px;
          animation: robotWave 1s ease-in-out;
          animation-fill-mode: forwards;
        }

        .robot-svg {
          animation: glow 2s ease-in-out infinite;
          filter: drop-shadow(0 30px 40px rgba(99, 70, 160, 0.2));
        }

        .chest-light {
          animation: chestLightPulse 2s ease-in-out infinite;
        }

        .robot-eyes {
          animation: robotEyesBlink 4s steps(1, end) infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 200 240"
        className={`h-[26rem] w-[21rem] robot-svg ${
          robotState === "hover"
            ? "robot-hover"
            : robotState === "fly"
              ? "robot-fly"
              : robotState === "jump"
                ? "robot-jump"
                : robotState === "wave"
                  ? "robot-wave"
                  : ""
        }`}
      >
        {/* Antenna with glow */}
        <defs>
          <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b96fe1" />
            <stop offset="100%" stopColor="#7a58cc" />
          </linearGradient>

          <linearGradient
            id="headGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f5f1ff" />
            <stop offset="100%" stopColor="#e9e4f1" />
          </linearGradient>

          <linearGradient
            id="bodyGrad"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f7f4fa" />
            <stop offset="100%" stopColor="#e9e4f1" />
          </linearGradient>

          <filter id="robotGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Antenna */}
        <line
          x1="100"
          y1="10"
          x2="100"
          y2="25"
          stroke="url(#antennaGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="8"
          r="5"
          fill="#b96fe1"
          filter="url(#robotGlow)"
        />

        {/* Head */}
        <rect
          x="70"
          y="30"
          width="60"
          height="45"
          rx="15"
          fill="url(#headGrad)"
          stroke="#d9d1e6"
          strokeWidth="2"
        />

        {/* Ears */}
        <ellipse cx="65" cy="45" rx="6" ry="15" fill="#cab9e6" />
        <ellipse cx="135" cy="45" rx="6" ry="15" fill="#cab9e6" />

        {/* Face screen - darker background */}
        <rect
          x="75"
          y="38"
          width="50"
          height="35"
          rx="10"
          fill="#322a4b"
        />

        {/* Eyes - blink animation */}
        <ellipse
          cx="90"
          cy="48"
          rx="4"
          ry="6"
          fill="#c99af1"
          className="robot-eyes"
          filter="url(#robotGlow)"
        />
        <ellipse
          cx="110"
          cy="48"
          rx="4"
          ry="6"
          fill="#c99af1"
          className="robot-eyes"
          filter="url(#robotGlow)"
        />

        {/* Eye shine */}
        <circle cx="90" cy="47" r="1.5" fill="#ffffff" opacity="0.8" />
        <circle cx="110" cy="47" r="1.5" fill="#ffffff" opacity="0.8" />

        {/* Mouth - changes based on state */}
        {robotState === "wave" && (
          <path
            d="M 95 58 Q 100 61 105 58"
            stroke="#c99af1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {robotState === "fly" && (
          <>
            <circle cx="100" cy="58" r="2" fill="#c99af1" />
            <circle cx="95" cy="60" r="1.5" fill="#c99af1" />
            <circle cx="105" cy="60" r="1.5" fill="#c99af1" />
          </>
        )}
        {robotState === "jump" && (
          <path
            d="M 95 60 Q 100 63 105 60"
            stroke="#c99af1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {(robotState === "idle" || robotState === "hover") && (
          <path
            d="M 95 57 Q 100 59 105 57"
            stroke="#c99af1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Body */}
        <rect
          x="80"
          y="82"
          width="40"
          height="42"
          rx="12"
          fill="url(#bodyGrad)"
          stroke="#d0c7df"
          strokeWidth="2"
        />

        {/* Chest light - pulsing */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill="#78d8d5"
          className="chest-light"
        />

        {/* Arms - raised for wave */}
        <g
          style={{
            transformOrigin: "69px 90px",
            animation:
              robotState === "wave"
                ? "robotWave 1s ease-in-out"
                : "none",
          }}
        >
          <rect
            x="65"
            y="90"
            width="8"
            height="28"
            rx="4"
            fill="#e2dbea"
            stroke="#cec4dd"
            strokeWidth="1"
          />
        </g>

        <g
          style={{
            transformOrigin: "131px 90px",
            animation:
              robotState === "wave"
                ? "robotWave 1s ease-in-out 0.1s"
                : "none",
          }}
        >
          <rect
            x="127"
            y="90"
            width="8"
            height="28"
            rx="4"
            fill="#e2dbea"
            stroke="#cec4dd"
            strokeWidth="1"
          />
        </g>

        {/* Legs - bounce on jump */}
        <g
          style={{
            animation: robotState === "jump" ? "robotJump 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite" : "none",
            transformOrigin: "100px 130px",
          }}
        >
          <rect
            x="85"
            y="130"
            width="10"
            height="30"
            rx="5"
            fill="#e2dbea"
            stroke="#cec4dd"
            strokeWidth="1"
          />
          <rect
            x="105"
            y="130"
            width="10"
            height="30"
            rx="5"
            fill="#e2dbea"
            stroke="#cec4dd"
            strokeWidth="1"
          />

          {/* Feet */}
          <ellipse cx="90" cy="162" rx="6" ry="4" fill="#d0c7df" />
          <ellipse cx="110" cy="162" rx="6" ry="4" fill="#d0c7df" />
        </g>

        {/* Heart badge (when wave state) */}
        {robotState === "wave" && (
          <g>
            <circle cx="125" cy="115" r="12" fill="#ff8db3" opacity="0.9" />
            <text
              x="125"
              y="120"
              textAnchor="middle"
              fontSize="16"
              fill="white"
            >
              ♡
            </text>
          </g>
        )}

        {/* Flying lines (when fly state) */}
        {robotState === "fly" && (
          <>
            <line
              x1="50"
              y1="80"
              x2="30"
              y2="85"
              stroke="#c99af1"
              strokeWidth="1"
              opacity="0.4"
              strokeDasharray="4"
            />
            <line
              x1="150"
              y1="80"
              x2="170"
              y2="85"
              stroke="#c99af1"
              strokeWidth="1"
              opacity="0.4"
              strokeDasharray="4"
            />
          </>
        )}
      </svg>

        {/* Status text follows the robot as it roams */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-sm font-medium text-[#302842] capitalize whitespace-nowrap">
            {robotState === "hover" && "Ready to help"}
            {robotState === "wave" && "Say hello!"}
            {robotState === "fly" && "Flying over..."}
            {robotState === "jump" && "Bouncing with joy"}
          </p>
        </div>
      </div>
    </div>
  );
}
