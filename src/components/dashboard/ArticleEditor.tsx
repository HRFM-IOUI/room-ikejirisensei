"use client";
import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Block } from "./dashboardConstants";
import SortableBlock from "./SortableBlock";

type SupportedLang = "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  blocks: Block[];
  isEditMode?: boolean;
  onSave: (title: string, blocks: Block[], tags?: string[]) => Promise<void> | void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
  onBlockSelect?: (id: string | null) => void;
  onFullscreenEdit?: (blockId: string, language: SupportedLang) => void;
  fullscreenLanguage?: SupportedLang;
  onAddBlock: (type: Block["type"]) => void;
  onDeleteBlock: (id: string) => void;
  onBlockChange: (id: string, value: string) => void;
  onSortBlocks: (activeId: string, overId: string) => void;
};

export default function ArticleEditor({
  title,
  setTitle,
  blocks,
  isEditMode = false,
  onSave,
  tags = [],
  setTags,
  onBlockSelect,
  onFullscreenEdit,
  fullscreenLanguage = "ja",
  onAddBlock,
  onDeleteBlock,
  onBlockChange,
  onSortBlocks,
}: Props) {
  const [tagInput, setTagInput] = React.useState("");
  const [blockLanguage, setBlockLanguage] = React.useState<SupportedLang>(fullscreenLanguage);
  const [autoTitleActive, setAutoTitleActive] = React.useState(true);

  // D&Dのセンサー
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // 並び替えイベント
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active?.id && over?.id && active.id !== over.id) {
      onSortBlocks(String(active.id), String(over.id));
    }
  };

  // タグ追加/削除
  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val) && val.length <= 20) {
      setTags?.([...tags, val]);
      setTagInput("");
    } else if (val.length > 20) {
      alert("タグは20文字以内で入力してください。");
    }
  };
  const handleDeleteTag = (tag: string) => {
    setTags?.(tags.filter(t => t !== tag));
  };

  // タイトル自動生成（先頭blockの最初の30字を候補に）
  React.useEffect(() => {
    if (!autoTitleActive || title.trim()) return;
    const firstContent = blocks.find(b => b.content?.trim())?.content?.trim();
    if (firstContent) {
      let autoTitle = firstContent.split(/[\n。.!?]/)[0].slice(0, 30);
      if (autoTitle.length < firstContent.length) autoTitle += "…";
      setTitle(`（自動生成: ${autoTitle}）`);
    }
  }, [blocks, autoTitleActive, title, setTitle]);

  // 手動タイトル入力で自動生成解除
  const handleTitleChange = (v: string) => {
    setTitle(v);
    setAutoTitleActive(false);
  };

  // 記事保存
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.startsWith("（自動生成: ")) {
      alert("タイトルを入力してください。");
      return;
    }
    if (title.length > 120) {
      alert("タイトルは120文字以内で入力してください。");
      return;
    }
    if (
      !blocks.length ||
      blocks.every(b => {
        if (b.type === "heading" || b.type === "text") {
          return !b.content.trim();
        }
        if (b.type === "image" || b.type === "video") {
          return !b.content;
        }
        return true;
      })
    ) {
      alert("本文が空です。");
      return;
    }
    onSave(title.trim(), blocks, tags);
  };

  // 言語選択肢
  const languageOptions = [
    { label: "日本語", value: "ja" },
    { label: "English", value: "en" },
    { label: "Türkçe", value: "tr" },
    { label: "中文", value: "zh" },
    { label: "한국어", value: "ko" },
    { label: "Русский", value: "ru" },
    { label: "العربية", value: "ar" },
  ];

  return (
    <form
      onSubmit={handleSave}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        width: "100%",
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: isEditMode ? "0 3px 18px #19234920" : undefined,
        padding: isEditMode ? "18px 16px" : "12px 0",
      }}
      aria-label={isEditMode ? "記事を編集" : "新規記事作成"}
    >
      <h3 style={{
        fontWeight: 800,
        fontSize: 18,
        color: "#192349",
        marginBottom: 6,
        letterSpacing: 0.5,
      }}>
        {isEditMode ? "記事を編集" : "新規記事作成"}
      </h3>
      {/* タイトル入力 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
        <label htmlFor="title-input" style={{
          fontWeight: 700, color: "#192349", marginBottom: 2, fontSize: 15
        }}>
          タイトル <span style={{ color: "#e36", fontSize: 12, fontWeight: 500 }}>*必須</span>
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="タイトルを入力（最大120文字）"
          maxLength={120}
          style={{
            width: "100%",
            padding: "8px 14px",
            borderRadius: 7,
            border: "1.5px solid #ccd5f2",
            fontSize: 17,
            fontWeight: 700,
            color: "#192349"
          }}
          aria-label="記事タイトル"
          required
        />
        {autoTitleActive && (
          <span style={{
            color: "#5b8dee", fontSize: 13, fontWeight: 500, cursor: "pointer",
            marginTop: 2, alignSelf: "flex-start"
          }}
            onClick={() => setAutoTitleActive(false)}
            role="button"
            tabIndex={0}
          >
            タイトルは本文から自動生成中 / クリックで手入力モード
          </span>
        )}
      </div>
      {/* タグ編集 */}
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6
      }}>
        <span style={{ fontWeight: 700, color: "#192349", marginRight: 5 }}>タグ:</span>
        {tags.map((tag, i) => (
          <span
            key={`${tag}_${i}`}
            style={{
              background: "#e3e8fc",
              color: "#192349",
              borderRadius: 8,
              padding: "2px 12px",
              fontWeight: 700,
              fontSize: 13,
              marginRight: 4,
              marginBottom: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {tag}
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#888",
                marginLeft: 3,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                padding: 0,
              }}
              onClick={() => handleDeleteTag(tag)}
              aria-label={`タグ「${tag}」を削除`}
              tabIndex={0}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          placeholder="タグを追加"
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid #ccd5f2",
            fontSize: 14,
            minWidth: 90,
          }}
          maxLength={20}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          aria-label="新しいタグを入力"
        />
        <button
          type="button"
          onClick={handleAddTag}
          style={{
            background: "#5b8dee",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            padding: "6px 15px",
            marginLeft: 6,
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>
      {/* 言語選択 */}
      {onFullscreenEdit && (
        <div style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, color: "#192349" }}>原稿用紙言語:</span>
          <select
            value={blockLanguage}
            onChange={e => setBlockLanguage(e.target.value as SupportedLang)}
            style={{
              fontWeight: 700,
              borderRadius: 7,
              border: "1.2px solid #e0e4ef",
              padding: "6px 13px",
              fontSize: 15,
            }}
            aria-label="原稿用紙言語"
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
      {/* D&Dブロックリスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {blocks.map((block, idx) => (
              <SortableBlock
                key={`${block.id}_${idx}`}
                block={block}
                index={idx}
                onSelect={() => onBlockSelect?.(block.id)}
                onFullscreenEdit={
                  onFullscreenEdit
                    ? (blockId: string) => onFullscreenEdit(blockId, blockLanguage)
                    : undefined
                }
                language={blockLanguage}
                onChange={onBlockChange}
                onDelete={onDeleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {/* ブロック追加 */}
      <div>
        <button
          type="button"
          onClick={() => onAddBlock("text")}
          style={{
            background: "#e3e8fc",
            color: "#192349",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            padding: "7px 22px",
            marginTop: 5,
            cursor: "pointer",
          }}
        >
          ＋ 段落を追加
        </button>
      </div>
      {/* 保存ボタン */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          type="submit"
          style={{
            background: "#5b8dee",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 17,
            padding: "11px 30px",
            cursor: "pointer",
          }}
        >
          {isEditMode ? "保存する" : "公開する"}
        </button>
      </div>
    </form>
  );
}
