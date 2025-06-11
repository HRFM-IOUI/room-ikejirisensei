// src/components/dashboard/PreviewModal.tsx
import React from "react";
import { Block } from "./dashboardConstants";
import Image from "next/image"; // 追加

type Props = {
  open: boolean;
  blocks: Block[];
  onClose: () => void;
};

export default function PreviewModal({ open, blocks, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(10,20,30,0.84)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn .23s cubic-bezier(.41,1.3,.71,1.01)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #fff, #f8fbfc 80%)",
          borderRadius: 30,
          minWidth: 0,
          minHeight: 0,
          maxWidth: "730px",
          width: "97vw",
          maxHeight: "92vh",
          boxShadow: "0 12px 48px 0 #28346742, 0 1.5px 8px #19234924",
          overflowY: "auto",
          padding: "38px 28px 34px 28px",
          position: "relative",
          animation: "popIn .26s cubic-bezier(.61,1.8,.38,.98)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          style={{
            position: "absolute", top: 20, right: 22, fontSize: 26,
            background: "none", border: "none", color: "#6069a9",
            cursor: "pointer", fontWeight: 800
          }}
          onClick={onClose}
          aria-label="閉じる"
          type="button"
        >
          ×
        </button>
        <div style={{ marginBottom: 24, fontWeight: 900, fontSize: 28, color: "#192349", letterSpacing: 1.2 }}>
          プレビュー
        </div>
        <div>
          {blocks.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", marginTop: 80, fontSize: 20 }}>まだ何も追加されていません</div>
          ) : (
            blocks.map(block => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={block.id}
                    style={{
                      fontFamily: block.style?.fontFamily || "'Noto Sans JP', sans-serif",
                      fontSize: block.style?.fontSize || "2.1rem",
                      fontWeight: block.style?.fontWeight ?? 700,
                      color: block.style?.color || "#222222",
                      background: block.style?.backgroundColor || "transparent",
                      padding: "8px 0 2px 0",
                      borderBottom: "2px solid #e9ebf6",
                      margin: "34px 0 14px 0",
                      lineHeight: 1.24,
                    }}
                  >
                    {block.content}
                  </h2>
                );
              }
              if (block.type === "text") {
                return (
                  <p
                    key={block.id}
                    style={{
                      fontFamily: block.style?.fontFamily || "'Noto Sans JP', sans-serif",
                      fontSize: block.style?.fontSize || "1.15rem",
                      fontWeight: block.style?.fontWeight ?? 500,
                      color: block.style?.color || "#2d3144",
                      background: block.style?.backgroundColor || "transparent",
                      margin: "10px 0 18px 0",
                      lineHeight: 1.84,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {block.content}
                  </p>
                );
              }
              if (block.type === "image") {
                return block.content ? (
                  <Image
                    key={block.id}
                    src={block.content}
                    alt="アップロード画像"
                    width={510}
                    height={340}
                    style={{
                      width: "97%",
                      maxWidth: 510,
                      borderRadius: 12,
                      margin: "22px 0 18px 0",
                      boxShadow: "0 4px 26px #19234915",
                      display: "block",
                      objectFit: "contain"
                    }}
                    unoptimized // 外部URLやS3のダイレクトURL等で最適化不可の場合必須
                  />
                ) : null;
              }
              if (block.type === "video") {
                return block.content ? (
                  <video
                    key={block.id}
                    src={block.content}
                    controls
                    style={{
                      width: "97%",
                      maxWidth: 510,
                      borderRadius: 10,
                      margin: "22px 0 18px 0",
                      background: "#222",
                      boxShadow: "0 4px 26px #19234911",
                      display: "block",
                    }}
                  />
                ) : null;
              }
              return null;
            })
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.90) translateY(42px); opacity: 0; }
          60% { transform: scale(1.03) translateY(-8px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
