"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import Image from "next/image";

type DmThread = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: Date | { toDate(): Date } | string | number;
};

type User = {
  uid: string;
  name?: string;
  photoURL?: string;
};

export default function DmThreadList({
  activeThreadId,
  setActiveThreadId,
}: {
  activeThreadId: string | null;
  setActiveThreadId: (id: string) => void;
}) {
  const [user] = useAuthState(auth);
  const currentUser = user?.uid ?? "";
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [users, setUsers] = useState<{ [uid: string]: User }>({});
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [threadId: string]: number }>({});

  // DM作成用（X風検索・選択ステート）
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  // 1. DMスレッド一覧リアルタイム取得
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "dmThreads"),
      where("participants", "array-contains", currentUser),
      orderBy("lastTimestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setThreads(
        snap.docs.map((doc) => ({
          ...(doc.data() as DmThread),
          id: doc.id,
        }))
      );
    });
    return () => unsub();
  }, [currentUser]);

  // 2. ユーザー一覧取得（DM相手用、threadsから自分以外のUIDだけ全取得）
  useEffect(() => {
    if (!threads.length) return;
    const uids = Array.from(
      new Set(threads.flatMap(t => t.participants.filter(uid => uid !== currentUser)))
    );
    if (!uids.length) return;
    Promise.all(
      uids.map(uid => getDocs(query(collection(db, "users"), where("uid", "==", uid))))
    ).then((snapshots) => {
      const result: { [uid: string]: User } = {};
      snapshots.forEach((snap) => {
        snap.forEach(docSnap => {
          const data = docSnap.data();
          result[data.uid] = { uid: data.uid, name: data.name || data.uid, photoURL: data.photoURL };
        });
      });
      setUsers(u => ({ ...u, ...result }));
    });
  }, [threads, currentUser]);

  // 3. ブロック済みユーザー取得
  useEffect(() => {
    if (!currentUser) return;
    const blocksCol = collection(db, "users", currentUser, "blocks");
    return onSnapshot(blocksCol, snap => {
      setBlockedUsers(snap.docs.map(d => d.id));
    });
  }, [currentUser]);

  // 4. スレッドごとの未読数取得
  useEffect(() => {
    if (!currentUser || !threads.length) return;
    const unsubs = threads.map(thread => {
      return onSnapshot(
        collection(db, "dmThreads", thread.id, "messages"),
        snap => {
          let count = 0;
          snap.forEach(docSnap => {
            const msg = docSnap.data();
            if (
              msg.userId !== currentUser &&
              (!msg.readBy || !msg.readBy.includes(currentUser))
            ) {
              count += 1;
            }
          });
          setUnreadCounts(prev => ({ ...prev, [thread.id]: count }));
        }
      );
    });
    return () => unsubs.forEach(fn => fn());
  }, [threads, currentUser]);

  // ユーザー名から検索（部分一致、最大20件）
  async function handleUserSearch() {
    if (!searchName.trim() || searchName.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const usersSnap = await getDocs(collection(db, "users"));
    const results = usersSnap.docs
      .map(d => d.data() as User)
      .filter(u =>
        u.uid !== currentUser &&
        u.name &&
        u.name.includes(searchName.trim())
      )
      .slice(0, 20); // 最大20件
    setSearchResults(results);
  }

  // 新規DM作成
  async function handleCreateDm() {
    if (!selectedUser || selectedUser.uid === currentUser) return;
    setCreating(true);

    // 既存スレッド検索
    const threadsRef = collection(db, "dmThreads");
    const q = query(threadsRef, where("participants", "array-contains", currentUser));
    const snapshot = await getDocs(q);
    let exists = false;
    let existId = "";
    snapshot.forEach((docSnap) => {
      const p = docSnap.data().participants;
      if (Array.isArray(p) && p.includes(selectedUser.uid) && p.length === 2) {
        exists = true;
        existId = docSnap.id;
      }
    });
    if (exists) {
      setActiveThreadId(existId);
      setCreating(false);
      setSelectedUser(null);
      setSearchName("");
      setSearchResults([]);
      return;
    }
    // 新規作成
    const docRef = await addDoc(threadsRef, {
      participants: [currentUser, selectedUser.uid],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastTimestamp: serverTimestamp(),
    });
    setActiveThreadId(docRef.id);
    setSelectedUser(null);
    setSearchName("");
    setSearchResults([]);
    setCreating(false);
  }

  // 未読合計
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // スレッドフィルタリング（ブロック済みは非表示）
  const filteredThreads = threads.filter(
    thread =>
      thread.participants.some(uid => uid !== currentUser && !blockedUsers.includes(uid))
  );

  return (
    <aside
      style={{
        width: 260,
        minWidth: 188,
        background: "linear-gradient(140deg, #f4fcff 0%, #eef4ff 100%)",
        boxShadow: "4px 0 32px #1a6ed80a",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "38px 12px 28px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          marginBottom: 28,
          paddingLeft: 22,
          fontSize: 20,
          fontWeight: 900,
          color: "#2294cb",
        }}
      >
        DM Threads
        {totalUnread > 0 && (
          <span style={{
            marginLeft: 9,
            background: "#ff6961",
            color: "#fff",
            borderRadius: "999px",
            fontSize: 13,
            fontWeight: 700,
            padding: "0 9px",
            minWidth: 23,
            height: 22,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px #f99a9a44"
          }}>
            {totalUnread}
          </span>
        )}
      </div>

      {/* 新規DM作成 X風UI */}
      <div style={{ marginBottom: 16, width: "94%" }}>
        <input
          type="text"
          value={searchName}
          onChange={e => {
            setSearchName(e.target.value);
            setSelectedUser(null);
            setSearchResults([]);
          }}
          placeholder="ユーザー名で検索"
          style={{
            width: "67%", padding: "7px 9px", borderRadius: 7, border: "1.2px solid #bbd8f6", fontSize: 15, marginRight: 6
          }}
          onKeyDown={e => { if (e.key === "Enter") handleUserSearch(); }}
        />
        <button
          onClick={handleUserSearch}
          disabled={!searchName.trim() || searchName.trim().length < 2}
          style={{
            padding: "7px 14px",
            borderRadius: 7,
            background: "#2294cb",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer"
          }}
        >
          検索
        </button>
      </div>
      {searchResults.length > 0 && (
        <ul style={{ marginTop: 4, marginBottom: 6, paddingLeft: 0, width: "92%" }}>
          {searchResults.map(user => (
            <li
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              style={{
                cursor: "pointer",
                listStyle: "none",
                background: selectedUser?.uid === user.uid ? "#d8f0ff" : "#fff",
                border: "1px solid #bde4fa",
                borderRadius: 7,
                padding: "8px 12px",
                marginBottom: 3,
                fontWeight: 700,
                color: "#2991ec",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              {/* サムネイル */}
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="icon"
                  width={26}
                  height={26}
                  style={{
                    borderRadius: "50%",
                    border: "1px solid #e1e6ee",
                    marginRight: 7,
                  }}
                />
              ) : (
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "#e3ebf3", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: "#96a8be", fontSize: 14,
                  marginRight: 7,
                }}>
                  {user.name?.slice(0, 1)?.toUpperCase() ?? "?"}
                </div>
              )}
              <span>{user.name}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>（{user.uid}）</span>
              {selectedUser?.uid === user.uid && (
                <span style={{
                  marginLeft: 9,
                  color: "#189ddc",
                  fontWeight: 800,
                  fontSize: 13
                }}>選択中</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedUser && (
        <button
          onClick={handleCreateDm}
          disabled={creating}
          style={{
            padding: "7px 24px",
            borderRadius: 7,
            background: "#2a99ee",
            color: "#fff",
            fontWeight: 900,
            fontSize: 15,
            border: "none",
            marginBottom: 10,
            marginTop: 4,
            width: "92%",
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating ? "作成中..." : `このユーザーとDM開始`}
        </button>
      )}

      {/* DMスレッドリスト */}
      <ul style={{ width: "100%", padding: 0, margin: 0, listStyle: "none" }}>
        {filteredThreads.length === 0 && (
          <li style={{ color: "#aac", fontSize: 15, padding: "9px 0 0 14px" }}>
            スレッドはありません
          </li>
        )}
        {filteredThreads.map((thread) => {
          const otherUid = thread.participants.find((u) => u !== currentUser) || "(不明)";
          const otherUser = users[otherUid];
          return (
            <li
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              style={{
                cursor: "pointer",
                background:
                  thread.id === activeThreadId ? "#e7f6ff" : "#fff",
                border:
                  thread.id === activeThreadId
                    ? "2.2px solid #8ecbfa"
                    : "1.1px solid #dde8fb",
                borderRadius: 9,
                fontWeight: 700,
                color: "#225c7d",
                marginBottom: 7,
                padding: "13px 0 13px 16px",
                fontSize: 16,
                boxShadow: thread.id === activeThreadId
                  ? "0 2px 14px #4cb2e510"
                  : undefined,
                transition: "all .13s",
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              {/* プロフィール画像 */}
              {otherUser?.photoURL ? (
                <Image
                  src={otherUser.photoURL}
                  alt="icon"
                  width={36}
                  height={36}
                  style={{
                    borderRadius: "50%",
                    border: "1.5px solid #e1e6ee",
                  }}
                />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#e3ebf3", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: "#96a8be", fontSize: 16,
                }}>
                  {otherUser?.name?.slice(0, 1)?.toUpperCase() ?? "?"}
                </div>
              )}
              <span>{otherUser?.name || otherUid}</span>
              <span style={{ fontSize: 12, color: "#78a3c1", marginLeft: 7, flex: 1 }}>
                {thread.lastMessage?.slice(0, 16)}
              </span>
              {/* 未読数バッジ */}
              {unreadCounts[thread.id] > 0 && (
                <span style={{
                  background: "#ff6961",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "0 7px",
                  minWidth: 20,
                  height: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4
                }}>
                  {unreadCounts[thread.id]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
