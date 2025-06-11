"use client";
import React, { useEffect, useState } from "react";
import { getReferralStats } from "@/utils/analytics";

// 多言語ラベル
const LABELS: Record<string, Record<string, string>> = {
  ja: {
    title: "流入元チャネル分析",
    label: "流入元",
    count: "訪問数",
    loading: "読み込み中...",
    noData: "データがありません",
  },
  en: {
    title: "Referral Source Analytics",
    label: "Source",
    count: "Visits",
    loading: "Loading...",
    noData: "No data",
  },
  zh: {
    title: "流量来源分析",
    label: "来源",
    count: "访问次数",
    loading: "加载中...",
    noData: "暂无数据",
  },
  ko: {
    title: "유입 경로 분석",
    label: "경로",
    count: "방문수",
    loading: "로딩 중...",
    noData: "데이터가 없습니다",
  },
  ar: {
    title: "تحليل مصادر الإحالة",
    label: "المصدر",
    count: "عدد الزيارات",
    loading: "جارٍ التحميل...",
    noData: "لا توجد بيانات",
  },
};

const getLang = (): keyof typeof LABELS => {
  if (typeof window !== "undefined") {
    return (navigator.language?.slice(0, 2) as keyof typeof LABELS) || "ja";
  }
  return "ja";
};

type ReferralStat = {
  key: string;
  label: string;
  count: number;
};

export default function AnalyticsReferralSources() {
  const [stats, setStats] = useState<ReferralStat[]>([]);
  const [loading, setLoading] = useState(true);

  const lang = getLang();
  const L = LABELS[lang] || LABELS["ja"];

  useEffect(() => {
    setLoading(true);
    getReferralStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  // 最大値（グラフの比率用）
  const max = Math.max(...stats.map((s) => s.count), 1);

  return (
    <section
      aria-label={L.title}
      style={{
        background: "#fff",
        borderRadius: 15,
        padding: "28px 30px 22px 30px",
        boxShadow: "0 6px 28px #19234914",
        maxWidth: 700,
        margin: "34px auto",
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 26,
          marginBottom: 20,
          color: "#192349",
          letterSpacing: 1.2,
        }}
      >
        🌏 {L.title}
      </h2>
      {loading ? (
        <div style={{ color: "#aaa", fontSize: 19, textAlign: "center" }}>{L.loading}</div>
      ) : stats.every(s => s.count === 0) ? (
        <div style={{ color: "#aaa", fontSize: 17, textAlign: "center" }}>{L.noData}</div>
      ) : (
        <div style={{ width: "100%", marginTop: 10 }}>
          {stats.map((r) => (
            <div
              key={r.key}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 17,
                gap: 17,
                background: "#f9fbfd",
                borderRadius: 9,
                padding: "11px 19px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  minWidth: 100,
                  color: "#1962c6",
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 13,
                  background: "#c5d8fb",
                  borderRadius: 7,
                  marginLeft: 8,
                  marginRight: 12,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${Math.max((r.count / max) * 100, 7)}%`,
                    background: "#2de376",
                    height: "100%",
                    borderRadius: 7,
                  }}
                  aria-label={`${r.label} ${r.count}件`}
                />
              </div>
              <div
                style={{
                  background: "#5b8dee",
                  borderRadius: 7,
                  color: "#fff",
                  fontWeight: 900,
                  padding: "5px 18px",
                  fontSize: 16,
                  minWidth: 55,
                  textAlign: "center",
                }}
              >
                {r.count.toLocaleString()} {L.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
