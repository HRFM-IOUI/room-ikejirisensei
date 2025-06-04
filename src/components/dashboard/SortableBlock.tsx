import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "./dashboardConstants";
import styles from "./Dashboard.module.css";
import { FaGripVertical, FaTrash } from "react-icons/fa";
import Image from "next/image";

type Props = {
  block: Block;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  handleEditBlock: (id: string, value: string) => void;
  handleDelete: (id: string) => void;
};

export default function SortableBlock({
  block,
  selectedId,
  setSelectedId,
  handleEditBlock,
  handleDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  // D&D影・アニメーションと幅いっぱい
  const style: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    marginBottom: 26,
    padding: "24px 30px",
    position: "relative",
    background: selectedId === block.id ? "#f1f8fd" : "#fff",
    border: "2px solid " + (selectedId === block.id ? "#5b8dee" : "#dde2ea"),
    borderRadius: 14,
    boxShadow: isDragging
      ? "0 12px 32px 0 rgba(91, 141, 238, 0.22), 0 1.5px 5px 0 rgba(0,0,0,0.09)"
      : selectedId === block.id
      ? "0 0 0 2.5px #5b8dee44"
      : "0 2px 8px 0 rgba(30,40,80,0.04)",
    cursor: isDragging ? "grabbing" : "pointer",
    opacity: isDragging ? 0.82 : 1,
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "box-shadow 0.18s cubic-bezier(.44,1.54,.85,1), opacity 0.17s, transform 0.22s, border 0.2s",
    zIndex: isDragging ? 3 : "auto",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    minHeight: block.type === "heading" ? 72 : 68,
  };

  // style共通部分
  const commonInputStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "none",
    color: block.style?.color || "#18191a",
    fontFamily: block.style?.fontFamily || "Noto Sans JP, Arial, sans-serif",
    backgroundColor: block.style?.backgroundColor || "transparent",
    textDecoration: block.style?.textDecoration || "",
    transition: "color .2s, font-family .2s, font-size .2s, background .2s, text-decoration .2s",
    padding: 0,
    boxSizing: "border-box",
  };

  const inputStyle: React.CSSProperties =
    block.type === "heading"
      ? {
          ...commonInputStyle,
          fontWeight: block.style?.fontWeight || 800,
          fontSize: block.style?.fontSize || "2.2rem",
          lineHeight: 1.35,
        }
      : {
          ...commonInputStyle,
          fontWeight: block.style?.fontWeight || 500,
          fontSize: block.style?.fontSize || "1.24rem",
          minHeight: 58,
          resize: "vertical",
          lineHeight: 1.85,
        };

  return (
    <div
      ref={setNodeRef}
      className={styles.sortableBlock}
      style={style}
      onClick={() => setSelectedId(block.id)}
      tabIndex={0}
    >
      {/* グリップと削除 */}
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          display: "flex",
          gap: 13,
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <span
          {...attributes}
          {...listeners}
          style={{
            color: "#5b8dee",
            fontWeight: 700,
            cursor: "grab",
            fontSize: 25,
            userSelect: "none",
            display: "flex",
            alignItems: "center",
          }}
          tabIndex={-1}
          title="ドラッグして並べ替え"
        >
          <FaGripVertical />
        </span>
        <button
          onClick={e => {
            e.stopPropagation();
            handleDelete(block.id);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#e17055",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 21,
            display: "flex",
            alignItems: "center",
          }}
          title="削除"
        >
          <FaTrash />
        </button>
      </div>

      {/* インライン編集UI */}
      <div style={{ flex: 1, width: "100%" }}>
        {block.type === "heading" ? (
          <input
            style={inputStyle}
            value={block.content}
            onChange={e => handleEditBlock(block.id, e.target.value)}
            spellCheck={false}
          />
        ) : block.type === "text" ? (
          <textarea
            style={inputStyle}
            value={block.content}
            onChange={e => handleEditBlock(block.id, e.target.value)}
            spellCheck={false}
          />
        ) : block.type === "image" ? (
          block.content ? (
            <Image
              src={block.content}
              alt="アップロード画像"
              style={{ maxWidth: "100%", borderRadius: 8 }}
              width={600}
              height={350}
              unoptimized
            />
          ) : (
            <input
              type="text"
              placeholder="画像URLを入力"
              value={block.content}
              onChange={e => handleEditBlock(block.id, e.target.value)}
              style={{ width: "100%" }}
            />
          )
        ) : block.type === "video" ? (
          block.content ? (
            <video
              src={block.content}
              controls
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : (
            <input
              type="text"
              placeholder="動画URLを入力"
              value={block.content}
              onChange={e => handleEditBlock(block.id, e.target.value)}
              style={{ width: "100%" }}
            />
          )
        ) : null}
      </div>
    </div>
  );
}
