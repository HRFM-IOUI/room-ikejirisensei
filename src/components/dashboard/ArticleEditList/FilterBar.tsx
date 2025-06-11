import React from "react";
import TagButton from "./TagButton";
import styles from "./ArticleEditList.module.css";

type Props = {
  searchText: string;
  setSearchText: (val: string) => void;
  allTags: string[];
  filterTag: string | null;
  setFilterTag: (val: string | null) => void;
  isMobile: boolean;
};

export default function FilterBar({
  searchText, setSearchText, allTags, filterTag, setFilterTag, isMobile
}: Props) {
  return (
    <div className={styles.filterBar} style={{
      flexDirection: isMobile ? "column" : "row"
    }}>
      <input
        type="text"
        value={searchText}
        placeholder="記事テキスト検索..."
        onChange={e => setSearchText(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.tagsFilter}>
        <span>タグで絞込:</span>
        <TagButton
          label="全て"
          active={!filterTag}
          onClick={() => setFilterTag(null)}
        />
        {allTags.map(tag => (
          <TagButton
            key={tag}
            label={tag}
            active={filterTag === tag}
            onClick={() => setFilterTag(tag)}
          />
        ))}
      </div>
    </div>
  );
}
