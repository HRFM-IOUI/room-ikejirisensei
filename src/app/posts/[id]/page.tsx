// src/app/posts/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { Post } from "@/types/post";
import Image from "next/image"; // ← 追加！

// Firestore Timestampやstring/numberを安全に日付文字列へ変換
function formatDate(dateVal: string | number | { seconds?: number }) {
  if (!dateVal) return "";
  let d: Date;
  if (
    typeof dateVal === "object" &&
    dateVal !== null &&
    "seconds" in dateVal &&
    typeof dateVal.seconds === "number"
  ) {
    d = new Date(dateVal.seconds * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() } as Post);
      }
    };
    fetchPost();
  }, [id]);

  if (!post)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>Loading...</div>
    );

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 32px rgba(25,35,73,0.09)",
      }}
    >
      <button
        style={{
          marginBottom: 18,
          color: "#1818e3",
          fontWeight: 700,
          border: "none",
          background: "none",
          fontSize: 17,
          cursor: "pointer",
        }}
        onClick={() => router.back()}
      >
        ← 記事一覧へ戻る
      </button>
      <div>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={650}
            height={310}
            style={{
              width: "100%",
              maxHeight: 310,
              objectFit: "cover",
              borderRadius: 12,
              marginBottom: 18,
            }}
            unoptimized // 外部URLの場合は必須
          />
        )}
        <h1
          style={{
            color: "#192349",
            fontSize: 32,
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            color: "#5a6",
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          {formatDate(post.date)}
        </div>
        <div
          style={{
            color: "#181826",
            fontSize: 18,
            whiteSpace: "pre-line",
            lineHeight: 2,
          }}
        >
          {post.content}
        </div>
      </div>
    </div>
  );
}
