import React from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  onFocus?: () => void; // 追加
  onBlur?: () => void;  // 追加
};

const lineCount = 17; // ノートの行数
const lineColor = "#b9cbe9";
const noteHeight = 500;
const noteWidth = 1000; // 任意の仮決め（実際は親の幅を参照することもあり）

const NoteEditor: React.FC<Props> = ({
  value, onChange, fontFamily, fontSize, color, onFocus, onBlur
}) => (
  <div style={{
    position: "relative",
    width: "100%",
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
    />
  </div>
);

export default NoteEditor;
