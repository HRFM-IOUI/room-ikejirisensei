// src/utils/analytics/incrementArticlePV.ts
import { db } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

/**
 * 記事本体(postsコレクション)のpvフィールドをインクリメント
 * - 直接記事ドキュメントのpvだけを更新したい場合に利用
 * - サイドでarticleViewsコレクションを使う方式と併用も可能
 *
 * @param articleId 記事ID
 */
export async function incrementArticlePV(articleId: string) {
  if (!articleId) return;
  try {
    const articleRef = doc(db, "posts", articleId);
    await updateDoc(articleRef, {
      pv: increment(1),
    });
  } catch (err) {
    // 権限がない場合も含めてエラー握りつぶし（UIに影響なし）
    // console.error("PVカウントエラー", err);
  }
}
