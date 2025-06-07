"use client";
import React, { useState, useRef } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // deleteObject削除
import { db, storage } from "@/firebase";
import Image from "next/image"; // 追加

type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  tags?: string[];
  createdAt?: Date;
};

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初回一覧取得
  React.useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    const snap = await getDocs(collection(db, "media"));
    setMediaList(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MediaItem[]
    );
  }

  // アップロード
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.type.startsWith("image") ? "image" : "video";
    const fileRef = ref(storage, `media/${file.name}_${Date.now()}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await addDoc(collection(db, "media"), {
      url,
      name: file.name,
      type: ext,
      createdAt: new Date(),
    });
    setUploading(false);
    fetchMedia();
  }

  // 削除
  async function handleDelete(item: MediaItem) {
    if (!window.confirm("本当に削除しますか？")) return;
    await deleteDoc(doc(db, "media", item.id));
    // Cloud Storageファイルも消す場合は、ファイルパスの管理が必要です
    fetchMedia();
  }

  // プレビュー
  function openPreview(url: string, type: "image" | "video") {
    setPreviewUrl(url);
    setPreviewType(type);
  }

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
      {/* サイドバー */}
      <aside
        style={{
          minWidth: 220,
          maxWidth: 260,
          borderRight: "1px solid #eee",
          padding: "16px 8px",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10 }}>検索・タグ・フィルタ</div>
        <input
          type="text"
          placeholder="検索..."
          style={{ width: "100%", marginBottom: 14, padding: 6 }}
          readOnly
        />
        <div style={{ fontSize: 13, color: "#666", margin: "10px 0" }}>タグ:</div>
        <div>
          <span style={{ background: "#f5f5f5", borderRadius: 8, padding: "4px 12px", marginRight: 8 }}>#photo</span>
          <span style={{ background: "#f5f5f5", borderRadius: 8, padding: "4px 12px" }}>#movie</span>
        </div>
      </aside>
      {/* メイン */}
      <div style={{ flex: 1 }}>
        {/* アップロードUI */}
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            background: "#f8f8f8",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "#00bbee",
              color: "#fff",
              fontWeight: 800,
              padding: "12px 32px",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {uploading ? "アップロード中..." : "画像/動画をアップロード"}
          </button>
        </div>
        {/* メディアグリッド */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 20,
            width: "100%",
          }}
        >
          {mediaList.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 3px 16px #2221bb11",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={item.name}
                  width={320}
                  height={180}
                  style={{ maxWidth: "100%", borderRadius: 8, cursor: "pointer", marginBottom: 10, objectFit: "cover" }}
                  onClick={() => openPreview(item.url, "image")}
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  style={{ width: "100%", borderRadius: 8, cursor: "pointer", marginBottom: 10, background: "#000" }}
                  onClick={() => openPreview(item.url, "video")}
                />
              )}
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{item.name}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  style={{
                    background: "#eee",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 14px",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                  type="button"
                >
                  URLコピー
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  style={{
                    background: "#ffeaea",
                    border: "none",
                    color: "#c00",
                    borderRadius: 6,
                    padding: "5px 14px",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                  type="button"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* プレビューモーダル */}
      {previewUrl && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "#0008",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
          }}
          onClick={() => {
            setPreviewUrl(null);
            setPreviewType(null);
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, padding: 30 }}>
            {previewType === "video" ? (
              <video src={previewUrl} controls style={{ maxWidth: 500, maxHeight: 400, background: "#000" }} />
            ) : (
              <Image
                src={previewUrl}
                alt="media"
                width={500}
                height={400}
                style={{ maxWidth: 500, maxHeight: 400, borderRadius: 12, objectFit: "contain" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
