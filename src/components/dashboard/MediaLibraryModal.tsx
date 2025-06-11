"use client";
import React, { useState, useEffect } from "react";

type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  tags?: string[];
  createdAt?: Date;
  thumbnailUrl?: string;
};

type Props = {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onSave: (data: { name: string; tags: string[] }) => void;
};

export default function MediaLibraryModal({ open, item, onClose, onSave }: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);

  // アイテム変更時に初期化
  useEffect(() => {
    setName(item?.name ?? "");
    setTags(item?.tags ?? []);
    setTagInput("");
  }, [item]);

  if (!open || !item) return null;

  function handleAddTag() {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), tags });
  }

  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "100vw",
      height: "100vh",
      background: "#0008",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "34px 36px",
          minWidth: 330,
          maxWidth: "90vw",
          boxShadow: "0 6px 32px 0 #0002",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 900, fontSize: 20, color: "#192349", marginBottom: 18 }}>
          メディア情報編集
        </div>
        <label style={{ color: "#192349", fontWeight: 700, display: "block", marginBottom: 12 }}>
          タイトル
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "8px 10px",
              borderRadius: 7,
              border: "1.3px solid #d7e2ed",
              fontSize: 16,
              fontWeight: 500,
              color: "#192349",
              marginBottom: 8,
            }}
            placeholder="タイトル"
            maxLength={70}
            autoFocus
          />
        </label>
        {/* タグ編集 */}
        <div style={{ color: "#192349", fontWeight: 700, marginBottom: 4 }}>タグ</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 7 }}>
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddTag(); }}
            placeholder="#タグを追加"
            style={{
              padding: "8px 10px",
              borderRadius: 7,
              border: "1.3px solid #d7e2ed",
              fontSize: 16,
              color: "#192349",
              flex: "1 1 80px",
            }}
            maxLength={32}
          />
          <button
            onClick={handleAddTag}
            type="button"
            style={{
              padding: "8px 16px",
              background: "#e8eaff",
              color: "#192349",
              borderRadius: 7,
              fontWeight: 700,
              border: "none",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            追加
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              background: "#eef3fc",
              color: "#192349",
              borderRadius: 7,
              padding: "3px 13px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              marginRight: 3,
            }}>
              #{tag}
              <span
                style={{
                  marginLeft: 6,
                  cursor: "pointer",
                  color: "#c00",
                  fontWeight: 800,
                  fontSize: 15,
                  display: "inline-block",
                  lineHeight: 1,
                }}
                onClick={() => handleRemoveTag(tag)}
                aria-label="タグ削除"
              >×</span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#eee",
              color: "#192349",
              fontWeight: 700,
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              background: "#00bbee",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: 16,
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              cursor: !name.trim() ? "not-allowed" : "pointer",
              opacity: !name.trim() ? 0.6 : 1,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
