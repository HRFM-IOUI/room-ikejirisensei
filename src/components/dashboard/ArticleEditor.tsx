'use client';
import React, { useState, useEffect } from "react";
import { Block, createBlock } from "./dashboardConstants";
import SortableBlock from "./SortableBlock";
import FullscreenEditorModal from "./FullscreenEditorModal";

type Props = {
  blocks?: Block[];
  selectedId?: string | null;
  setSelectedId?: (id: string | null) => void;
  handleEditBlock?: (id: string, value: string) => void;
  handleDelete?: (id: string) => void;
  isEditMode?: boolean;
  onSave?: (blocks: Block[]) => void;
};

export default function ArticleEditor({
  blocks: initialBlocks = [],
  selectedId: propSelectedId = null,
  setSelectedId: propSetSelectedId,
  handleEditBlock: propHandleEditBlock,
  handleDelete: propHandleDelete,
  isEditMode = false,
  onSave,
}: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(propSelectedId);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);

  // 外部stateと同期
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [JSON.stringify(initialBlocks)]);

  // ブロック追加
  const handleAddBlock = (type: string) => {
    setBlocks(bs => [...bs, createBlock(type as Block["type"])]);
  };

  // ブロック編集
  const handleEditBlock = (id: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, content: value } : b));
  };

  // ブロックスタイル
  const handleBlockStyle = (id: string, style: Partial<Block['style']>) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, style: { ...b.style, ...style } } : b));
  };

  // 削除
  const handleDelete = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // フルスクリーン保存
  const handleSaveFullscreen = (value: string) => {
    if (!selectedId) return;
    setBlocks(bs =>
      bs.map(b => b.id === selectedId ? { ...b, content: value } : b)
    );
    setFullscreenEdit(false);
  };

  // 編集保存
  const handleEditSave = () => {
    if (onSave) onSave(blocks);
  };

  // 選択中ブロック
  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 24,
        width: "100%",
        alignItems: "flex-start",
        minHeight: 480,
        justifyContent: "center",
      }}
    >
      {/* メイン */}
      <main
        style={{
          flex: 1,
          background: "#fff",
          borderRadius: 18,
          minHeight: 480,
          boxShadow: "0 6px 24px #19234914",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
          transition: "max-width 0.2s",
        }}
      >
        {blocks.length === 0 ? (
          <div style={{ color: "#aaa", fontWeight: 700, fontSize: 20, margin: 60 }}>
            ブロックを追加してください
          </div>
        ) : (
          blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              selectedId={selectedId || ""}
              setSelectedId={propSetSelectedId || setSelectedId}
              handleEditBlock={propHandleEditBlock || handleEditBlock}
              handleDelete={propHandleDelete || handleDelete}
            />
          ))
        )}

        {/* フッター・保存ボタン（編集時のみ） */}
        <div style={{ width: "100%", textAlign: "center", marginTop: 18 }}>
          {isEditMode && onSave && (
            <button
              onClick={handleEditSave}
              style={{
                background: "#5b8dee",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "14px 48px",
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: 1,
                cursor: "pointer",
                marginTop: 18,
                boxShadow: "0 2px 8px #5b8dee26",
              }}
            >
              編集を保存する
            </button>
          )}
        </div>
      </main>
      {/* フルスクリーンモーダル */}
      {selectedBlock && (
        <FullscreenEditorModal
          open={fullscreenEdit}
          value={selectedBlock.content}
          fontFamily={selectedBlock.style?.fontFamily}
          fontSize={selectedBlock.style?.fontSize}
          color={selectedBlock.style?.color}
          onClose={() => setFullscreenEdit(false)}
          onSave={handleSaveFullscreen}
        />
      )}
    </div>
  );
}
