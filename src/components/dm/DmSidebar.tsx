"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function DmSidebar({
  unreadCount = 0 // 親コンポーネントやhookから未読DM合計を渡す
}: { unreadCount?: number }) {
  const router = useRouter();

  return (
    <aside style={{
      width: 228,
      minWidth: 188,
      background: "linear-gradient(140deg, #e6f0ff 0%, #eef5ff 100%)",
      boxShadow: "4px 0 32px #1a6ed80b",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "38px 12px 28px 0"
    }}>
      <div style={{
        width: "100%",
        marginBottom: 32,
        paddingLeft: 26,
        fontSize: 20,
        fontWeight: 900,
        color: "#2294cb"
      }}>DM Menu</div>
      <MenuButton
        text="スレッド一覧"
        onClick={() => {}}
        active
        badge={unreadCount > 0 ? unreadCount : undefined}
      />
      <MenuButton text="フレンドリスト" onClick={() => router.push("/friends")} />
      <MenuButton text="マイプロフィール" onClick={() => router.push("/profile")} />
      <MenuButton text="トップページへ" onClick={() => router.push("/")} />
      <MenuButton text="ログアウト" onClick={() => router.push("/logout")} />
    </aside>
  );
}

function MenuButton({
  text, onClick, active, badge
}: { text: string, onClick: () => void, active?: boolean, badge?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "94%",
        margin: "0 0 12px 6px",
        padding: "14px 0",
        textAlign: "left",
        borderRadius: 10,
        fontWeight: active ? 800 : 600,
        fontSize: 16,
        color: active ? "#2471c7" : "#434366",
        background: active ? "#eaf3ff" : "#fff",
        border: active ? "2.2px solid #65bbf4" : "1.5px solid #dde8fb",
        boxShadow: active ? "0 2px 12px #5bc3fa22" : undefined,
        cursor: "pointer",
        position: "relative"
      }}
    >
      {text}
      {badge !== undefined && (
        <span style={{
          position: "absolute", right: 22, top: 13,
          minWidth: 22, padding: "2px 8px",
          background: "#ff5252", color: "#fff", borderRadius: 11,
          fontWeight: 900, fontSize: 13, textAlign: "center"
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
