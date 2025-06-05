"use client";
import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import DashboardRightPanel from "./DashboardRightPanel";
import DashboardFooter from "./DashboardFooter";
import FullscreenEditorModal from "./FullscreenEditorModal";
import DashboardBackground from "./DashboardBackground"; // ★追加！
import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PRESETS,
  BG_COLOR_PRESETS,
  createBlock,
  Block,
  BlockType,
} from "./dashboardConstants";
import { addPost } from "../../utils/firestore";
import type { Post } from "../../types/post";

// プレースホルダー色をカスタムするユーティリティ
const placeholderColor = "#192349";

// 投稿モーダルUI型宣言
type PostModalProps = {
  open: boolean;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  image: string;
  setImage: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onClose: () => void;
};

function PostModal({ open, title, setTitle, image, setImage, onSubmit, onClose }: PostModalProps) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(24,28,44,0.18)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        minWidth: 380, padding: "36px 42px", background: "#fff", borderRadius: 22,
        boxShadow: "0 8px 44px 0 rgba(20,24,72,0.22)", display: "flex", flexDirection: "column",
        gap: 18, alignItems: "center", position: "relative"
      }}>
        {/* プレースホルダー色だけCSS in JSで制御 */}
        <style>{`
          .customPlaceholder::placeholder { color: ${placeholderColor}; opacity: 1; }
        `}</style>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 24, border: "none", background: "transparent",
            fontSize: 32, color: "#777", cursor: "pointer", lineHeight: 1, fontWeight: 400, opacity: 0.7,
          }}
          aria-label="閉じる"
        >×</button>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#192349", letterSpacing: 2 }}>
          記事のタイトルとサムネ画像
        </div>
        <input
          type="text"
          placeholder="タイトル（必須）"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="customPlaceholder"
          style={{ width: "100%", padding: 8, fontSize: 17, borderRadius: 8, border: "1px solid #ccc", color: "#192349" }}
        />
        <input
          type="text"
          placeholder="サムネ画像URL（任意・空欄OK）"
          value={image}
          onChange={e => setImage(e.target.value)}
          className="customPlaceholder"
          style={{ width: "100%", padding: 8, fontSize: 15, borderRadius: 8, border: "1px solid #ccc", color: "#192349" }}
        />
        <button
          onClick={onSubmit}
          style={{
            marginTop: 14, borderRadius: 11, padding: "12px 24px", background: "#1818e3",
            color: "#fff", fontWeight: 700, fontSize: 19, border: "none", letterSpacing: 1.1, cursor: "pointer"
          }}
          disabled={!title.trim()}
        >記事を投稿する</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postThumbnail, setPostThumbnail] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);

  const handleAddBlock = (type: BlockType) => {
    setBlocks([...blocks, createBlock(type)]);
  };
  const handleEditBlock = (id: string, value: string) => {
    setBlocks(bs => bs.map(b => (b.id === id ? { ...b, content: value } : b)));
  };
  const handleDelete = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const handleDragEnd = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    setBlocks(bs => {
      const moved = [...bs];
      const [item] = moved.splice(oldIndex, 1);
      moved.splice(newIndex, 0, item);
      return moved;
    });
  };
  const handlePost = async () => {
    if (!postTitle.trim() || blocks.length === 0) {
      alert("タイトルと本文（ブロック）が必要です。");
      return;
    }
    setIsPosting(true);
    try {
      const content = blocks.map(b => b.content).join("\n\n");
      const newPost: Omit<Post, "id" | "date"> = {
        title: postTitle,
        content,
        image: postThumbnail || "/logo.png",
      };
      await addPost(newPost);
      alert("記事を投稿しました！");
      setBlocks([]);
      setPostTitle("");
      setPostThumbnail("");
      setShowPostModal(false);
    } catch {
      alert("投稿に失敗しました。");
    }
    setIsPosting(false);
  };
  const handleOpenPostModal = () => setShowPostModal(true);
  const handleFullscreenSave = (val: string) => {
    if (selectedId) handleEditBlock(selectedId, val);
    setFullscreenEdit(false);
  };

  return (
    <div className={styles.dashboardWrapper}>
      <DashboardBackground /> {/* ← 背景を最初の子に追加 */}
      <div className={styles.dashboardRoot}>
        <nav className={styles.dashboardSidebar}>
          <DashboardSidebar handleAddBlock={handleAddBlock} />
        </nav>
        <main className={styles.dashboardMain}>
          <DashboardHeader />
          <DashboardMain
            blocks={blocks}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            handleEditBlock={handleEditBlock}
            handleDelete={handleDelete}
            handleDragEnd={handleDragEnd}
          />
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={handleOpenPostModal}
              className="px-10 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-900 transition"
              style={{ fontSize: 20 }}
              disabled={blocks.length === 0 || isPosting}
            >
              記事を投稿する
            </button>
          </div>
        </main>
        <aside className={styles.dashboardRight}>
          <DashboardRightPanel
            selectedBlock={blocks.find(b => b.id === selectedId)}
            handleBlockStyle={() => { }}
            FONT_OPTIONS={FONT_OPTIONS}
            FONT_SIZE_OPTIONS={FONT_SIZE_OPTIONS}
            COLOR_PRESETS={COLOR_PRESETS}
            BG_COLOR_PRESETS={BG_COLOR_PRESETS}
            onFullscreenEdit={() => setFullscreenEdit(true)}
          />
        </aside>
      </div>
      <footer className={styles.dashboardFooter}>
        <DashboardFooter />
      </footer>
      <PostModal
        open={showPostModal}
        title={postTitle}
        setTitle={setPostTitle}
        image={postThumbnail}
        setImage={setPostThumbnail}
        onSubmit={handlePost}
        onClose={() => setShowPostModal(false)}
      />
      <FullscreenEditorModal
        open={fullscreenEdit}
        value={selectedId ? blocks.find(b => b.id === selectedId)?.content ?? "" : ""}
        onClose={() => setFullscreenEdit(false)}
        onSave={handleFullscreenSave}
      />
    </div>
  );
}
