// src/components/editor/EditorControlModal.tsx
import React from "react";
import type { EditorMode } from "../dashboard/FullscreenEditorModal";

type Props = {
  open: boolean;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (n: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
  // language?: "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar"; ← 未使用なのでコメントアウト（削除でもOK）
};

const MODES: { key: EditorMode; label: string }[] = [
  { key: "default", label: "白紙" },
  { key: "note", label: "ノート" },
  { key: "genkou", label: "原稿用紙" },
];

const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;

const EditorControlModal: React.FC<Props> = ({
  open, mode, setMode, currentPage, totalPages, setCurrentPage, onSave, onCancel, onClose,
  // language = "ja", ← 未使用
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(24,28,44,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          minWidth: isMobile ? "auto" : 580,
          maxWidth: "96vw",
          width: isMobile ? "96vw" : undefined,
          padding: isMobile ? "18px 2vw" : "28px 40px",
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 8px 44px 0 rgba(20,24,72,0.22)",
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 6 : 26,
          position: "relative",
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            border: "none",
            background: "transparent",
            fontSize: 32,
            color: "#777",
            cursor: "pointer",
            lineHeight: 1,
            fontWeight: 400,
            opacity: 0.72,
          }}
          aria-label="閉じる"
        >
          ×
        </button>
        <span style={{
          fontWeight: 900,
          fontSize: isMobile ? 16 : 21,
          color: "#192349",
          marginRight: isMobile ? 8 : 20,
          letterSpacing: 2,
          minWidth: isMobile ? 65 : undefined,
        }}>
          執筆モード
        </span>
        <div
          style={{
            display: "flex",
            gap: isMobile ? 5 : 10,
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "space-between" : "flex-start",
            flex: isMobile ? 1 : undefined,
          }}
        >
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                padding: isMobile ? "7px 0" : "11px 27px",
                borderRadius: 8,
                background: mode === m.key ? "#e7ecfa" : "#fff",
                border: "1.3px solid #ccd2e7",
                fontWeight: 700,
                color: "#192349",
                fontSize: isMobile ? 15 : 17,
                cursor: "pointer",
                flex: isMobile ? 1 : undefined,
                minWidth: isMobile ? 0 : 86,
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >{m.label}</button>
          ))}
        </div>
        {/* 原稿用紙専用: ページ送り */}
        {mode === "genkou" && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginLeft: 18 }}>
            <button
              style={{
                padding: "7px 18px",
                fontSize: 17,
                borderRadius: 9,
                color: "#192349",
                border: "1.3px solid #ccd2e7",
                background: "#fff",
                fontWeight: 700,
                cursor: currentPage === 0 ? "default" : "pointer",
                opacity: currentPage === 0 ? 0.5 : 1,
              }}
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            >← 前</button>
            <span style={{
              fontWeight: 850,
              fontSize: 19,
              color: "#192349"
            }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              style={{
                padding: "7px 18px",
                fontSize: 17,
                borderRadius: 9,
                color: "#192349",
                border: "1.3px solid #ccd2e7",
                background: "#fff",
                fontWeight: 700,
                cursor: currentPage === totalPages - 1 ? "default" : "pointer",
                opacity: currentPage === totalPages - 1 ? 0.5 : 1,
              }}
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >次 →</button>
          </div>
        )}
        <button
          onClick={onCancel}
          style={{
            marginLeft: 26,
            borderRadius: 11,
            padding: "12px 20px",
            background: "#bbb",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            border: "none",
            cursor: "pointer"
          }}
        >キャンセル</button>
        <button
          onClick={onSave}
          style={{
            marginLeft: 5,
            borderRadius: 11,
            padding: "12px 24px",
            background: "#1818e3",
            color: "#fff",
            fontWeight: 700,
            fontSize: 19,
            border: "none",
            letterSpacing: 1.1,
            cursor: "pointer"
          }}
        >保存</button>
      </div>
    </div>
  );
};

export default EditorControlModal;
