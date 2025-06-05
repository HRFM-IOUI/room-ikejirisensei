import React from "react";

type Props = {
  onClick: () => void;
  position?: "left" | "right";
};

const EditorControlButton: React.FC<Props> = ({
  onClick,
  position = "right", // デフォルト右下
}) => {
  // メディアクエリでモバイル判定
  const isMobile =
    typeof window !== "undefined" && window.innerWidth <= 600;
  const size = isMobile ? 54 : 70;
  const offset = isMobile ? 14 : 44;

  const posStyle =
    position === "right"
      ? { right: offset, left: "auto" }
      : { left: offset, right: "auto" };

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: offset,
        ...posStyle,
        zIndex: 2050,
        width: size,
        height: size,
        background: "linear-gradient(145deg,#2851ec 80%,#5b8dee 100%)",
        border: "3px solid #fff",
        borderRadius: "50%",
        boxShadow: "0 8px 32px 0 rgba(56,96,255,0.16), 0 2px 12px #5b8dee80",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        outline: "none",
        transition: "box-shadow 0.15s, transform 0.14s",
        color: "#fff",
        animation: "pulse 1.8s infinite cubic-bezier(0.4,0,0.6,1)",
        touchAction: "manipulation",
      }}
      aria-label="エディタ設定"
      tabIndex={0}
      onMouseDown={e => e.preventDefault()}
    >
      {/* ギアアイコン */}
      <svg width={isMobile ? 28 : 38} height={isMobile ? 28 : 38} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="11" stroke="#fff" strokeWidth="2.5" fill="#5b8dee"/>
        <path
          d="M20 11.2v-3.4M20 32.2v-3.4M11.2 20h-3.4M32.2 20h-3.4M14.3 14.3l-2.4-2.4M28.1 28.1l-2.4-2.4M25.7 14.3l2.4-2.4M11.9 28.1l2.4-2.4"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>
      <style>
        {`
        @keyframes pulse {
          0% { box-shadow: 0 8px 32px 0 rgba(56,96,255,0.17), 0 2px 12px #5b8dee80; }
          70% { box-shadow: 0 0 0 20px rgba(91,141,238,0.12), 0 8px 32px 0 rgba(56,96,255,0.13);}
          100% { box-shadow: 0 8px 32px 0 rgba(56,96,255,0.17), 0 2px 12px #5b8dee80; }
        }
        `}
      </style>
    </button>
  );
};

export default EditorControlButton;
