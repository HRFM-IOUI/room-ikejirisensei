"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

// 各ルームの未読数をMapで保持
function useCommunityUnread(userId: string | undefined) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "rooms"));
    // 部屋ごとのunsubscribe保持
    let unsubRoomFns: (() => void)[] = [];
    const unsubRooms = onSnapshot(q, snap => {
      // 全ルームのmessagesサブコレクションを監視
      unsubRoomFns.forEach(fn => fn());
      unsubRoomFns = [];
      const roomIds = snap.docs.map(doc => doc.id);
      if (roomIds.length === 0) {
        setUnread(0);
        return;
      }
      let total = 0;
      let completed = 0;
      roomIds.forEach(roomId => {
        const unsubMsg = onSnapshot(
          collection(db, "rooms", roomId, "messages"),
          snap2 => {
            let count = 0;
            snap2.forEach(docSnap => {
              const msg = docSnap.data();
              if (
                msg.userId !== userId &&
                (!Array.isArray(msg.readBy) || !msg.readBy.includes(userId))
              ) {
                count += 1;
              }
            });
            total += count;
            completed += 1;
            // 全部屋取得後に合計反映
            if (completed === roomIds.length) setUnread(total);
          }
        );
        unsubRoomFns.push(unsubMsg);
      });
    });
    return () => {
      unsubRooms();
      unsubRoomFns.forEach(fn => fn());
    };
  }, [userId]);
  return unread;
}

function useDMUnread(userId: string | undefined) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let unsubMsgFns: (() => void)[] = [];
    const unsubThreads = onSnapshot(query(collection(db, "dmThreads")), snap => {
      unsubMsgFns.forEach(fn => fn());
      unsubMsgFns = [];
      let total = 0;
      const docs = snap.docs.filter(doc =>
        Array.isArray(doc.data().participants) &&
        doc.data().participants.includes(userId)
      );
      if (docs.length === 0) {
        setUnread(0);
        return;
      }
      let completed = 0;
      docs.forEach(docu => {
        const unsubMsg = onSnapshot(collection(db, "dmThreads", docu.id, "messages"), snap2 => {
          snap2.forEach(msgDoc => {
            const msg = msgDoc.data();
            if (
              msg.userId !== userId &&
              (!Array.isArray(msg.readBy) || !msg.readBy.includes(userId))
            ) {
              total += 1;
            }
          });
          completed += 1;
          if (completed === docs.length) setUnread(total);
        });
        unsubMsgFns.push(unsubMsg);
      });
    });
    return () => {
      unsubThreads();
      unsubMsgFns.forEach(fn => fn());
    };
  }, [userId]);
  return unread;
}

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

export default function CommunitySidebar() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const uid = user?.uid;
  const communityUnread = useCommunityUnread(uid);
  const dmUnread = useDMUnread(uid);

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
