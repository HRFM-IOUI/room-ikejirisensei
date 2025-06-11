import React from "react";
import styles from "./Dashboard.module.css";

type Props = {
  onPublish: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
};

export default function DashboardFooter({
  onPublish,
  onSaveDraft,
  onPreview
}: Props) {
  return (
    <footer className={styles.dashboardFooter}>
      <button
        style={{
          background: "#5b8dee", color: "#ffffff", border: "none", borderRadius: 5, padding: "9px 22px",
          fontWeight: 700, fontSize: 17, marginRight: 8, letterSpacing: 1
        }}
        onClick={onPublish}
      >
        投稿・公開
      </button>
      <button
        style={{
          background: "#b2bec3", color: "#ffffff", border: "none", borderRadius: 5, padding: "9px 22px",
          fontWeight: 700, fontSize: 17, marginRight: 8, letterSpacing: 1
        }}
        onClick={onSaveDraft}
      >
        下書き保存
      </button>
      <button
        style={{
          background: "#ffffff", color: "#5b8dee", border: "1.5px solid #5b8dee", borderRadius: 5, padding: "9px 22px",
          fontWeight: 700, fontSize: 17, letterSpacing: 1
        }}
        onClick={onPreview}
      >
        プレビュー
      </button>
    </footer>
  );
}
