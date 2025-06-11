// src/components/editor/DefaultEditor.tsx
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

const DefaultEditor: React.FC<Props> = ({
  value, onChange, fontFamily, fontSize, color, onFocus, onBlur, language = "ja"
}) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: "100%",
      height: "100%",
      minHeight: 300,
      maxHeight: 800,
      fontFamily: fontFamily || "Noto Sans JP, Arial, sans-serif",
      fontSize: fontSize || "1.2rem",
      color: color || "#192349",
      background: "#f9fafc",
      border: "none",
      outline: "none",
      borderRadius: 10,
      padding: "22px 24px",
      fontWeight: 600,
      lineHeight: 2,
      letterSpacing: 0.5,
      resize: "none",
      boxSizing: "border-box",
    }}
    spellCheck={false}
    onFocus={onFocus}
    onBlur={onBlur}
    aria-label={`エディタ (${language})`}
  />
);

export default DefaultEditor;
