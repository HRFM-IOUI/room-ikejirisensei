"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import Image from "next/image";

// 型定義（最小限）
type UserData = {
  id: string;
  name?: string;
  icon?: string;
};

type FriendRequest = {
  id: string;
  from: string;
  name: string;
  icon?: string;
};

export default function FriendsPage() {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState<string>("");
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 自分のフレンド一覧・申請一覧
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // フレンド一覧
      const snap = await getDocs(collection(db, "users", user.uid, "friends"));
      const ids = snap.docs.map(docSnap => docSnap.data().userId as string);
      const userDatas = await Promise.all(
        ids.map(async id => {
          const uref = doc(db, "users", id);
          const usnap = await getDoc(uref);
          return usnap.exists()
            ? { ...usnap.data(), id } as UserData
            : { name: id, id };
        })
      );
      setFriends(userDatas);

      // 受信リクエスト
      const reqSnap = await getDocs(
        collection(db, "users", user.uid, "friendRequestsReceived")
      );
      const reqs = await Promise.all(
        reqSnap.docs.map(async docSnap => {
          const fromId = docSnap.data().from as string;
          const usnap = await getDoc(doc(db, "users", fromId));
          return {
            id: docSnap.id,
            from: fromId,
            name: usnap.exists()
              ? (usnap.data().name as string) || fromId
              : fromId,
            icon: usnap.exists() ? (usnap.data().icon as string | undefined) : undefined,
          } as FriendRequest;
        })
      );
      setRequests(reqs);
      setLoading(false);
    };
    fetch();
  }, [user]);

  // ユーザー名から検索
  async function handleSearch() {
    if (!search.trim()) return;
    setFoundUser(null);
    const usersSnap = await getDocs(collection(db, "users"));
    const match = usersSnap.docs.find(
      docSnap => docSnap.data().name === search.trim()
    );
    if (match) {
      // 既にフレンドまたは自分なら非表示
      if (match.id === user?.uid) {
        toast.error("自分自身は追加できません。");
        return;
      }
      if (friends.some(f => f.id === match.id)) {
        toast("既にフレンドです。");
        return;
      }
      setFoundUser({ id: match.id, ...match.data() });
    } else {
      toast("ユーザーが見つかりません。");
      setFoundUser(null);
    }
  }

  // 申請送信
  async function handleSendRequest() {
    if (!user || !foundUser) return;
    await setDoc(
      doc(db, "users", user.uid, "friendRequestsSent", foundUser.id),
      {
        to: foundUser.id,
        sentAt: new Date(),
      }
    );
    await setDoc(
      doc(db, "users", foundUser.id, "friendRequestsReceived", user.uid),
      {
        from: user.uid,
        sentAt: new Date(),
      }
    );
    toast.success("フレンド申請を送りました！");
    setFoundUser(null);
  }

  // 申請承認
  async function handleAcceptRequest(fromId: string) {
    if (!user) return;
    // フレンド追加（双方向）
    await setDoc(
      doc(db, "users", user.uid, "friends", fromId),
      { userId: fromId }
    );
    await setDoc(
      doc(db, "users", fromId, "friends", user.uid),
      { userId: user.uid }
    );
    // 申請削除
    await deleteDoc(
      doc(db, "users", user.uid, "friendRequestsReceived", fromId)
    );
    await deleteDoc(
      doc(db, "users", fromId, "friendRequestsSent", user.uid)
    );
    toast.success("フレンドになりました！");
    // UI即反映
    setFriends(f =>
      [...f, { id: fromId, name: requests.find(r => r.from === fromId)?.name }]
    );
    setRequests(r => r.filter(r => r.from !== fromId));
  }

  if (!user) {
    return (
      <div style={{ padding: 44, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#e24444" }}>
          ログインが必要です
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div style={{ padding: 44, textAlign: "center", color: "#aaa" }}>
        読み込み中...
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "48px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 20px #227ab918",
        padding: 30,
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 22,
          marginBottom: 12,
          color: "#2471c7",
        }}
      >
        フレンドリスト
      </h2>
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ユーザー名で検索"
          style={{
            padding: 10,
            borderRadius: 9,
            border: "1px solid #bfe1fa",
            width: "65%",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: 8,
            padding: "10px 22px",
            borderRadius: 9,
            background: "#25b6e9",
            color: "#fff",
            fontWeight: 700,
            border: "none",
          }}
        >
          検索
        </button>
        {foundUser && (
          <span style={{ marginLeft: 18, display: "inline-flex", alignItems: "center", gap: 7 }}>
            {foundUser.icon && (
              <Image
                src={foundUser.icon}
                alt="icon"
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
              />
            )}
            <span style={{ fontWeight: 700, color: "#2294cb", fontSize: 15 }}>{foundUser.name}</span>
            <button
              onClick={handleSendRequest}
              style={{
                marginLeft: 12,
                padding: "10px 16px",
                borderRadius: 8,
                background: "#82cd47",
                color: "#fff",
                fontWeight: 700,
                border: "none",
              }}
            >
              フレンド申請
            </button>
          </span>
        )}
      </div>
      <div style={{ marginBottom: 30 }}>
        <strong>フレンド：</strong>
        <ul style={{ paddingLeft: 10 }}>
          {friends.length === 0 && <li style={{ color: "#bbb" }}>（まだいません）</li>}
          {friends.map(f => (
            <li key={f.id} style={{ display: "flex", alignItems: "center", marginBottom: 7, gap: 7 }}>
              {f.icon && (
                <Image
                  src={f.icon}
                  alt="icon"
                  width={27}
                  height={27}
                  style={{ borderRadius: "50%" }}
                />
              )}
              <span style={{ fontWeight: 700, color: "#2676be", fontSize: 15 }}>{f.name ?? f.id}</span>
              <span style={{ color: "#aaa", fontSize: 12, marginLeft: 4 }}>{f.id}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>受信した申請：</strong>
        <ul style={{ paddingLeft: 10 }}>
          {requests.length === 0 && <li style={{ color: "#bbb" }}>（なし）</li>}
          {requests.map(req => (
            <li key={req.id} style={{ display: "flex", alignItems: "center", marginBottom: 7, gap: 7 }}>
              {req.icon && (
                <Image
                  src={req.icon}
                  alt="icon"
                  width={27}
                  height={27}
                  style={{ borderRadius: "50%" }}
                />
              )}
              <span style={{ fontWeight: 700, color: "#2294cb" }}>{req.name}</span>
              <button
                onClick={() => handleAcceptRequest(req.from)}
                style={{
                  marginLeft: 12,
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: "#2991ec",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                承認
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
