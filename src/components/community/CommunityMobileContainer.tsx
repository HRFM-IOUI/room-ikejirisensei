// src/components/community/CommunityMobileContainer.tsx
import React, { useState } from "react";
import RoomList from "./RoomList";
import ChatRoom from "./ChatRoom";

// スマホ時は「ルーム一覧のみ or チャット画面のみ」表示
export default function CommunityMobileContainer() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // 表示状態切替
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;

  if (isMobile) {
    // モバイル時
    return (
      <div>
        {!activeRoomId ? (
          // ルーム一覧画面
          <RoomList
            activeRoomId={activeRoomId}
            setActiveRoomId={setActiveRoomId}
          />
        ) : (
          // チャット画面
          <>
            <button
              style={{
                position: "fixed", left: 12, top: 14, zIndex: 10,
                background: "#fff", border: "1.5px solid #a6d5f7", borderRadius: 8,
                fontWeight: 700, color: "#249ef1", fontSize: 15, padding: "5px 15px",
                boxShadow: "0 1px 5px #95cbf822"
              }}
              onClick={() => setActiveRoomId(null)}
            >
              ≡ ルーム一覧
            </button>
            <ChatRoom roomId={activeRoomId} />
          </>
        )}
      </div>
    );
  }

  // PC時は従来レイアウト
  return (
    <div style={{ display: "flex" }}>
      <RoomList activeRoomId={activeRoomId} setActiveRoomId={setActiveRoomId} />
      {activeRoomId && <ChatRoom roomId={activeRoomId} />}
    </div>
  );
}
