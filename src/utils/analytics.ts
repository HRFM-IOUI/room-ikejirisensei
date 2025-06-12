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

export type DateLike = string | number | { seconds: number } | null;

export interface ArticleView {
  count?: number;
  updatedAt?: Timestamp;
}
export interface Post {
  title?: string;
  tags?: string[];
  blocks?: { content?: string[] }[];
  createdAt?: DateLike;
}
export interface Video {
  title?: string;
  tags?: string[];
  thumbnail?: string;
  createdAt?: DateLike;
  views?: number;
}
export interface User {
  createdAt?: DateLike;
  lastActive?: DateLike;
}
export interface Donation {
  amount?: number;
}

// 型ガード: Firestore Timestamp
function isTimestamp(obj: unknown): obj is Timestamp {
  return typeof obj === "object" && obj !== null && "seconds" in obj && typeof (obj as { seconds: unknown }).seconds === "number";
}
function isSecondsObj(obj: unknown): obj is { seconds: number } {
  return typeof obj === "object" && obj !== null && "seconds" in obj && typeof (obj as { seconds: unknown }).seconds === "number";
}
// 型ガード: Date
function isDate(obj: unknown): obj is Date {
  return Object.prototype.toString.call(obj) === "[object Date]";
}

function normalizeDateLike(src: unknown): DateLike {
  if (isTimestamp(src)) {
    return { seconds: src.seconds };
  } else if (isSecondsObj(src)) {
    return { seconds: (src as { seconds: number }).seconds };
  } else if (typeof src === "string" || typeof src === "number") {
    return src;
  } else if (isDate(src)) {
    return src.toISOString();
  }
  return null;
}

// [1] 記事PVカウント
export async function logArticleView(postId: string): Promise<void> {
  if (!postId) return;
  const ref = doc(db, "articleViews", postId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// [2] 記事PVランキング
export async function getArticleViewRanking(limit: number = 10): Promise<
  Array<{ id: string; count: number; updatedAt: DateLike }>
> {
  const snap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      count: data.count ?? 0,
      updatedAt: normalizeDateLike(data.updatedAt),
    };
  });
}

// [3] 記事PVランキング + 詳細取得
export async function getArticleViewRankingWithDetails(limit: number = 10): Promise<
  Array<{
    id: string;
    pv: number;
    updatedAt: DateLike;
    title: string;
    tags: string[];
    createdAt: DateLike;
  }>
> {
  const pvSnap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      pv: data.count ?? 0,
      updatedAt: normalizeDateLike(data.updatedAt),
    };
  });

  const detailPromises = top.map(async (item) => {
    try {
      const postSnap = await getDoc(doc(db, "posts", item.id));
      const postData = postSnap.exists() ? (postSnap.data() as Post) : {};
      let title = "無題";
      if (
        Array.isArray(postData.blocks) &&
        postData.blocks[0] &&
        Array.isArray(postData.blocks[0].content) &&
        typeof postData.blocks[0].content[0] === "string"
      ) {
        title = postData.blocks[0].content[0].slice(0, 30);
      } else if (typeof postData.title === "string") {
        title = postData.title;
      }
      return {
        ...item,
        title,
        tags: postData.tags ?? [],
        createdAt: normalizeDateLike(postData.createdAt),
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
export async function logVideoView(videoId: string): Promise<void> {
  if (!videoId) return;
  const ref = doc(db, "videoViews", videoId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// [5] 動画PVランキング
export async function getVideoViewRanking(limit: number = 10): Promise<
  Array<{ id: string; count: number; updatedAt: DateLike }>
> {
  const snap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      count: data.count ?? 0,
      updatedAt: normalizeDateLike(data.updatedAt),
    };
  });
}

// [6] 動画ランキング
export async function getVideoRanking(): Promise<
  Array<{ id: string; title: string; views: number; tags: string[]; thumbnail: string | null; }>
> {
  const snap = await getDocs(
    query(collection(db, "videos"), orderBy("views", "desc"))
  );
  return snap.docs.map((d) => {
    const data = d.data() as Video;
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
export async function getVideoViewRankingWithDetails(limit: number = 10): Promise<
  Array<{
    id: string;
    pv: number;
    updatedAt: DateLike;
    title: string;
    tags: string[];
    thumbnail: string | null;
    createdAt: DateLike;
  }>
> {
  const pvSnap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map((d) => {
    const data = d.data() as ArticleView;
    return {
      id: d.id,
      pv: data.count ?? 0,
      updatedAt: normalizeDateLike(data.updatedAt),
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
        createdAt: normalizeDateLike(videoData.createdAt),
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
export async function getUserSignupStats(): Promise<{ total: number }> {
  const snap = await getDocs(collection(db, "users"));
  return { total: snap.size };
}

// [9] 日付単位で累計ユーザー数
export async function getUserCountsByDate(): Promise<{
  dates: string[];
  userCounts: number[];
}> {
  const snap = await getDocs(collection(db, "users"));
  const dateMap: { [date: string]: number } = {};
  snap.docs.forEach((d: QueryDocumentSnapshot) => {
    const user = d.data() as User;
    const src = user.createdAt;
    let dateObj: Date | null = null;
    if (isTimestamp(src) || isSecondsObj(src)) {
      const seconds = (src as { seconds: number }).seconds;
      dateObj = new Date(seconds * 1000);
    } else if (typeof src === "string" || typeof src === "number") {
      const d = new Date(src);
      dateObj = isNaN(d.getTime()) ? null : d;
    } else if (isDate(src)) {
      dateObj = src;
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
export async function markUserActive(userId: string): Promise<void> {
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
    const src = user.lastActive;
    let lastDate: Date | null = null;
    if (isTimestamp(src) || isSecondsObj(src)) {
      const seconds = (src as { seconds: number }).seconds;
      lastDate = new Date(seconds * 1000);
    } else if (typeof src === "string" || typeof src === "number") {
      const d = new Date(src);
      lastDate = isNaN(d.getTime()) ? null : d;
    } else if (isDate(src)) {
      lastDate = src;
    }
    if (lastDate && lastDate >= since) {
      count++;
    }
  });

  return count;
}

// [12] 寄付履歴集計
export async function getDonationStats(): Promise<{ total: number; count: number }> {
  const snap = await getDocs(collection(db, "donations"));
  let total = 0;
  snap.forEach((d) => {
    const data = d.data() as Donation;
    total += Number(data.amount ?? 0);
  });
  return { total, count: snap.size };
}

// [13] GAイベント送信
declare global {
  interface Window {
    gtag?: (event: string, action: string, params?: Record<string, unknown>) => void;
  }
}
export function sendGAEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// [14] 記事詳細取得
export async function getArticleDetail(postId: string): Promise<
  | ({
      id: string;
      title: string;
      tags: string[];
      createdAt: DateLike;
    } & Post)
  | null
> {
  if (!postId) return null;
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Post;

  let title = "無題";
  if (
    Array.isArray(data.blocks) &&
    data.blocks[0] &&
    Array.isArray(data.blocks[0].content) &&
    typeof data.blocks[0].content[0] === "string"
  ) {
    title = data.blocks[0].content[0].slice(0, 30);
  } else if (typeof data.title === "string") {
    title = data.title;
  }

  return {
    id: postId,
    title,
    tags: data.tags ?? [],
    createdAt: normalizeDateLike(data.createdAt),
    ...data,
  };
}

// [15] リファラー記録
export async function logReferral(referrer?: string): Promise<void> {
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
export async function getReferralStats(): Promise<
  Array<{ key: string; label: string; count: number }>
> {
  const snap = await getDocs(collection(db, "referralStats"));
  return snap.docs.map((d) => ({
    key: d.id,
    label: d.id,
    count: d.data().count ?? 0,
  }));
}
