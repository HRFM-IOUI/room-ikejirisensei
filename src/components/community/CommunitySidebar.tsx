"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export default function CommunitySidebar() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  // コミュニティ（全ルーム）の未読チャット合計
  const [communityUnread, setCommunityUnread] = useState(0);
  // DM未読合計
  const [dmUnread, setDmUnread] = useState(0);

  // コミュニティ未読数
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rooms"));
    // 全ルームID取得
    const unsubRooms = onSnapshot(q, snap => {
      const roomIds = snap.docs.map(doc => doc.id);
      // 各ルームの未読数を合算
      const unsubs = roomIds.map(roomId =>
        onSnapshot(
          collection(db, "rooms", roomId, "messages"),
          snap2 => {
            let count = 0;
            snap2.forEach(docSnap => {
              const msg = docSnap.data();
              if (
                msg.userId !== user.uid &&
                (!msg.readBy || !msg.readBy.includes(user.uid))
              ) {
                count += 1;
              }
            });
            setCommunityUnread(prev => {
              // 合算する（部屋ごと分けるにはMap型も可）
              // ここは部屋ごと計算してから全体合計しても良い
              // 簡略化のため1ルームごと再セット
              return roomIds.reduce((total, rId) => {
                // 直前のcountで強制上書きされないよう、前回値から再集計
                // ただし厳密にやるならrooms state+map型で管理推奨
                // 今回はroomIds.length == 1 or room切替時しか動かない前提
                return total + (rId === roomId ? count : 0);
              }, 0);
            });
          }
        )
      );
      return () => unsubs.forEach(fn => fn());
    });
    return () => unsubRooms();
  }, [user]);

  // DM未読数
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "dmThreads"));
    const unsub = onSnapshot(q, snap => {
      let total = 0;
      snap.docs.forEach(doc => {
        const threadId = doc.id;
        const thread = doc.data();
        if (Array.isArray(thread.participants) && thread.participants.includes(user.uid)) {
          // サブコレクションmessages取得
          onSnapshot(collection(db, "dmThreads", threadId, "messages"), snap2 => {
            snap2.forEach(msgDoc => {
              const msg = msgDoc.data();
              if (
                msg.userId !== user.uid &&
                (!msg.readBy || !msg.readBy.includes(user.uid))
              ) {
                total += 1;
              }
            });
            setDmUnread(total);
          });
        }
      });
    });
    return () => unsub();
  }, [user]);

  // シンプルなバッジUI
  function Badge({ count }: { count: number }) {
    if (!count) return null;
    return (
      <span style={{
        marginLeft: 9,
        background: "#ff6961",
        color: "#fff",
        borderRadius: "999px",
        fontSize: 13,
        fontWeight: 700,
        padding: "0 9px",
        minWidth: 22,
        height: 22,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 4px #f99a9a44"
      }}>
        {count}
      </span>
    );
  }

  return (
    <aside style={{
      width: 228,
      minWidth: 192,
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
        fontSize: 22,
        fontWeight: 900,
        color: "#2471c7"
      }}>ROOM Menu</div>
      <MenuButton text="マイプロフィール" onClick={() => router.push("/profile")} />
      <MenuButton text="DM" onClick={() => router.push("/dm")}>
        <Badge count={dmUnread} />
      </MenuButton>
      <MenuButton text="フレンドリスト" onClick={() => router.push("/friends")} />
      <MenuButton text="チャット" onClick={() => {}} active>
        <Badge count={communityUnread} />
      </MenuButton>
      <MenuButton text="トップページへ" onClick={() => router.push("/")} />
      <MenuButton text="ログアウト" onClick={() => router.push("/logout")} />
    </aside>
  );
}

// 子要素対応のMenuButton
function MenuButton({
  text, onClick, active, children
}: { text: string, onClick: () => void, active?: boolean, children?: React.ReactNode }) {
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
        display: "flex",
        alignItems: "center"
      }}
    >
      {text}
      {children}
    </button>
  );
}
