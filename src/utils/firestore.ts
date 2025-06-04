// src/utils/firestore.ts
import { db } from "../firebase";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import type { Post } from "../types/post";

// Firestoreに記事を追加
export async function addPost(post: Omit<Post, "id" | "date">) {
  await addDoc(collection(db, "posts"), {
    ...post,
    date: serverTimestamp(), // ★ここで時分秒まで含めたFirestoreサーバータイムスタンプ
  });
}

// Firestoreから最新記事一覧を取得
export async function getPosts(): Promise<Post[]> {
  const q = query(collection(db, "posts"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
}
