// src/hooks/useDmUnreadCount.ts
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  doc, getDoc, collection, query, orderBy, onSnapshot, Timestamp
} from "firebase/firestore";

export function useDmUnreadCount(userId: string, threadId: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId || !threadId) return;

    let unsub: (() => void) | undefined;
    let lastReadAt: Date | null = null;

    getDoc(doc(db, "users", userId, "threadStatus", threadId)).then(snap => {
      lastReadAt = snap.data()?.lastReadAt?.toDate?.() ?? null;

      // メッセージを監視して未読数カウント
      const q = query(collection(db, "dmThreads", threadId, "messages"), orderBy("createdAt", "asc"));
      unsub = onSnapshot(q, (snapshot) => {
        let n = 0;
        snapshot.forEach(doc => {
          const d = doc.data();
          const created = d.createdAt instanceof Timestamp ? d.createdAt.toDate() : d.createdAt?.toDate?.() || null;
          if (!lastReadAt || (created && created > lastReadAt)) n++;
        });
        setCount(n);
      });
    });

    return () => { unsub?.(); };
  }, [userId, threadId]);

  return count;
}
