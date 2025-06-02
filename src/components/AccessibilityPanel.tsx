import React from "react";

const MENU_WIDTH = 260;    // px
const MENU_HEIGHT = 160;   // ←ここを増やす（180でも可）

type Props = {
  className?: string;
};

export default function AccessibilityPanel({ className = "" }: Props) {
  return (
    <aside
      className={`shadow-2xl ${className}`}
      style={{
        width: `${MENU_WIDTH}px`,
        height: `${MENU_HEIGHT}px`,
        background: "linear-gradient(135deg,#1e275a 0%,#192349 60%,#1e275a 100%)",
        color: "#fff",
        borderRadius: `${MENU_HEIGHT / 2}px / ${MENU_WIDTH / 2}px`,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 0,
      }}
      aria-label="アクセシビリティ設定"
    >
      <div className="w-full flex flex-col items-center justify-center px-5">
        <div className="font-bold mb-2 mt-2 text-base">アクセシビリティ</div>
        <div className="mb-1 text-xs">文字サイズ</div>
        <div className="flex gap-2 mb-2">
          <button className="rounded bg-white text-[#17223a] px-3 py-1 font-bold border">大</button>
          <button className="rounded bg-[#26365c] px-3 py-1">中</button>
          <button className="rounded bg-[#26365c] px-3 py-1">小</button>
        </div>
        <div className="mb-1 text-xs">配色変更</div>
        <div className="flex gap-2">
          <button className="rounded bg-white text-[#17223a] px-3 py-1 border">通常</button>
          <button className="rounded bg-[#eee] text-[#17223a] px-3 py-1">ライト</button>
          <button className="rounded bg-[#232c34] text-white px-3 py-1">ダーク</button>
        </div>
      </div>
    </aside>
  );
}
