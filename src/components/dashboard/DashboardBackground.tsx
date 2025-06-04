// src/components/dashboard/DashboardBackground.tsx
import React from "react";

export default function DashboardBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        background: "#18181a", // Vercel風の黒
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        {/* 縦線 */}
        {[...Array(24)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={`${(i * 100) / 24}%`}
            y1="0"
            x2={`${(i * 100) / 24}%`}
            y2="100%"
            stroke="#fff"
            strokeOpacity={0.09}
            strokeWidth="1"
          />
        ))}
        {/* 横線 */}
        {[...Array(16)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={`${(i * 100) / 16}%`}
            x2="100%"
            y2={`${(i * 100) / 16}%`}
            stroke="#fff"
            strokeOpacity={0.09}
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
