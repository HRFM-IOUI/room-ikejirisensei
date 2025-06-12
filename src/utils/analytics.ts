import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

// 型定義
interface ArticleView {
  count?: number;
  updatedAt?: Timestamp;
}

interface Post {
  title?: string;
  tags?: string[];
  blocks?: { content?: string[] }[];
  createdAt?: Timestamp | string | number | Date;
}

interface Video {
  title?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: Timestamp | string | number | Date;
}

interface User {
  createdAt?: Timestamp | string | number | Date;
  lastActive?: Timestamp | string | number | Date;
}

interface Donation {
  amount?: number;
}

// [1] 記事PVカウント
export async function logArticleView(postId: string) {
  if (!postId) return;
  const ref = doc(db, "articleViews", postId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// [2] 記事PVランキング（ID + PV数のみ）
export async function getArticleViewRanking(limit: number = 10) {
  const snap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      count: data.count ?? 0,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });
}

// [3] 記事PVランキング + 詳細取得
export async function getArticleViewRankingWithDetails(limit: number = 10) {
  const pvSnap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      pv: data.count ?? 0,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });

  const detailPromises = top.map(async (item) => {
    try {
      const postSnap = await getDoc(doc(db, "posts", item.id));
      const postData = postSnap.exists() ? (postSnap.data() as Post) : {};
      return {
        ...item,
        title:
          postData.blocks?.[0]?.content?.slice(0, 30) ??
          postData.title ??
          "無題",
        tags: postData.tags ?? [],
        createdAt:
          postData.createdAt instanceof Timestamp
            ? postData.createdAt.toDate()
            : typeof postData.createdAt === "string" || typeof postData.createdAt === "number"
              ? new Date(postData.createdAt)
              : postData.createdAt instanceof Date
                ? postData.createdAt
                : null,
      };
    } catch {
      return {
        ...item,
        title: "取得エラー",
        tags: [],
        createdAt: null,
      };
    }
  });

  return await Promise.all(detailPromises);
}

// [4] 動画再生PVカウント
export async function logVideoView(videoId: string) {
  if (!videoId) return;
  const ref = doc(db, "videoViews", videoId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// [5] 動画PVランキング
export async function getVideoViewRanking(limit: number = 10) {
  const snap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      count: data.count ?? 0,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });
}

// [6] 動画ランキング（videosコレクションのviewsでソート）
export async function getVideoRanking() {
  const snap = await getDocs(
    query(collection(db, "videos"), orderBy("views", "desc"))
  );
  return snap.docs.map((d) => {
    const data = d.data() as Video & { views?: number };
    return {
      id: d.id,
      title: data.title ?? "無題動画",
      views: data.views ?? 0,
      tags: data.tags ?? [],
      thumbnail: data.thumbnail ?? null,
    };
  });
}

// [7] 動画PVランキング + 詳細
export async function getVideoViewRankingWithDetails(limit: number = 10) {
  const pvSnap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      pv: data.count ?? 0,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    };
  });

  const detailPromises = top.map(async (item) => {
    try {
      const videoSnap = await getDoc(doc(db, "videos", item.id));
      const videoData = videoSnap.exists() ? (videoSnap.data() as Video) : {};
      return {
        ...item,
        title: videoData.title ?? "無題動画",
        tags: videoData.tags ?? [],
        thumbnail: videoData.thumbnail ?? null,
        createdAt:
          videoData.createdAt instanceof Timestamp
            ? videoData.createdAt.toDate()
            : typeof videoData.createdAt === "string" || typeof videoData.createdAt === "number"
              ? new Date(videoData.createdAt)
              : videoData.createdAt instanceof Date
                ? videoData.createdAt
                : null,
      };
    } catch {
      return {
        ...item,
        title: "取得エラー",
        tags: [],
        thumbnail: null,
        createdAt: null,
      };
    }
  });

  return await Promise.all(detailPromises);
}

// [8] 会員登録ユーザー数
export async function getUserSignupStats() {
  const snap = await getDocs(collection(db, "users"));
  return { total: snap.size };
}

// [9] 日付単位で累計ユーザー数
export async function getUserCountsByDate() {
  const snap = await getDocs(collection(db, "users"));
  const dateMap: { [date: string]: number } = {};
  snap.docs.forEach((d: QueryDocumentSnapshot) => {
    const user = d.data() as User;
    const createdAt = user.createdAt;
    let dateObj: Date | null = null;

    if (createdAt instanceof Timestamp) {
      dateObj = createdAt.toDate();
    } else if (typeof createdAt === "string" || typeof createdAt === "number") {
      dateObj = new Date(createdAt);
    } else if (createdAt instanceof Date) {
      dateObj = createdAt;
    }

    if (!dateObj || isNaN(dateObj.getTime())) return;
    const date = dateObj.toISOString().slice(0, 10);
    dateMap[date] = (dateMap[date] || 0) + 1;
  });

  const dates = Object.keys(dateMap).sort();
  let total = 0;
  const userCounts = dates.map((date) => (total += dateMap[date]));
  return { dates, userCounts };
}

// [10] アクティブユーザー記録
export async function markUserActive(userId: string) {
  if (!userId) return;
  try {
    await updateDoc(doc(db, "users", userId), {
      lastActive: serverTimestamp(),
    });
  } catch {
    // 無視
  }
}

// [11] アクティブユーザー数取得
export async function getActiveUserCount(days: number): Promise<number> {
  const snap = await getDocs(collection(db, "users"));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let count = 0;

  snap.forEach((d) => {
    const user = d.data() as User;
    const lastActive = user.lastActive;
    let lastDate: Date | null = null;

    if (lastActive instanceof Timestamp) {
      lastDate = lastActive.toDate();
    } else if (typeof lastActive === "string" || typeof lastActive === "number") {
      lastDate = new Date(lastActive);
    } else if (lastActive instanceof Date) {
      lastDate = lastActive;
    }

    if (lastDate && lastDate >= since) {
      count++;
    }
  });

  return count;
}

// [12] 寄付履歴集計
export async function getDonationStats() {
  const snap = await getDocs(collection(db, "donations"));
  let total = 0;
  snap.forEach((d) => {
    const data = d.data() as Donation;
    total += Number(data.amount ?? 0);
  });
  return { total, count: snap.size };
}

// [13] GAイベント送信
export function sendGAEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}

// [14] 記事詳細取得
export async function getArticleDetail(postId: string) {
  if (!postId) return null;
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Post;

  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : typeof data.createdAt === "string" || typeof data.createdAt === "number"
        ? new Date(data.createdAt)
        : data.createdAt instanceof Date
          ? data.createdAt
          : null;

  return {
    id: postId,
    title: data.blocks?.[0]?.content?.slice(0, 30) || data.title || "無題",
    tags: data.tags ?? [],
    createdAt,
    ...data,
  };
}

// [15] リファラー記録
export async function logReferral(referrer?: string) {
  if (typeof window !== "undefined" && !referrer) {
    referrer = document.referrer;
  }
  let key = "other";
  if (!referrer || referrer === "") {
    key = "direct";
  } else if (referrer.includes("google.")) {
    key = "google";
  } else if (/twitter\.com|x\.com/.test(referrer)) {
    key = "twitter";
  } else if (referrer.includes("facebook.")) {
    key = "facebook";
  }

  const ref = doc(db, "referralStats", key);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// [16] リファラーステータス集計
export async function getReferralStats() {
  const snap = await getDocs(collection(db, "referralStats"));
  return snap.docs.map((d) => ({
    key: d.id,
    label: d.id,
    count: d.data().count ?? 0,
  }));
}
