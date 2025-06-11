"use client";
import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { getArticleViewRankingWithDetails } from "@/utils/analytics";

// 多言語ラベル
const LABELS: Record<string, Record<string, string>> = {
  ja: {
    title: "記事ランキング",
    pv: "閲覧数",
    tags: "タグ",
    edit: "編集",
    preview: "プレビュー",
    noData: "ランキングデータがありません",
  },
  en: {
    title: "Article Ranking",
    pv: "Views",
    tags: "Tags",
    edit: "Edit",
    preview: "Preview",
    noData: "No ranking data",
  },
  zh: {
    title: "文章排行榜",
    pv: "浏览数",
    tags: "标签",
    edit: "编辑",
    preview: "预览",
    noData: "暂无排名数据",
  },
  ko: {
    title: "기사 랭킹",
    pv: "조회수",
    tags: "태그",
    edit: "편집",
    preview: "미리보기",
    noData: "랭킹 데이터가 없습니다",
  },
  ar: {
    title: "تصنيف المقالات",
    pv: "المشاهدات",
    tags: "الوسوم",
    edit: "تحرير",
    preview: "معاينة",
    noData: "لا توجد بيانات تصنيف",
  },
};

// 言語自動判定
const getLang = () => {
  if (typeof window !== "undefined") {
    return (
      (navigator.language?.slice(0, 2) || "ja") as keyof typeof LABELS
    );
  }
  return "ja";
};

type RankingItem = {
  id: string;
  title: string;
  pv: number;
  tags?: string[];
};

export default function AnalyticsArticleRanking() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = getLang();
  const L = LABELS[lang] || LABELS["ja"];

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getArticleViewRankingWithDetails(10).then((list) => {
      if (!ignore) setRanking(list);
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section
      className={styles.analyticsRankingSection}
      aria-label={L.title}
      style={{
        background: "#fff",
        borderRadius: 15,
        padding: "28px 30px 20px 30px",
        boxShadow: "0 6px 28px #19234918",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 26,
          marginBottom: 25,
          color: "#192349",
          letterSpacing: 1.3,
        }}
      >
        🏆 {L.title}
      </h2>
      {loading ? (
        <div style={{ color: "#aaa", fontSize: 19, textAlign: "center" }}>
          読み込み中...
        </div>
      ) : ranking.length === 0 ? (
        <div style={{ color: "#aaa", fontSize: 18, textAlign: "center" }}>
          {L.noData}
        </div>
      ) : (
        <ol
          className={styles.analyticsRankingList}
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
          }}
        >
          {ranking.map((item, i) => (
            <li
              key={item.id}
              className={styles.analyticsRankingItem}
              style={{
                display: "flex",
                alignItems: "center",
                background: i < 3 ? "#f5fbff" : "#f8fafd",
                borderRadius: 11,
                marginBottom: 15,
                boxShadow:
                  i < 3 ? "0 2px 18px #5b8dee22" : "0 1.2px 6px #19234914",
                border:
                  i === 0
                    ? "2px solid #ffd700"
                    : i === 1
                    ? "2px solid #cfd8dc"
                    : i === 2
                    ? "2px solid #bba280"
                    : "1px solid #e3eaf6",
                padding: "18px 16px",
                position: "relative",
                gap: 12,
                minHeight: 64,
              }}
              aria-label={`${i + 1}位: ${item.title}`}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color:
                    i === 0
                      ? "#ffd700"
                      : i === 1
                      ? "#cfd8dc"
                      : i === 2
                      ? "#bba280"
                      : "#5b8dee",
                  minWidth: 34,
                  textAlign: "center",
                  userSelect: "none",
                  marginRight: 2,
                }}
                aria-label={`順位${i + 1}`}
              >
                {i === 0
                  ? "🥇"
                  : i === 1
                  ? "🥈"
                  : i === 2
                  ? "🥉"
                  : `${i + 1}`}
              </span>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#192349",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                  }}
                  aria-label={item.title}
                  title={item.title}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    fontSize: 14,
                    color: "#5b8dee",
                  }}
                >
                  <span>
                    <strong>{L.pv}:</strong>{" "}
                    <span style={{ fontWeight: 900, color: "#192349" }}>
                      {item.pv}
                    </span>
                  </span>
                  {item.tags && item.tags.length > 0 && (
                    <span
                      style={{
                        color: "#9e70e7",
                        fontWeight: 700,
                        marginLeft: 10,
                        fontSize: 13,
                      }}
                    >
                      {item.tags.map((tag) => `#${tag}`).join(" ")}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                <a
                  href={`/posts/${item.id}`}
                  target="_blank"
                  rel="noopener"
                  aria-label={L.preview}
                  style={{
                    background: "#f3f7fd",
                    color: "#1a7be5",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {L.preview}
                </a>
                <a
                  href={`/dashboard?edit=${item.id}`}
                  aria-label={L.edit}
                  style={{
                    background: "#e8ffe5",
                    color: "#00b894",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {L.edit}
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
