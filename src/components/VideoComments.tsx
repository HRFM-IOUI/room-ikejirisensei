'use client';
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from "firebase/firestore";

type Comment = {
  id: string;
  text: string;
  createdAt: Timestamp | null;
};

interface VideoCommentsProps {
  videoId: string;
}

export default function VideoComments({ videoId }: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // コメント取得
  useEffect(() => {
    const fetch = async () => {
      const q = query(
        collection(db, "comments"),
        where("videoId", "==", videoId),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      setComments(
        snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text as string,
            createdAt: data.createdAt ? data.createdAt as Timestamp : null
          };
        })
      );
    };
    fetch();
  }, [videoId]);

  // コメント投稿
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await addDoc(collection(db, "comments"), {
      videoId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    setText("");
    // 再取得
    const q = query(
      collection(db, "comments"),
      where("videoId", "==", videoId),
      orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    setComments(
      snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text as string,
          createdAt: data.createdAt ? data.createdAt as Timestamp : null
        };
      })
    );
    setLoading(false);
  };

  return (
    <div style={{
      background: "#f5f7fa",
      borderRadius: 12,
      padding: "12px 18px",
      marginBottom: 8,
      boxShadow: "0 2px 8px #0001",
      minHeight: 70,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#222" }}>
        コメント（{comments.length}件）
      </div>
      <form style={{ display: "flex", gap: 7, marginBottom: 8 }} onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="コメントを書く…"
          style={{
            flex: 1,
            padding: "8px 11px",
            borderRadius: 6,
            border: "1.1px solid #b6c3dc",
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            background: "#5b8dee",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
          }}
        >投稿</button>
      </form>
      <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 15 }}>
        {comments.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 14, padding: "4px 0" }}>コメントはまだありません</div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ marginBottom: 3, color: "#2a2c3a" }}>
              <span style={{ background: "#eaf0fa", borderRadius: 5, padding: "4px 9px" }}>{c.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
