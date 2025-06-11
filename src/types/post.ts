export type FirestoreTimestamp = { seconds: number; nanoseconds?: number };

export type Block = {
  id: string;
  type: "heading" | "text" | "image" | "video";
  content: string;
  // 必要に応じて style など追加
};

export type Post = {
  id?: string;
  title: string;
  content?: string; // レガシー用途
  blocks?: Block[]; // 新規実装はこちらを推奨
  createdAt: FirestoreTimestamp | string | number;
  image?: string;
  tags?: string[];
  category?: string;
  status?: "published" | "draft";
};
