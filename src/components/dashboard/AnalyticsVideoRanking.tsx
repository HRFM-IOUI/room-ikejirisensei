"use client";
import React, { useEffect, useState } from "react";
import { getVideoViewRankingWithDetails } from "@/utils/analytics";
import Image from "next/image"; // 追加

// 多言語ラベル（必要なら拡張可能）
const LABELS: Record<string, Record<string, string>> = {
  ja: {
    title: "動画再生数ランキング",
    pv: "再生",
    noData: "動画がありません",
    loading: "読み込み中...",
  },
  en: {
    title: "Top Videos",
    pv: "plays",
    noData: "No videos",
    loading: "Loading...",
  },
  zh: {
    title: "视频排行榜",
    pv: "播放",
    noData: "暂无视频",
    loading: "加载中...",
  },
  ko: {
    title: "비디오 랭킹",
    pv: "재생",
    noData: "비디오가 없습니다",
    loading: "로딩 중...",
  },
  ar: {
    title: "تصنيف الفيديوهات",
    pv: "تشغيل",
    noData: "لا توجد فيديوهات",
    loading: "جارٍ التحميل...",
  },
};

const getLang = () => {
  if (typeof window !== "undefined") {
    return (navigator.language?.slice(0, 2) || "ja") as keyof typeof LABELS;
  }
  return "ja";
};

type VideoItem = {
  id: string;
  title: string;
  pv: number;
  tags?: string[];
  thumbnail?: string | null;
};

export default function AnalyticsVideoRanking() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const lang = getLang();
  const L = LABELS[lang] || LABELS["ja"];

  useEffect(() => {
    getVideoViewRankingWithDetails(10).then((res: VideoItem[]) => {
      setVideos(res);
      setLoading(false);
    });
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px #2221bb10",
        padding: "34px 28px",
        minWidth: 340,
        margin: "0 auto",
        maxWidth: 520,
      }}
    >
      <h2 style={{
        fontWeight: 900,
        fontSize: 23,
        color: "#192349",
        marginBottom: 23,
        letterSpacing: 1.1,
      }}>
        🎬 {L.title}
      </h2>
      {loading ? (
        <div style={{ color: "#888", fontSize: 16 }}>{L.loading}</div>
      ) : videos.length === 0 ? (
        <div style={{ color: "#888" }}>{L.noData}</div>
      ) : (
        <ol style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {videos.map((v, idx) => (
            <li
              key={v.id}
              style={{
                fontWeight: idx === 0 ? 900 : 600,
                marginBottom: 14,
                fontSize: idx === 0 ? 20 : 17,
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: idx < videos.length - 1 ? "1px solid #eef2fa" : "none",
                paddingBottom: 9,
              }}
            >
              {v.thumbnail && (
                <Image
                  src={v.thumbnail}
                  alt={v.title}
                  width={48}
                  height={32}
                  style={{
                    width: 48,
                    height: 32,
                    objectFit: "cover",
                    borderRadius: 5,
                    background: "#eee",
                    marginRight: 8,
                  }}
                  loading="lazy"
                  unoptimized
                />
              )}
              <span style={{
                fontSize: 18,
                color: "#5b8dee",
                fontWeight: 900,
                marginRight: 6,
                minWidth: 32,
              }}>
                {idx + 1}位
              </span>
              <span style={{
                flex: 1,
                minWidth: 0,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}>
                {v.title || "(無題)"}
                {v.tags && v.tags.length > 0 && (
                  <span style={{
                    color: "#9e70e7",
                    fontWeight: 700,
                    fontSize: 13,
                    marginLeft: 7,
                  }}>
                    {v.tags.map(tag => `#${tag}`).join(" ")}
                  </span>
                )}
              </span>
              <span style={{
                color: "#27ae60",
                fontWeight: 800,
                minWidth: 60,
                textAlign: "right",
              }}>
                {v.pv || 0} {L.pv}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
