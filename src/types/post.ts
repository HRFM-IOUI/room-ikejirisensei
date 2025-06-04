// src/types/post.ts
export type Post = {
  id?: string;
  title: string;
  content: string;
  date: any;           // Firestore.Timestamp | string でOK
  image?: string;
  tags?: string[];     // ← 追加
  category?: string;   // ← 追加
};
