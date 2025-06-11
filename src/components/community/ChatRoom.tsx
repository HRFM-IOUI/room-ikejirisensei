"use client";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firestore Timestamp型
type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

type Message = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: "text" | "image" | "video";
  createdAt: FirestoreTimestamp | null;
  editedAt?: FirestoreTimestamp | null;
  replyTo?: string;
  mentions?: string[];
  readBy?: string[];
};

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user] = useAuthState(auth);

  // ブロック情報
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!user?.uid) return;
    const blocksCol = collection(db, "users", user.uid, "blocks");
    return onSnapshot(blocksCol, snap => {
      setBlockedUsers(snap.docs.map(d => d.id));
    });
  }, [user?.uid]);

  // メッセージ取得
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const ms: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId ?? "",
          userName: data.userName ?? "",
          text: data.text ?? "",
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          type: data.type,
          createdAt: data.createdAt ?? null,
          editedAt: data.editedAt,
          replyTo: data.replyTo,
          mentions: data.mentions ?? [],
          readBy: data.readBy ?? [],
        };
      });
      setMessages(ms);

      // 既読処理
      if (user?.uid) {
        ms.forEach((msg) => {
          if (
            msg.readBy &&
            !msg.readBy.includes(user.uid) &&
            msg.userId !== user.uid
          ) {
            updateDoc(
              doc(db, "rooms", roomId, "messages", msg.id),
              { readBy: [...msg.readBy, user.uid] }
            );
          }
        });
      }

      // スクロール
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 20);
    });
    return () => unsub();
  }, [roomId, user?.uid]);

  // メディアアップロード
  async function uploadMediaFile(file: File): Promise<{ url: string; type: "image" | "video" }> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    let type: "image" | "video";
    if (file.type.startsWith("image")) type = "image";
    else if (file.type.startsWith("video")) type = "video";
    else throw new Error("対応ファイル: jpg, png, gif, mp4（20MBまで）");
    if (!["jpg", "jpeg", "png", "gif", "mp4"].includes(ext) || file.size > 20 * 1024 * 1024) {
      throw new Error("対応ファイル: jpg, png, gif, mp4（20MBまで）");
    }
    const storage = getStorage();
    const fileName = `chatUploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, type };
  }

  // メディア送信
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSending(true);
    try {
      const { url, type } = await uploadMediaFile(file);
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        userId: user.uid,
        userName: user.displayName || "匿名",
        text: "",
        imageUrl: type === "image" ? url : "",
        videoUrl: type === "video" ? url : "",
        type,
        createdAt: serverTimestamp(),
        replyTo,
        mentions: [],
        readBy: [user.uid],
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "メディア送信失敗");
    }
    setSending(false);
    e.target.value = "";
    setReplyTo(null);
  }

  // メッセージ送信
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const mentionMatches = input.match(/@[\w\-]{2,}/g);
    const mentions = mentionMatches?.map((str) => str.replace("@", "")) ?? [];
    setSending(true);
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      userId: user.uid,
      userName: user.displayName || "匿名",
      text: input,
      createdAt: serverTimestamp(),
      replyTo,
      mentions,
      readBy: [user.uid],
      type: "text"
    });
    setInput("");
    setReplyTo(null);
    setSending(false);
  }

  // メッセージ削除
  async function handleDelete(msgId: string) {
    if (!window.confirm("このメッセージを削除します。よろしいですか？")) return;
    await deleteDoc(doc(db, "rooms", roomId, "messages", msgId));
  }

  // メッセージ編集
  async function handleEdit(msg: Message) {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  }
  async function handleEditSubmit(e: React.FormEvent, msg: Message) {
    e.preventDefault();
    if (!editingText.trim()) return;
    await updateDoc(doc(db, "rooms", roomId, "messages", msg.id), {
      text: editingText,
      editedAt: serverTimestamp(),
    });
    setEditingMsgId(null);
    setEditingText("");
  }

  // 通報
  async function handleReport(msg: Message) {
    const reason = prompt("通報理由を入力してください（例：迷惑行為・スパム等）");
    if (!reason) return;
    await addDoc(collection(db, "reports"), {
      fromUid: user?.uid,
      targetUid: msg.userId,
      msgId: msg.id,
      reason,
      createdAt: serverTimestamp(),
      type: "community",
    });
    alert("通報ありがとうございました。運営が確認します。");
  }

  // リプライ指定
  function handleReply(msgId: string) {
    setReplyTo(msgId);
  }

  // メッセージクリックでリプ元にジャンプ
  function scrollToMsg(id: string) {
    const el = document.getElementById("msg-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Enter送信/Shift+Enter改行
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  const currentUserId = user?.uid;
  // ブロック対象のメッセージは非表示
  const visibleMessages = messages.filter(msg =>
    !blockedUsers.includes(msg.userId) || msg.userId === currentUserId
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f9fbfd",
        borderRadius: 16,
        boxShadow: "0 8px 40px #b9e0fa12",
        margin: "16px 32px 36px 32px",
        padding: "18px 22px 0 22px",
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 18,
          color: "#2471c7",
          marginBottom: 8,
        }}
      >
        ルーム「{roomId}」チャット
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: "18px 12px",
          marginBottom: 14,
          minHeight: 210,
        }}
      >
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            id={"msg-" + msg.id}
            style={{
              marginBottom: 12,
              fontWeight: 700,
              color: "#375f92",
              position: "relative",
              padding: "7px 0 7px 5px",
              borderLeft:
                user && msg.readBy?.includes(user.uid)
                  ? "3px solid #d5ecff"
                  : "3px solid #48f",
              background:
                user && msg.readBy?.includes(user.uid)
                  ? "transparent"
                  : "#e9f2ff",
              transition: "background .12s",
            }}
          >
            {/* リプ元表示 */}
            {msg.replyTo && (
              <div
                style={{
                  borderLeft: "3px solid #48f",
                  background: "#f3f7ff",
                  padding: "3px 8px",
                  marginBottom: 3,
                  color: "#48f",
                  cursor: "pointer",
                }}
                onClick={() => scrollToMsg(msg.replyTo!)}
              >
                {(() => {
                  const parent = messages.find((m) => m.id === msg.replyTo);
                  return parent ? (
                    <span>
                      ↩︎ <b>@{parent.userName}</b>「
                      {parent.text.slice(0, 18)}…」
                    </span>
                  ) : (
                    <span>（返信元がありません）</span>
                  );
                })()}
              </div>
            )}
            {/* 本文・メディア・編集UI */}
            {editingMsgId === msg.id ? (
              <form onSubmit={e => handleEditSubmit(e, msg)} style={{ display: "flex", gap: 6 }}>
                <input
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  style={{ fontSize: 16, borderRadius: 6, padding: "5px 12px", width: "70%" }}
                />
                <button type="submit" style={{ fontWeight: 700, color: "#2277d7", border: "none", background: "none", cursor: "pointer" }}>保存</button>
                <button onClick={() => setEditingMsgId(null)} type="button" style={{ color: "#888", border: "none", background: "none", cursor: "pointer" }}>キャンセル</button>
              </form>
            ) : (
              <>
                {/* メディア */}
                {msg.type === "image" && msg.imageUrl && (
                  // Next.jsの最適化は用途・環境に応じて
                  <img src={msg.imageUrl} alt="画像" style={{ maxWidth: 180, borderRadius: 10, margin: "7px 0" }} />
                )}
                {msg.type === "video" && msg.videoUrl && (
                  <video src={msg.videoUrl} controls style={{ maxWidth: 210, borderRadius: 10, margin: "7px 0" }} />
                )}
                {/* 本文（メンション強調） */}
                <span style={{ color: "#198fd6", marginRight: 7 }}>
                  @{msg.userName}：
                </span>
                <span>
                  {msg.text.split(/(@[\w\-]{2,})/g).map((part, i) =>
                    part.startsWith("@") ? (
                      <span
                        key={i}
                        style={{
                          background: "#dff3ff",
                          color: "#1797d3",
                          borderRadius: 5,
                          padding: "2px 5px",
                          margin: "0 1.5px",
                        }}
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                  {msg.editedAt && (
                    <span style={{ fontSize: 11, marginLeft: 7, color: "#c79533" }}>(編集済)</span>
                  )}
                </span>
              </>
            )}
            {/* アクションメニュー（送信者のみ） */}
            {user && msg.userId === user.uid && (
              <div style={{ position: "absolute", top: 7, right: 10 }}>
                <button
                  onClick={() => setEditingMsgId(msg.id)}
                  style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#6a7eb6" }}
                  title="メッセージ操作"
                >︙</button>
                {editingMsgId === msg.id && (
                  <div style={{
                    position: "absolute", right: 0, top: 22, zIndex: 10,
                    background: "#fff", border: "1px solid #b8d0ef", borderRadius: 7, boxShadow: "0 1px 5px #a9d2fa44"
                  }}>
                    <button
                      onClick={() => handleEdit(msg)}
                      style={{ padding: "7px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}
                    >編集</button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      style={{ padding: "7px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: 600, color: "#d33" }}
                    >削除</button>
                    <button
                      onClick={() => handleReport(msg)}
                      style={{ padding: "7px 18px", border: "none", background: "none", cursor: "pointer", fontWeight: 600, color: "#d87" }}
                    >通報</button>
                  </div>
                )}
              </div>
            )}
            {/* リプライボタン */}
            <button
              style={{
                marginLeft: 12,
                color: "#55f",
                background: "none",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => handleReply(msg.id)}
            >
              ↩ リプ
            </button>
            {/* 未読・既読バッジ */}
            {user && msg.userId === user.uid && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  color: msg.readBy && msg.readBy.length > 1 ? "#3fa435" : "#aaa",
                  background: "#e6f6ea",
                  borderRadius: 7,
                  padding: "2px 6px",
                }}
              >
                {msg.readBy && msg.readBy.length > 1 ? "既読" : "未読"}
              </span>
            )}
            {/* 送信時刻 */}
            <span
              style={{
                marginLeft: 16,
                fontSize: 12,
                color: "#97a8c4",
                fontWeight: 500,
              }}
            >
              {msg.createdAt && typeof msg.createdAt.toDate === "function"
                ? msg.createdAt.toDate().toLocaleTimeString().slice(0, 5)
                : "--:--"}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* 返信中UI */}
      {replyTo && (
        <div
          style={{
            background: "#eef6ff",
            color: "#1577e6",
            padding: 7,
            borderRadius: 7,
            marginBottom: 6,
          }}
        >
          返信先：
          {(() => {
            const parent = messages.find((m) => m.id === replyTo);
            return parent ? (
              <span>
                @{parent.userName}「{parent.text.slice(0, 18)}…」
              </span>
            ) : (
              <span>（返信元がありません）</span>
            );
          })()}
          <button
            onClick={() => setReplyTo(null)}
            style={{ marginLeft: 10, color: "#c00", border: "none", background: "none", cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      )}
      <form onSubmit={handleSend} style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <input
          type="file"
          accept="image/*,video/mp4"
          onChange={handleFileChange}
          disabled={sending}
          style={{ width: 28 }}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="メッセージを入力... ＠メンション対応"
          style={{
            flex: 1,
            fontSize: 16,
            padding: "11px 16px",
            borderRadius: 9,
            border: "1.3px solid #c7e3fc",
            marginRight: 8,
          }}
          disabled={sending}
        />
        <button
          type="submit"
          style={{
            fontWeight: 900,
            color: "#fff",
            background: "#47b2f2",
            border: "none",
            borderRadius: 9,
            fontSize: 16,
            padding: "10px 22px",
            cursor: sending ? "not-allowed" : "pointer",
            opacity: sending ? 0.6 : 1
          }}
          disabled={!input.trim() || sending}
        >
          送信
        </button>
      </form>
    </div>
  );
}
