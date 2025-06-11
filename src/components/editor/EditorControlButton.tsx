// src/components/editor/EditorControlButton.tsx
import React from "react";
import { FiMoreHorizontal } from "react-icons/fi";

type Props = {
  onClick?: () => void;
  position?: string; // 例: "right" など
};

const EditorControlButton: React.FC<Props> = ({ onClick, position }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#fff",
        color: "#7c80ff",
        border: "2px solid #7c80ff",
        borderRadius: 9,
        padding: "11px 22px",
        fontWeight: 900,
        fontSize: 20,
        position: "relative",
        boxShadow: "0 2px 8px #dbe6ff55",
        cursor: "pointer",
        ...(position === "right" ? { float: "right" } : {})
      }}
      aria-label="エディタ制御"
    >
      <FiMoreHorizontal size={26} style={{ marginRight: 6, verticalAlign: -3 }} />
      設定
    </button>
  );
};

export default EditorControlButton;
