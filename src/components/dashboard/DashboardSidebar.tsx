import React from "react";
import { BlockType, blockTemplates } from "./dashboardConstants";
import styles from "./Dashboard.module.css";

type Props = {
  onAddBlock: (type: BlockType) => void;
};

export default function DashboardSidebar({ onAddBlock }: Props) {
  const labelColor = "#192349";
  return (
    <aside className={styles.dashboardSidebar} aria-label="ブロック追加サイドバー">
      <h2
        style={{
          fontSize: 18,
          marginBottom: 18,
          color: labelColor,
          fontWeight: 700,
          letterSpacing: 1.2,
        }}
      >
        ブロック追加
      </h2>
      {blockTemplates.map((bt) => (
        <button
          key={bt.type}
          style={{
            display: "block",
            width: "100%",
            margin: "12px 0",
            padding: "13px 0",
            borderRadius: 6,
            border: "none",
            background: "#354268",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            letterSpacing: 1.1,
          }}
          onClick={() => onAddBlock(bt.type)}
          aria-label={`ブロック追加: ${bt.label}`}
        >
          ＋ {bt.label}
        </button>
      ))}
    </aside>
  );
}
