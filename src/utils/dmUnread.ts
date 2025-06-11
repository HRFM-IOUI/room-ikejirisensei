// src/utils/dmUnread.ts
import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function markThreadRead(userId: string, threadId: string) {
  await setDoc(
    doc(db, "users", userId, "threadStatus", threadId),
    { lastReadAt: serverTimestamp() },
    { merge: true }
  );
}
