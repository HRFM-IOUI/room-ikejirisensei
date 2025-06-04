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

const DefaultEditor: React.FC<Props> = ({
  value, onChange, fontFamily, fontSize, color, onFocus, onBlur
}) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: "100%",
      height: "100%",
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
  />
);

export default DefaultEditor;
