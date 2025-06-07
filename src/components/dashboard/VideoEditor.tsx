'use client';
import React, { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// YouTube URLやIDを抽出する関数
function extractYouTubeId(input: string): string {
  try {
    if (input.includes("youtu.be/")) {
      return input.split("youtu.be/")[1].split(/[?&]/)[0];
    }
    if (input.includes("youtube.com/watch")) {
      const params = new URLSearchParams(input.split("?")[1]);
      return params.get("v") || input;
    }
    return input; // IDだけの場合
  } catch {
    return input;
  }
}

type VideoType = "youtube" | "firestore";

const initialState = {
  type: "youtube" as VideoType,
  url: "",
  title: "",
  profileIcon: "",
};

export default function VideoEditor() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // 入力変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url || !form.title) {
      alert("タイトルと動画ID/URLは必須です。");
      return;
    }
    setLoading(true);
    try {
      // URLがYouTubeの場合はIDだけを抽出
      const saveUrl = form.type === "youtube" ? extractYouTubeId(form.url) : form.url;
      await addDoc(collection(db, "wannyanVideos"), {
        ...form,
        url: saveUrl, // ←ここがポイント
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      setForm(initialState);
      alert("動画を投稿しました！");
    } catch (e) {
      alert("投稿エラー: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        maxWidth: 420,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 6px 32px 0 #0001",
        padding: "36px 24px 32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#192349", marginBottom: 14 }}>
        動画を投稿
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* 動画タイプ選択 */}
        <label style={{ fontWeight: 700, color: "#192349" }}>
          動画タイプ
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={{
              marginLeft: 12,
              padding: "8px 12px",
              borderRadius: 7,
              border: "1px solid #c3d3ea",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            <option value="youtube">YouTube動画</option>
            <option value="firestore">アップロード動画URL</option>
          </select>
        </label>
        {/* タイトル */}
        <label style={{ fontWeight: 700, color: "#192349" }}>
          タイトル
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="動画タイトル"
            style={{
              marginTop: 7,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 7,
              border: "1.3px solid #d7e2ed",
              fontSize: 17,
              fontWeight: 500,
            }}
            required
          />
        </label>
        {/* YouTube動画ID または ファイルURL */}
        {form.type === "youtube" ? (
          <label style={{ fontWeight: 700, color: "#192349" }}>
            YouTube動画IDまたはURL
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="例: dQw4w9WgXcQ または https://youtu.be/dQw4w9WgXcQ"
              style={{
                marginTop: 7,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 7,
                border: "1.3px solid #d7e2ed",
                fontSize: 17,
                fontWeight: 500,
              }}
              required
            />
            <span style={{ fontSize: 12, color: "#81879b", marginLeft: 8 }}>
              ※動画IDまたはYouTubeのURLどちらでもOK
            </span>
          </label>
        ) : (
          <label style={{ fontWeight: 700, color: "#192349" }}>
            動画ファイルURL
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://..."
              style={{
                marginTop: 7,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 7,
                border: "1.3px solid #d7e2ed",
                fontSize: 17,
                fontWeight: 500,
              }}
              required
            />
            <span style={{ fontSize: 12, color: "#81879b", marginLeft: 8 }}>
              ※アップロード済み動画ファイルの直リンクURL
            </span>
          </label>
        )}
        {/* プロフィールアイコン（任意） */}
        <label style={{ fontWeight: 700, color: "#192349" }}>
          プロフィールアイコンURL（任意）
          <input
            name="profileIcon"
            value={form.profileIcon}
            onChange={handleChange}
            placeholder="https://...png"
            style={{
              marginTop: 7,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 7,
              border: "1.3px solid #d7e2ed",
              fontSize: 17,
              fontWeight: 500,
            }}
          />
        </label>
        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#5b8dee",
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            border: "none",
            borderRadius: 8,
            padding: "13px 0",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 10,
            transition: "background .18s",
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </section>
  );
}
