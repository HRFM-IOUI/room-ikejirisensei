import React from "react";
import styles from "./ArticleEditList.module.css";

// Block型は本来グローバル定義推奨（ここではローカル定義）
type BlockType = "heading" | "text" | "image" | "video";
type Block = { id: string; type: BlockType; content: string };

type PostStatus = "published" | "draft";
type Post = {
  id: string;
  blocks: Block[];
  tags?: string[];
  createdAt?: Date | { toDate(): Date } | null;
  status?: PostStatus;
};

type Props = {
  post: Post;
  selected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onSelect: (checked: boolean) => void;
  isMobile: boolean;
};

const statusColor: Record<PostStatus, string> = {
  published: "#00b894",
  draft: "#babfca",
};

export default function ArticleListItem({
  post, selected, onEdit, onDelete, onToggleStatus, onDuplicate, onSelect, isMobile,
}: Props) {
  // 日付の整形
  let createdAtStr = "";
  if (post.createdAt) {
    if (
      typeof post.createdAt === "object" &&
      "toDate" in post.createdAt &&
      typeof post.createdAt.toDate === "function"
    ) {
      createdAtStr = post.createdAt.toDate().toLocaleString();
    } else if (post.createdAt instanceof Date) {
      createdAtStr = post.createdAt.toLocaleString();
    }
  }

  return (
    <li
      className={styles.listItem}
      style={{
        background: post.status === "draft" ? "#f5f7fa" : "#fff",
      }}
    >
      <div className={styles.listItemCheck}>
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(e.target.checked)}
          aria-label="記事を選択"
        />
      </div>
      <div className={styles.listItemMain}>
        <span className={styles.listItemTitle}>
          {post.blocks?.[0]?.content?.slice(0, 26) || "(無題)"}
        </span>
        <span className={styles.listItemDate}>
          {createdAtStr}
        </span>
        {post.tags && post.tags.length > 0 && (
          <span className={styles.listItemTags}>
            {post.tags.map((tag, i) => (
              <span key={`${tag}_${i}`} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className={styles.listItemButtons}>
        <button
          className={styles.statusButton}
          style={{ background: statusColor[post.status ?? "draft"] }}
          onClick={onToggleStatus}
          aria-label={post.status === "published" ? "下書きにする" : "公開にする"}
          type="button"
        >
          {post.status === "published" ? "公開中" : "下書き"}
        </button>
        <button
          className={styles.editButton}
          onClick={onEdit}
          aria-label="編集"
          type="button"
        >
          編集
        </button>
        <button
          className={styles.duplicateButton}
          onClick={onDuplicate}
          aria-label="複製"
          type="button"
        >
          複製
        </button>
        <button
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label="削除"
          type="button"
        >
          削除
        </button>
      </div>
    </li>
  );
}
