// src/utils/dmUtils.ts
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * 指定スレッドの自分の未読メッセージ数を返す
 */
export async function countUnreadMessages(threadId: string, myUid: string): Promise<number> {
  const q = query(
    collection(db, "dmThreads", threadId, "messages"),
    where("readBy", "not-in", [myUid]) // Firestoreの仕様上「not-in」は配列で最大10件制限
  );
  const snap = await getDocs(q);
  return snap.size;
}
