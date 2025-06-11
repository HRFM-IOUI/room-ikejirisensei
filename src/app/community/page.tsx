"use client";
import React, { useState, useEffect } from "react";
import CommunitySidebar from "../../components/community/CommunitySidebar";
import RoomList from "../../components/community/RoomList";
import ChatRoom from "../../components/community/ChatRoom";

// モバイル判定フック
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 620);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function CommunityPage() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [showList, setShowList] = useState(true); // モバイル時トグル用

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f4fcff 0%, #e7e8ff 100%)"
    }}>
      {!isMobile && <CommunitySidebar />}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f7fafd"
      }}>
        {isMobile && showList && (
          <>
            <CommunitySidebar />
            <RoomList
              activeRoomId={activeRoomId}
              setActiveRoomId={id => {
                setActiveRoomId(id);
                setShowList(false);
              }}
            />
          </>
        )}
        {isMobile && !showList && activeRoomId && (
          <>
            <button
              onClick={() => setShowList(true)}
              style={{
                margin: "16px 0 0 18px",
                padding: "5px 14px",
                borderRadius: 9,
                background: "#e8f4ff",
                border: "1.3px solid #b7dffd",
                color: "#2294cb",
                fontWeight: 700,
                fontSize: 15,
                boxShadow: "0 1px 7px #bde5ff11"
              }}
            >← ルーム一覧へ</button>
            <ChatRoom roomId={activeRoomId} />
          </>
        )}
        {!isMobile && (
          <>
            <RoomList
              activeRoomId={activeRoomId}
              setActiveRoomId={setActiveRoomId}
            />
            {activeRoomId ? (
              <ChatRoom roomId={activeRoomId} />
            ) : (
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#c8d7ec", fontSize: 22, fontWeight: 700
              }}>
                ルームを選択してください
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
