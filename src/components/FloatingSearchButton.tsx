// src/components/FloatingSearchButton.tsx
"use client";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function FloatingSearchButton({ onClick }: { onClick: () => void }) {
  const [hidden, setHidden] = useState(false);

  // スクロール・タッチなどで自動フェード
  useEffect(() => {
    let lastScroll = window.scrollY;
    let timeout: number | null = null;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastScroll) > 12) {
        setHidden(true);
        if (timeout !== null) clearTimeout(timeout);
        timeout = window.setTimeout(() => setHidden(false), 1100);
        lastScroll = window.scrollY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeout !== null) clearTimeout(timeout);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      aria-label="検索"
      className={`
        fixed z-[99] right-5 bottom-5 md:right-9 md:bottom-9
        w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-700
        shadow-xl border-4 border-white/80 flex flex-col items-center justify-center
        text-white group transition-all
        hover:scale-110 active:scale-95
        backdrop-blur-lg
        ${hidden ? "opacity-20 pointer-events-none" : "opacity-100"}
        md:block lg:block
      `}
      style={{
        transition: "opacity 0.45s cubic-bezier(.44,.18,.26,.99)",
      }}
    >
      <FaSearch size={34} className="mb-1 drop-shadow animate-pulse group-hover:animate-none" />
      <span className="text-xs font-semibold tracking-wide">検索</span>
      {/* Glow/波紋アニメはCSSで実装可 */}
      <style jsx>{`
        button:active::after {
          content: "";
          position: absolute;
          left: 50%; top: 50%;
          width: 130%; height: 130%;
          transform: translate(-50%, -50%) scale(1);
          background: radial-gradient(rgba(255,255,255,0.12) 50%, transparent 80%);
          border-radius: 50%;
          pointer-events: none;
          animation: ripple-effect 0.43s linear;
        }
        @keyframes ripple-effect {
          0% { opacity: 0.7; transform: scale(0.85);}
          90% { opacity: 0.05;}
          100% { opacity: 0; transform: scale(1.32);}
        }
      `}</style>
    </button>
  );
}
