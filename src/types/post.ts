// src/types/post.ts
export type Post = {
  id?: string;
  title: string;
  content: string;
  date: { seconds: number } | string | number; // Firestore.Timestamp型 or string/number
  image?: string;
  tags?: string[];     // ← 追加
  category?: string;   // ← 追加
};

