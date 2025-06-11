// src/components/editor/NoteEditor.tsx
import React from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  language?: "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";
};

const getLineCount = (lang: string) => {
  // 言語によってノート行数を調整（例：アラビア語/トルコ語/英語は18などに対応可）
  switch (lang) {
    case "ar":
    case "tr":
    case "en":
    case "ru":
      return 18;
    case "zh":
    case "ko":
      return 17;
    default:
      return 17;
  }
};

const noteHeight = 500;
const noteWidth = 1000;
const lineColor = "#b9cbe9";

const NoteEditor: React.FC<Props> = ({
  value,
  onChange,
  fontFamily,
  fontSize,
  color,
  onFocus,
  onBlur,
  language = "ja"
}) => {
  const lineCount = getLineCount(language);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: 300,
      maxHeight: 650,
      height: noteHeight,
      background: "#f9fbfd",
      borderRadius: 12,
      boxShadow: "0 1px 10px 0 #e2e8f6",
      overflow: "hidden",
      margin: "0 auto"
    }}>
      {/* 背景の横線 */}
      <svg
        width="100%"
        height={noteHeight}
        viewBox={`0 0 ${noteWidth} ${noteHeight}`}
        style={{ position: "absolute", left: 0, top: 0, zIndex: 0 }}
        preserveAspectRatio="none"
      >
        {[...Array(lineCount)].map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={35 + i * 28}
            x2={noteWidth}
            y2={35 + i * 28}
            stroke={lineColor}
            strokeWidth="1"
          />
        ))}
        {/* 左端の赤線 */}
        <line x1={54} y1={0} x2={54} y2={noteHeight} stroke="#ff5d5d" strokeWidth="2" />
      </svg>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 200,
          maxHeight: 630,
          fontFamily: fontFamily || "Noto Sans JP, Arial, sans-serif",
          fontSize: fontSize || "1.2rem",
          color: color || "#1a1a1a",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "32px 24px 20px 68px",
          fontWeight: 600,
          lineHeight: "2.2",
          letterSpacing: 0.5,
          resize: "none",
          boxSizing: "border-box",
          zIndex: 1,
        }}
        spellCheck={false}
        aria-label="ノートエディタ"
      />
    </div>
  );
};

export default NoteEditor;
