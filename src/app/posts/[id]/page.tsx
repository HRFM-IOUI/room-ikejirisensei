"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { Post } from "@/types/post";
import Image from "next/image";

// ブロック型定義
type Block =
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "image"; content: string }
  | { type: "video"; content: string };

type PostData = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  blocks?: Block[];
};

// createdAtフォーマット
function formatDate(val: string | number | { seconds?: number }) {
  if (!val) return "";
  let d: Date;
  if (
    typeof val === "object" &&
    val !== null &&
    "seconds" in val &&
    typeof val.seconds === "number"
  ) {
    d = new Date(val.seconds * 1000);
  } else {
    d = new Date(val as string | number);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        // blocksが不明な場合は空配列
        const data = snap.data() as Omit<PostData, "id">;
        setPost({
          id: snap.id,
          title: data.title,
          createdAt: data.createdAt,
          blocks: Array.isArray(data.blocks) ? data.blocks : [],
        });
      }
    };
    fetchPost();
  }, [id]);

  if (!post)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>Loading...</div>
    );

  // 画像サムネイル（最初のimageブロックを優先）
  const firstImage = post.blocks?.find?.(
    (b) => b.type === "image" && !!b.content
  ) as Block | undefined;

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
        {firstImage && (
          <Image
            src={firstImage.content}
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
            priority
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
          {formatDate(post.createdAt)}
        </div>
        <div
          style={{
            color: "#181826",
            fontSize: 18,
            whiteSpace: "pre-line",
            lineHeight: 2,
          }}
        >
          {/* blocks配列をレンダリング */}
          {post.blocks?.map?.((block, idx) => {
            if (block.type === "heading")
              return <h2 key={idx}>{block.content}</h2>;
            if (block.type === "text")
              return <p key={idx}>{block.content}</p>;
            if (block.type === "image")
              return (
                <Image
                  key={idx}
                  src={block.content}
                  alt=""
                  width={650}
                  height={310}
                  style={{ maxWidth: 650, borderRadius: 10, margin: "16px 0" }}
                />
              );
            if (block.type === "video")
              return (
                <video
                  key={idx}
                  src={block.content}
                  controls
                  style={{ maxWidth: 650, borderRadius: 10, margin: "16px 0" }}
                />
              );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
