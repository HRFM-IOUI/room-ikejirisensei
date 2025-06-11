"use client";
import React, { useEffect, useState } from "react";
import { getUserCountsByDate } from "@/utils/analytics";

// 多言語ラベル
const LABELS: Record<string, Record<string, string>> = {
  ja: {
    title: "会員登録者数",
    total: "合計ユーザー数",
    today: "今日の新規登録",
    last7: "直近7日間",
    loading: "読み込み中...",
    users: "人",
    noData: "データがありません",
  },
  en: {
    title: "User Signups",
    total: "Total Users",
    today: "New Today",
    last7: "Last 7 Days",
    loading: "Loading...",
    users: "",
    noData: "No data",
  },
  zh: {
    title: "注册用户数",
    total: "用户总数",
    today: "今日新增",
    last7: "最近7天",
    loading: "加载中...",
    users: "人",
    noData: "暂无数据",
  },
  ko: {
    title: "회원 가입 수",
    total: "총 사용자",
    today: "오늘 신규",
    last7: "최근 7일",
    loading: "로딩 중...",
    users: "명",
    noData: "데이터가 없습니다",
  },
  ar: {
    title: "عدد المسجلين",
    total: "إجمالي المستخدمين",
    today: "جديد اليوم",
    last7: "آخر 7 أيام",
    loading: "جارٍ التحميل...",
    users: "",
    noData: "لا توجد بيانات",
  },
};

const getLang = (): keyof typeof LABELS => {
  if (typeof window !== "undefined") {
    return (
      (navigator.language?.slice(0, 2) || "ja") as keyof typeof LABELS
    );
  }
  return "ja";
};

type UserStat = {
  date: string; // YYYY-MM-DD
  count: number;
};

export default function AnalyticsUserCount() {
  const [stats, setStats] = useState<UserStat[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [today, setToday] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const lang = getLang();
  const L = LABELS[lang] || LABELS["ja"];

  useEffect(() => {
    setLoading(true);
    getUserCountsByDate().then(({ dates, userCounts }) => {
      // 直近7日分
      const last7 = dates.slice(-7);
      const last7Counts = userCounts.slice(-7);
      const userStats: UserStat[] = last7.map((date, i) => ({
        date,
        count: last7Counts[i],
      }));
      setStats(userStats);
      setTotal(userCounts[userCounts.length - 1] || 0);
      setToday(
        userStats.length > 1
          ? userStats[userStats.length - 1].count - userStats[userStats.length - 2].count
          : userStats.length === 1
          ? userStats[0].count
          : 0
      );
      setLoading(false);
    });
  }, []);

  // グラフ用最大値
  const max = Math.max(...stats.map((s) => s.count), 5);

  return (
    <section
      aria-label={L.title}
      style={{
        background: "#fff",
        borderRadius: 15,
        padding: "28px 30px 20px 30px",
        boxShadow: "0 6px 28px #19234916",
        maxWidth: 700,
        margin: "26px auto",
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 26,
          marginBottom: 23,
          color: "#192349",
          letterSpacing: 1.3,
        }}
      >
        👥 {L.title}
      </h2>
      {loading ? (
        <div style={{ color: "#aaa", fontSize: 19, textAlign: "center" }}>
          {L.loading}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24, marginBottom: 17 }}>
            <div
              style={{
                flex: 1,
                background: "#eef7fe",
                borderRadius: 10,
                padding: "13px 20px",
                fontWeight: 700,
                fontSize: 18,
                color: "#1e4595",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, color: "#0c3f7b" }}>
                {total.toLocaleString()}
              </span>
              <span style={{ fontSize: 15, color: "#4b6387" }}>
                {L.total}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                background: "#eafff2",
                borderRadius: 10,
                padding: "13px 20px",
                fontWeight: 700,
                fontSize: 18,
                color: "#006c46",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, color: "#009e60" }}>
                {today}
              </span>
              <span style={{ fontSize: 15, color: "#338059" }}>
                {L.today}
              </span>
            </div>
          </div>
          <div style={{ marginBottom: 9, fontWeight: 700, fontSize: 16, color: "#192349" }}>
            {L.last7}
          </div>
          {stats.length === 0 ? (
            <div style={{ color: "#aaa", fontSize: 16, textAlign: "center" }}>
              {L.noData}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 7,
                height: 88,
                marginBottom: 7,
                width: "100%",
                minWidth: 240,
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.date}
                  aria-label={`${s.date}: ${s.count} ${L.users}`}
                  style={{
                    flex: 1,
                    background: "#5b8dee",
                    height: `${Math.round((s.count / max) * 75) + 10}px`,
                    borderRadius: "6px 6px 0 0",
                    margin: "0 2px",
                    minWidth: 15,
                    position: "relative",
                  }}
                  title={`${s.date}: ${s.count}${L.users}`}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: -21,
                      transform: "translateX(-50%)",
                      color: "#3a4c7d",
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.count}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: -18,
                      transform: "translateX(-50%)",
                      color: "#888",
                      fontWeight: 600,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.date.slice(5).replace("-", "/")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
