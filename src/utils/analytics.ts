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
} from "firebase/firestore";

/**
 * [1] 記事PVカウント（articleViewsコレクションにインクリメント記録）
 */
export async function logArticleView(postId: string) {
  if (!postId) return;
  const ref = doc(db, "articleViews", postId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * [2] 記事PVランキング（PV数でソート、トップN件取得、ID+PV数のみ）
 */
export async function getArticleViewRanking(limit: number = 10) {
  const snap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    count: doc.data().count ?? 0,
    updatedAt: doc.data().updatedAt?.toDate() ?? null,
  }));
}

/**
 * [3] 記事PVランキング + タイトル・タグ等の詳細も同時取得（推奨UI用）
 */
export async function getArticleViewRankingWithDetails(limit: number = 10) {
  const pvSnap = await getDocs(
    query(collection(db, "articleViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    pv: doc.data().count ?? 0,
    updatedAt: doc.data().updatedAt?.toDate() ?? null,
  }));

  // 並列で記事タイトル・タグ等も取得
  const detailPromises = top.map(async (item) => {
    try {
      const postSnap = await getDoc(doc(db, "posts", item.id));
      const postData = postSnap.exists() ? postSnap.data() : {};
      return {
        ...item,
        title: postData?.blocks?.[0]?.content?.slice(0, 30) || postData?.title || "無題",
        tags: postData?.tags || [],
        createdAt: postData?.createdAt?.toDate?.() || null,
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

/**
 * [4] 動画再生PVカウント（videoViewsコレクションにインクリメント記録）
 */
export async function logVideoView(videoId: string) {
  if (!videoId) return;
  const ref = doc(db, "videoViews", videoId);
  await setDoc(
    ref,
    { count: increment(1), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * [5] 動画PVランキング（ID＋再生数のみ。詳細はgetVideoRankingWithDetails推奨）
 */
export async function getVideoViewRanking(limit: number = 10) {
  const snap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  return snap.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    count: doc.data().count ?? 0,
    updatedAt: doc.data().updatedAt?.toDate() ?? null,
  }));
}

/**
 * [6] 動画ランキング（videosコレクションのviewsフィールドでソート。タイトル・views取得）
 */
export async function getVideoRanking() {
  const q = query(collection(db, "videos"), orderBy("views", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title || "無題動画",
    views: doc.data().views || 0,
    tags: doc.data().tags || [],
    thumbnail: doc.data().thumbnail || null,
  }));
}

/**
 * [7] 動画PVランキング + タイトル・タグ等の詳細も同時取得（推奨UI用）
 */
export async function getVideoViewRankingWithDetails(limit: number = 10) {
  const pvSnap = await getDocs(
    query(collection(db, "videoViews"), orderBy("count", "desc"))
  );
  const top = pvSnap.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    pv: doc.data().count ?? 0,
    updatedAt: doc.data().updatedAt?.toDate() ?? null,
  }));

  // 並列で動画タイトル・タグ・サムネ等も取得
  const detailPromises = top.map(async (item) => {
    try {
      const videoSnap = await getDoc(doc(db, "videos", item.id));
      const videoData = videoSnap.exists() ? videoSnap.data() : {};
      return {
        ...item,
        title: videoData?.title || "無題動画",
        tags: videoData?.tags || [],
        thumbnail: videoData?.thumbnail || null,
        createdAt: videoData?.createdAt?.toDate?.() || null,
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

/**
 * [8] 会員登録ユーザー数（合計）
 */
export async function getUserSignupStats() {
  const snap = await getDocs(collection(db, "users"));
  return { total: snap.size };
}

/**
 * [9] 日付単位で累計会員数（新規・推移グラフ用）
 */
export async function getUserCountsByDate() {
  const snap = await getDocs(collection(db, "users"));
  // 登録日のISO日付単位にグルーピング
  const dateMap: { [date: string]: number } = {};
  snap.docs.forEach(doc => {
    const d = doc.data().createdAt?.toDate?.() || doc.data().createdAt;
    if (!d) return;
    const date = (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  // 日付ソート・累積
  const dates = Object.keys(dateMap).sort();
  let total = 0;
  const userCounts = dates.map(date => (total += dateMap[date]));
  return { dates, userCounts };
}

/**
 * [10] アクティブユーザー数記録（lastActiveフィールドにタイムスタンプ保存）
 */
export async function markUserActive(userId: string) {
  if (!userId) return;
  try {
    await updateDoc(doc(db, "users", userId), {
      lastActive: serverTimestamp(),
    });
  } catch (e) {
    // エラーは握りつぶし
  }
}

/**
 * [11] 指定日数以内のアクティブユーザー数取得（DAU/WAU/MAU分析用）
 */
export async function getActiveUserCount(days: number): Promise<number> {
  const snap = await getDocs(collection(db, "users"));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  let count = 0;
  snap.forEach(doc => {
    const lastActive = doc.data().lastActive;
    let lastDate: Date | null = null;
    if (lastActive && typeof lastActive.toDate === "function") {
      lastDate = lastActive.toDate();
    } else if (typeof lastActive === "string" || typeof lastActive === "number") {
      lastDate = new Date(lastActive);
    }
    if (lastDate && lastDate >= since) {
      count++;
    }
  });
  return count;
}

/**
 * [12] 寄付/カンパ履歴集計（現在はStripeダッシュボード利用推奨。Firestore版も用意可）
 */
export async function getDonationStats() {
  const snap = await getDocs(collection(db, "donations"));
  let total = 0;
  snap.forEach(doc => {
    total += Number(doc.data().amount ?? 0);
  });
  return { total, count: snap.size };
}

/**
 * [13] Google Analytics (GA4) イベント送信（フロントから呼ぶ場合のみ有効）
 */
export function sendGAEvent(eventName: string, params: any = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}

/**
 * [14] 記事詳細取得（IDからタイトル・タグ・作成日ほかを取得）
 */
export async function getArticleDetail(postId: string) {
  if (!postId) return null;
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: postId,
    title: data.blocks?.[0]?.content?.slice(0, 30) || data.title || "無題",
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate?.() || null,
    ...data
  };
}

/**
 * [15] 流入元（リファラー）をFirestoreで記録
 */
export async function logReferral(referrer?: string) {
  // referrerが未指定ならwindow.document.referrerから自動取得
  if (typeof window !== "undefined" && !referrer) {
    referrer = document.referrer;
  }
  let key = "other";
  if (!referrer || referrer === "") {
    key = "direct";
  } else if (referrer.includes("google.")) {
    key = "google";
  } else if (referrer.match(/twitter\.com|x\.com/)) {
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

/**
 * [16] 流入元チャネルの集計データ取得（本番はFirestore連動済み）
 */
export async function getReferralStats() {
  const snap = await getDocs(collection(db, "referralStats"));
  return snap.docs.map(doc => ({
    key: doc.id,
    label: doc.id,
    count: doc.data().count ?? 0,
  }));
}
