import React from "react";
import styles from "./ArticleEditList.module.css";

type Props = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function TagButton({ label, active, onClick }: Props) {
  return (
    <button
      className={active ? styles.tagButtonActive : styles.tagButton}
      onClick={onClick}
      type="button"
    >
      {label.startsWith("#") ? label : `#${label}`}
    </button>
  );
}
