"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

type Room = {
  id: string;
  name: string;
  userCount: number;
  onlineCount: number;
  createdAt: any;
};

export default function RoomList({
  activeRoomId,
  setActiveRoomId
}: {
  activeRoomId: string | null;
  setActiveRoomId: (id: string) => void;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [roomId: string]: number }>({});
  const [user] = useAuthState(auth);

  // rooms取得
  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "asc"), limit(12));
    const unsub = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[]);
    });
    return () => unsub();
  }, []);

  // 各ルーム未読数リアルタイム取得
  useEffect(() => {
    if (!user) return;
    const unsubs = rooms.map(room => {
      return onSnapshot(
        collection(db, "rooms", room.id, "messages"),
        snap => {
          let count = 0;
          snap.forEach(docSnap => {
            const msg = docSnap.data();
            if (
              msg.userId !== user.uid &&
              (!msg.readBy || !msg.readBy.includes(user.uid))
            ) {
              count += 1;
            }
          });
          setUnreadCounts(prev => ({ ...prev, [room.id]: count }));
        }
      );
    });
    return () => unsubs.forEach(fn => fn());
  }, [rooms, user]);

  // 部屋作成
  async function handleCreateRoom() {
    if (rooms.length >= 12) {
      alert("部屋は最大12個までです。");
      return;
    }
    const name = prompt("新しい部屋の名前を入力してください");
    if (name && name.trim()) {
      await addDoc(collection(db, "rooms"), {
        name,
        userCount: 0,
        onlineCount: 0,
        createdAt: serverTimestamp()
      });
    }
  }

  // レスポンシブstyle例（PC/スマホ両対応、最低限）
  const wrapStyle: React.CSSProperties =
    window?.innerWidth && window.innerWidth <= 600
      ? { display: "block", padding: "0 6px", margin: "16px 0" }
      : { display: "flex", gap: 18, flexWrap: "wrap", margin: "18px 0 0 0", padding: "0 32px" };

  return (
    <div style={wrapStyle}>
      {rooms.map(room => (
        <div
          key={room.id}
          onClick={() => setActiveRoomId(room.id)}
          style={{
            minWidth: 220,
            background: room.id === activeRoomId ? "#e0f6ff" : "#fff",
            border: room.id === activeRoomId ? "2px solid #249ef1" : "1.3px solid #c9e2f8",
            borderRadius: 15,
            boxShadow: "0 2px 10px #1b88e01a",
            cursor: "pointer",
            padding: "17px 16px 13px 19px",
            marginBottom: 12,
            transition: "all .13s",
            fontWeight: 700,
            color: "#2057a0",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ fontSize: 17, marginBottom: 6, display: "flex", alignItems: "center" }}>
            {room.name}
            {unreadCounts[room.id] > 0 && (
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
                {unreadCounts[room.id]}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#67b8f3" }}>
            {room.userCount}人（オンライン{room.onlineCount}人）
          </div>
        </div>
      ))}
      {rooms.length < 12 && (
        <div
          style={{
            minWidth: 220,
            background: "#f9fbfd",
            border: "2px dashed #b2cfea",
            borderRadius: 15,
            boxShadow: "0 2px 10px #1b88e00a",
            cursor: "pointer",
            padding: "17px 16px 13px 19px",
            marginBottom: 12,
            textAlign: "center",
            color: "#98aed6",
            fontWeight: 600
          }}
          onClick={handleCreateRoom}
        >
          + 新しい部屋を作成
        </div>
      )}
    </div>
  );
}
