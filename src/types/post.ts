// src/types/post.ts

export type FirestoreTimestamp = { seconds: number; nanoseconds?: number };

export type Post = {
  id?: string;
  title: string;
  content: string;
  date: FirestoreTimestamp | string | number; // ← 型厳格に修正
  image?: string;
  tags?: string[];
  category?: string;
};
