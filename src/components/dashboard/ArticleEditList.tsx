'use client';
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import ArticleEditor from "./ArticleEditor";
import { Block } from "./dashboardConstants";

type Post = {
  id: string;
  blocks: Block[];
  createdAt?: any;
  status?: string;
};

export default function ArticleEditList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 一覧取得
  useEffect(() => {
    const fetchPosts = async () => {
      const snap = await getDocs(collection(db, "posts"));
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    };
    fetchPosts();
  }, []);

  // 保存ハンドラ
  const handleSave = async (blocks: Block[]) => {
    if (!editingPost) return;
    try {
      await updateDoc(doc(db, "posts", editingPost.id), { blocks });
      alert("記事を更新しました！");
      setEditingPost(null);
      // 一覧リロード
      const snap = await getDocs(collection(db, "posts"));
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    } catch (e) {
      alert("保存エラー: " + (e as Error).message);
    }
  };

  return (
    <section
      style={{
        maxWidth: 700,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 6px 24px #0001",
        padding: "32px 18px",
        width: "100%",
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#192349", marginBottom: 24 }}>
        記事の編集
      </h2>
      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {posts.map(post => (
          <li key={post.id}
            style={{
              borderBottom: "1px solid #e2e8ef",
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span style={{ fontWeight: 700, color: "#245f86", fontSize: 16 }}>
              {post.blocks?.[0]?.content?.slice(0, 20) || "(無題)"}
            </span>
            <button
              style={{
                background: "#00b894",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "9px 18px",
                fontWeight: 700,
                fontSize: 15,
                marginLeft: 12,
                cursor: "pointer"
              }}
              onClick={() => setEditingPost(post)}
            >編集</button>
          </li>
        ))}
      </ul>

      {/* 編集モーダル */}
      {editingPost && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(16,20,50,0.77)", zIndex: 9000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 18, boxShadow: "0 12px 48px #19234930",
            width: "99vw", maxWidth: 950, maxHeight: "96vh", overflowY: "auto", padding: 28,
            position: "relative"
          }}>
            <button
              style={{
                position: "absolute", right: 24, top: 20,
                background: "#eee", color: "#192349", border: "none",
                fontWeight: 900, fontSize: 20, borderRadius: "50%", width: 36, height: 36, cursor: "pointer"
              }}
              onClick={() => setEditingPost(null)}
            >×</button>
            <ArticleEditor
              blocks={editingPost.blocks}
              isEditMode
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </section>
  );
}
