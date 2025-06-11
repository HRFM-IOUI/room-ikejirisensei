"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Message = {
  id: string;
  userId: string;
  userName: string;
  userIcon?: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: "text" | "image" | "video";
  createdAt: any;
  editedAt?: any;
  replyTo?: string;
  mentions?: string[];
  readBy?: string[];
};

export default function DmChat({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [sending, setSending] = useState(false);
  const [user] = useAuthState(auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ①ブロック相手情報取得
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
    if (!threadId) return;
    const q = query(
      collection(db, "dmThreads", threadId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]
      );
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 30);
    });
    return () => unsub();
  }, [threadId]);

  // 既読処理
  useEffect(() => {
    if (!user || !threadId || messages.length === 0) return;
    const unread = messages.filter(
      (msg) => msg.userId !== user.uid && (!msg.readBy || !msg.readBy.includes(user.uid))
    );
    unread.forEach((msg) => {
      updateDoc(doc(db, "dmThreads", threadId, "messages", msg.id), {
        readBy: [...(msg.readBy || []), user.uid],
      });
    });
  }, [messages, user, threadId]);

  // メンション抽出
  function extractMentions(text: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_\-ぁ-んァ-ヶー一-龠]+)/g;
    const result: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      result.push(match[1]);
    }
    return result;
  }

  // メディアアップロード
  async function uploadMediaFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const type = file.type.startsWith("image") ? "image" :
      file.type.startsWith("video") ? "video" : "unknown";
    if (!["jpg", "jpeg", "png", "gif", "mp4"].includes(ext || "") || file.size > 20 * 1024 * 1024) {
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
      await addDoc(collection(db, "dmThreads", threadId, "messages"), {
        userId: user.uid,
        userName: user.displayName || "You",
        userIcon: user.photoURL || undefined,
        text: "",
        imageUrl: type === "image" ? url : "",
        videoUrl: type === "video" ? url : "",
        type,
        createdAt: serverTimestamp(),
        replyTo: replyTo?.id || null,
        mentions: [],
        readBy: [user.uid],
      });
      // スレッド情報も更新
      await updateDoc(doc(db, "dmThreads", threadId), {
        lastMessage: type === "image" ? "[画像]" : "[動画]",
        lastTimestamp: serverTimestamp(),
      });
    } catch (err: any) {
      alert(err.message || "メディア送信失敗");
    }
    setSending(false);
    e.target.value = "";
    setReplyTo(null);
  }

  // メッセージ送信
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setSending(true);
    const mentions = extractMentions(input);
    await addDoc(collection(db, "dmThreads", threadId, "messages"), {
      userId: user.uid,
      userName: user.displayName || "You",
      userIcon: user.photoURL || undefined,
      text: input,
      createdAt: serverTimestamp(),
      replyTo: replyTo?.id || null,
      mentions,
      readBy: [user.uid],
      type: "text",
    });
    setInput("");
    setReplyTo(null);
    // スレッド情報も更新
    await updateDoc(doc(db, "dmThreads", threadId), {
      lastMessage: input,
      lastTimestamp: serverTimestamp(),
    });
    setSending(false);
  }

  // メッセージ削除
  async function handleDelete(msgId: string) {
    if (!window.confirm("このメッセージを削除します。よろしいですか？")) return;
    await deleteDoc(doc(db, "dmThreads", threadId, "messages", msgId));
  }

  // メッセージ編集
  async function handleEdit(msg: Message) {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  }
  async function handleEditSubmit(e: React.FormEvent, msg: Message) {
    e.preventDefault();
    if (!editingText.trim()) return;
    await updateDoc(doc(db, "dmThreads", threadId, "messages", msg.id), {
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
      type: "dm",
    });
    alert("通報ありがとうございました。運営が確認します。");
  }

  // Enter送信/Shift+Enter改行
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  }

  const currentUserId = user?.uid;

  // 相手ブロック時に非表示
  const visibleMessages = messages.filter(msg =>
    !blockedUsers.includes(msg.userId) || msg.userId === currentUserId
  );

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "#f6faff",
      borderRadius: 14,
      boxShadow: "0 8px 32px #bae0fa18",
      margin: "16px 32px 36px 32px",
      padding: "18px 22px 0 22px"
    }}>
      <div style={{
        fontWeight: 900,
        fontSize: 18,
        color: "#2397e6",
        marginBottom: 8
      }}>
        ダイレクトメッセージ
      </div>
      <div style={{
        flex: 1,
        overflowY: "auto",
        background: "#fff",
        borderRadius: 12,
        padding: "18px 10px",
        marginBottom: 12,
        minHeight: 260,
        display: "flex",
        flexDirection: "column"
      }}>
        {visibleMessages.map((msg) => {
          const isMine = msg.userId === currentUserId;
          return (
            <div key={msg.id} style={{
              display: "flex", flexDirection: isMine ? "row-reverse" : "row",
              alignItems: "flex-end", marginBottom: 12, gap: 7, position: "relative"
            }}>
              {/* アイコン */}
              {msg.userIcon ? (
                <img src={msg.userIcon} alt="icon" width={38} height={38}
                  style={{
                    borderRadius: "50%",
                    border: "1.5px solid #e1e6ee",
                    marginLeft: isMine ? 0 : 4,
                    marginRight: isMine ? 4 : 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#e3ebf3", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: "#96a8be", fontSize: 17,
                  marginLeft: isMine ? 0 : 4,
                  marginRight: isMine ? 4 : 0,
                }}>
                  {msg.userName?.slice(0, 1)?.toUpperCase() ?? "?"}
                </div>
              )}
              {/* 吹き出し */}
              <div style={{
                background: isMine ? "#d5f4ff" : "#edf2f8",
                borderRadius: isMine ? "16px 3px 16px 16px" : "3px 16px 16px 16px",
                padding: "10px 15px",
                maxWidth: "68%",
                wordBreak: "break-word",
                fontWeight: 600,
                color: "#273b50",
                boxShadow: "0 2px 10px #5bc3fa12",
                position: "relative"
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: isMine ? "#0096c6" : "#285796",
                  marginBottom: 2
                }}>
                  {isMine ? "あなた" : msg.userName}
                </div>
                {/* リプライ */}
                {msg.replyTo && (
                  <span style={{
                    background: "#e5f2fc", color: "#90a5bf", fontSize: 12, marginRight: 6,
                    borderRadius: 7, padding: "1px 8px"
                  }}>
                    Re: {messages.find(m => m.id === msg.replyTo)?.text?.slice(0, 12) || "元メッセージ"}
                  </span>
                )}

                {/* メディア/本文（インライン編集含む） */}
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
                      <img src={msg.imageUrl} alt="画像" style={{ maxWidth: 180, borderRadius: 10, margin: "7px 0" }} />
                    )}
                    {msg.type === "video" && msg.videoUrl && (
                      <video src={msg.videoUrl} controls style={{ maxWidth: 210, borderRadius: 10, margin: "7px 0" }} />
                    )}
                    {/* 本文（メンション着色） */}
                    <div style={{ fontSize: 16, marginTop: 3 }}>
                      {msg.text.split(/(@[a-zA-Z0-9_\-ぁ-んァ-ヶー一-龠]+)/g).map((part, i) =>
                        /^@/.test(part) ? (
                          <span key={i} style={{ color: "#ff4bb1", fontWeight: 900 }}>{part}</span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                      {msg.editedAt && (
                        <span style={{ fontSize: 11, marginLeft: 7, color: "#c79533" }}>(編集済)</span>
                      )}
                    </div>
                  </>
                )}

                {/* アクションメニュー（三点リーダー） */}
                {(msg.userId === currentUserId) && (
                  <div style={{ position: "absolute", top: 7, right: 6 }}>
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
                  onClick={() => setReplyTo(msg)}
                  style={{
                    marginLeft: 12, background: "#f2f7ff", color: "#1881e1",
                    border: "none", borderRadius: 7, fontWeight: 600, fontSize: 12, padding: "2px 9px", cursor: "pointer"
                  }}
                >↩リプ</button>
                <div style={{
                  fontSize: 11, color: "#9cb3cc", textAlign: "right", marginTop: 4
                }}>
                  {msg.createdAt && msg.createdAt.toDate
                    ? msg.createdAt.toDate().toLocaleTimeString().slice(0, 5)
                    : "--:--"}
                  {msg.readBy && msg.readBy.length > 1 && (
                    <span style={{
                      background: "#eaf6e2", color: "#1db743", marginLeft: 8,
                      borderRadius: 9, padding: "1px 8px", fontSize: 11, fontWeight: 700
                    }}>既読</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {replyTo && (
        <div style={{
          background: "#e0f0ff", color: "#1881e1", borderRadius: 8, fontWeight: 700,
          fontSize: 13, padding: "6px 18px", marginBottom: 9, marginLeft: 2, display: "flex", alignItems: "center", gap: 7, maxWidth: 400,
        }}>
          リプ: {replyTo.text?.slice(0, 32)}...
          <button
            onClick={() => setReplyTo(null)}
            style={{
              background: "#fff", color: "#666", border: "none", borderRadius: 7,
              fontWeight: 600, fontSize: 11, padding: "1px 7px", cursor: "pointer"
            }}
          >解除</button>
        </div>
      )}
      <form onSubmit={handleSend} style={{ display: "flex", alignItems: "flex-end", marginTop: 6, gap: 7 }}>
        <input
          type="file"
          accept="image/*,video/mp4"
          onChange={handleFileChange}
          disabled={sending}
          style={{ width: 28 }}
        />
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="メッセージを入力...(Enterで送信・Shift+Enterで改行)"
          style={{
            flex: 1, fontSize: 16, padding: "11px 14px", borderRadius: 10, border: "1.5px solid #b2d8f7",
            marginRight: 8, minHeight: 42, maxHeight: 90, resize: "vertical"
          }}
          disabled={sending}
        />
        <button type="submit"
          style={{
            fontWeight: 900, color: "#fff", background: "#2397e6", border: "none",
            borderRadius: 10, fontSize: 16, padding: "10px 22px", cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.6 : 1,
          }}
          disabled={!input.trim() || sending}
        >送信</button>
      </form>
    </div>
  );
}
