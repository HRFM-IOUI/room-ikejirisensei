import React, { useState, useEffect } from "react";
import DefaultEditor from "../editor/DefaultEditor";
import NoteEditor from "../editor/NoteEditor";
import GenkouViewer from "../editor/GenkouViewer";
import EditorControlButton from "../editor/EditorControlButton";
import EditorControlModal from "../editor/EditorControlModal";

export type EditorMode = "default" | "note" | "genkou";

type Props = {
  open: boolean;
  value: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function FullscreenEditorModal({
  open,
  value,
  fontFamily,
  fontSize,
  color,
  onClose,
  onSave,
}: Props) {
  const [content, setContent] = useState(value);
  const [mode, setMode] = useState<EditorMode>("default");
  const [currentPage, setCurrentPage] = useState(0);
  const [controlOpen, setControlOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(content.replace(/[\r\n]/g, "").length / 400));

  useEffect(() => {
    if (open) {
      setContent(value);
      setCurrentPage(0);
      setMode("default");
      setControlOpen(false);
    }
  }, [open, value]);

  if (!open) return null;

  const charCount = content.replace(/[\r\n]/g, "").length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24, 28, 44, 0.96)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 16px 64px 0 rgba(20,24,72,0.22)",
          padding: "12px 0 14px 0",
          width: "99vw",
          height: "97vh",
          maxWidth: "1920px",
          maxHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        <EditorControlButton
          onClick={() => setControlOpen(true)}
          position="right"
        />
        <EditorControlModal
          open={controlOpen}
          mode={mode}
          setMode={setMode}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          onSave={() => { onSave(content); setControlOpen(false); }}
          onCancel={() => { onClose(); setControlOpen(false); }}
          onClose={() => setControlOpen(false)}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 0,
            overflowY: "auto",
            minHeight: 0,
            position: "relative",
          }}
        >
          {mode === "default" && (
            <DefaultEditor
              value={content}
              onChange={setContent}
              fontFamily={fontFamily}
              fontSize={fontSize}
              color={color}
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
          {mode === "note" && (
            <NoteEditor
              value={content}
              onChange={setContent}
              fontFamily={fontFamily}
              fontSize={fontSize}
              color={color}
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
          {mode === "genkou" && (
            <>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="本文を入力（ページ自動増加・自動送り対応）"
                style={{
                  width: "98%",
                  minHeight: 85,
                  fontSize: 22,
                  fontFamily: "'Noto Serif JP', serif",
                  background: "#f8fafc",
                  border: "2px solid #e7e3bb",
                  borderRadius: 10,
                  margin: "0 auto 12px auto",
                  padding: "13px 20px",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  display: "block",
                  color: "#192349",
                }}
                spellCheck={false}
              />
              <GenkouViewer text={content} page={currentPage} />
              <div style={{ marginTop: 28, fontSize: 16, color: "#666", textAlign: "center" }}>
                文字数：{charCount}字
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
