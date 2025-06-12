import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaTrash, FaRegStickyNote } from "react-icons/fa";
import Image from "next/image"; // 追加

export type SupportedLang = "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";

export type Block = {
  id: string;
  type: "heading" | "text" | "image" | "video";
  content: string;
  // style等の拡張はここ
};

type Props = {
  block: Block;
  index: number;
  onChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onSelect?: () => void;
  onFullscreenEdit?: (blockId: string, language: SupportedLang) => void;
  language?: SupportedLang;
};

export default function SortableBlock({
  block,
  index,
  onChange,
  onDelete,
  onSelect,
  onFullscreenEdit,
  language = "ja",
}: Props) {
  // D&Dフック
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  // ブロックタイプ別UI
  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <input
            type="text"
            value={block.content}
            onChange={e => onChange(block.id, e.target.value)}
            style={{
              width: "100%",
              fontWeight: 800,
              fontSize: 22,
              border: "none",
              outline: "none",
              background: "none",
              color: "#18191a",
              padding: "8px 10px",
            }}
            aria-label={`見出しブロック${index + 1}`}
          />
        );
      case "text":
        return (
          <textarea
            value={block.content}
            onChange={e => onChange(block.id, e.target.value)}
            style={{
              width: "100%",
              fontWeight: 500,
              fontSize: 17,
              minHeight: 56,
              border: "none",
              outline: "none",
              background: "none",
              color: "#18191a",
              padding: "8px 10px",
              resize: "vertical",
            }}
            aria-label={`テキストブロック${index + 1}`}
          />
        );
      case "image":
        return block.content ? (
          <Image
            src={block.content}
            alt="画像ブロック"
            width={600}
            height={300}
            style={{ maxWidth: "100%", borderRadius: 7, minHeight: 80, height: "auto" }}
            unoptimized
          />
        ) : (
          <input
            type="text"
            value={block.content}
            onChange={e => onChange(block.id, e.target.value)}
            placeholder="画像URLを入力"
            style={{ width: "100%" }}
            aria-label="画像URL入力"
          />
        );
      case "video":
        return block.content ? (
          <video
            src={block.content}
            controls
            style={{ maxWidth: "100%", borderRadius: 7, minHeight: 80 }}
          />
        ) : (
          <input
            type="text"
            value={block.content}
            onChange={e => onChange(block.id, e.target.value)}
            placeholder="動画URLを入力"
            style={{ width: "100%" }}
            aria-label="動画URL入力"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        alignItems: "center",
        padding: 14,
        margin: "12px 0",
        background: "#fff",
        border: "2px solid #dde2ea",
        borderRadius: 11,
        boxShadow: isDragging ? "0 6px 20px #2221" : undefined,
        transform: CSS.Transform.toString(transform),
        transition,
        minHeight: 56,
        cursor: isDragging ? "grabbing" : undefined,
      }}
      {...attributes}
    >
      {/* D&Dグリップ */}
      <button
        type="button"
        {...listeners}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          fontSize: 27,
          color: "#3a5cbe",
          width: 38,
          height: 38,
          marginRight: 17,
          userSelect: "none",
          borderRadius: 7,
          background: isDragging ? "#e3e8fc" : "#f3f5ff",
          boxShadow: isDragging ? "0 0 0 2px #5b8dee88" : undefined,
          transition: "background 0.15s, box-shadow 0.15s",
        }}
        title="ドラッグで並べ替え"
        aria-label="ドラッグで並べ替え"
        tabIndex={-1}
      >
        <FaGripVertical />
      </button>
      {/* 編集領域 */}
      <div style={{ flex: 1, minWidth: 0 }} onClick={onSelect}>
        {renderBlockContent()}
      </div>
      {/* 原稿用紙/削除 */}
      <button
        type="button"
        onClick={() => onFullscreenEdit?.(block.id, language)}
        style={{
          background: "none",
          border: "none",
          marginLeft: 8,
          marginRight: 5,
          cursor: "pointer",
          fontSize: 21,
          color: "#2c78f7",
          padding: 5,
        }}
        title="原稿用紙モード"
        aria-label="原稿用紙モード"
      >
        <FaRegStickyNote />
      </button>
      <button
        type="button"
        onClick={() => onDelete(block.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 21,
          color: "#e17055",
          padding: 5,
        }}
        title="削除"
        aria-label="ブロック削除"
      >
        <FaTrash />
      </button>
    </div>
  );
}
