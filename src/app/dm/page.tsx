"use client";
import React, { useState, useEffect } from "react";
import DmThreadList from "@/components/dm/DmThreadList";
import DmChat from "@/components/dm/DmChat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

// 簡易モバイル判定
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

export default function DmPage() {
  const [user] = useAuthState(auth);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [showList, setShowList] = useState(true); // モバイル時トグル

  if (!user) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "70vh", fontSize: 22, color: "#888"
      }}>
        ログインしてください
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f7fcff 0%, #e7f0ff 100%)"
    }}>
      {/* モバイルはトグル、PCは常時リスト＋チャット */}
      {!isMobile || showList ? (
        <div style={{ display: isMobile && !showList ? "none" : undefined, minWidth: 230 }}>
          <DmThreadList
            activeThreadId={activeThreadId}
            setActiveThreadId={id => {
              setActiveThreadId(id);
              if (isMobile) setShowList(false);
            }}
          />
        </div>
      ) : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        {/* モバイルでチャット画面なら上に戻るボタン */}
        {isMobile && !showList && (
          <button
            style={{
              position: "absolute", top: 16, left: 18, zIndex: 2,
              background: "#e7f6ff", color: "#2294cb", border: "1.3px solid #b7dffd",
              borderRadius: 9, fontWeight: 700, padding: "5px 15px", fontSize: 16, boxShadow: "0 1px 7px #bce9ff15"
            }}
            onClick={() => setShowList(true)}
          >
            ← スレッド一覧へ
          </button>
        )}
        {activeThreadId ? (
          <div style={{ marginTop: isMobile ? 45 : 0 }}>
            <DmChat threadId={activeThreadId} />
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: "#b6c8de", fontSize: 22, fontWeight: 700
          }}>
            スレッドを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
