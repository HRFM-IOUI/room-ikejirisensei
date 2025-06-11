"use client";
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";
import { FaCalendarAlt, FaRegHeart, FaHeart, FaShareAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

// タグごとに色分け
const TAG_COLORS: { [key: string]: string } = {
  "区政": "bg-blue-500",
  "イベント": "bg-green-500",
  "お知らせ": "bg-pink-500",
  "市民活動": "bg-yellow-500",
  "政策": "bg-indigo-500",
  "その他": "bg-gray-500",
};

// ブロック型
type Block =
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "image"; content: string }
  | { type: "video"; content: string };

// 記事データ型
type PostData = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  tags?: string[];
  category?: string;
  blocks?: Block[];
};

// お気に入り（ローカルのみ）
function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    setFavs(JSON.parse(localStorage.getItem("favorites") || "[]"));
  }, []);
  const toggleFav = (id: string) => {
    setFavs(f => {
      let next;
      if (f.includes(id)) next = f.filter(i => i !== id);
      else next = [...f, id];
      localStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
  };
  return { favs, toggleFav };
}

// createdAtフォーマット
function formatDate(val: string | number | { seconds?: number }) {
  if (!val) return "";
  let d: Date;
  if (typeof val === "object" && val !== null && "seconds" in val && typeof val.seconds === "number") {
    d = new Date(val.seconds * 1000);
  } else {
    d = new Date(val as string | number);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { favs, toggleFav } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(
        snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            createdAt: data.createdAt,
            tags: data.tags ?? [],
            category: data.category,
            blocks: Array.isArray(data.blocks) ? data.blocks : [],
          } as PostData;
        })
      );
      setLoading(false);
    })();
  }, []);

  // シェアボタン
  const handleShare = (post: PostData) => {
    const url =
      typeof window !== "undefined"
        ? window.location.origin + `/posts/${post.id}`
        : "";
    if (navigator.share) {
      navigator.share({ title: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("記事URLをコピーしました！");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] flex flex-col items-center px-2 pb-10">
      <div className="w-full max-w-4xl flex items-center justify-between mt-10 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-[#192349] drop-shadow-sm">
          記事一覧
        </h1>
        <Link
          href="/"
          className="bg-blue-700 hover:bg-blue-900 text-white px-6 py-2 rounded-xl font-bold shadow transition"
        >
          トップページへ戻る
        </Link>
      </div>
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="text-lg text-gray-500 text-center py-16 col-span-full">記事を読み込み中…</div>
        ) : posts.length === 0 ? (
          <div className="text-lg text-gray-400 text-center py-16 col-span-full">まだ記事がありません。</div>
        ) : (
          posts.map((post, i) => {
            // サムネイル画像を blocks の最初の image ブロックから取得
            const firstImage = post.blocks?.find?.(
              (b) => b.type === "image" && b.content
            ) as Block | undefined;

            return (
              <div
                key={post.id}
                className={`
                  group relative block rounded-2xl overflow-hidden shadow-lg border border-[#e3e8f8]
                  hover:shadow-2xl hover:scale-[1.03] hover:border-[#192349] transition-all duration-200
                  bg-white cursor-pointer ripple-effect animate-fadein
                `}
                style={{
                  minHeight: 280,
                  animationDelay: `${i * 70}ms`,
                }}
                onClick={e => {
                  if ((e.target as HTMLElement).closest(".btn-card-action")) return;
                  router.push(`/posts/${post.id}`);
                }}
              >
                <span className="ripple"></span>
                <div className="relative w-full h-48 overflow-hidden">
                  {/* サムネイル：blocks画像 or デフォルト */}
                  <Image
                    src={firstImage?.content || "/logo.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
                    width={480}
                    height={192}
                    style={{ objectFit: "cover" }}
                    priority={i < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/0 opacity-75 group-hover:opacity-85 transition" />
                  <div className="absolute left-0 right-0 bottom-0 px-5 pb-4 pt-2 flex flex-col items-start">
                    <h2 className="text-white text-xl font-extrabold drop-shadow-lg animate-fadein">
                      {post.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(post.tags ?? ['お知らせ']).map((tag: string) => (
                        <span
                          key={tag}
                          className={`
                            inline-block text-xs font-bold px-2 py-1 rounded-full text-white shadow
                            ${TAG_COLORS[tag] || "bg-gray-500"}
                          `}
                        >
                          {tag}
                        </span>
                      ))}
                      {post.category && (
                        <span className="inline-block text-xs font-bold px-2 py-1 rounded-full bg-black/40 text-white ml-1">
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#fff9] rounded-full px-3 py-1 shadow text-[#192349] font-bold text-xs">
                  <FaCalendarAlt className="text-blue-700 mr-1" />{" "}
                  {formatDate(post.createdAt)}
                </div>
                <div className="absolute top-4 right-4 flex gap-3 z-10">
                  <button
                    className="btn-card-action"
                    onClick={e => {
                      e.stopPropagation();
                      toggleFav(post.id);
                    }}
                    title="お気に入り"
                  >
                    {favs.includes(post.id) ? (
                      <FaHeart className="text-red-500 text-lg drop-shadow" />
                    ) : (
                      <FaRegHeart className="text-gray-400 text-lg" />
                    )}
                  </button>
                  <button
                    className="btn-card-action"
                    onClick={e => {
                      e.stopPropagation();
                      handleShare(post);
                    }}
                    title="シェア"
                  >
                    <FaShareAlt className="text-blue-600 text-lg" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
      <style jsx global>{`
        .ripple-effect:active .ripple {
          animation: ripple 0.5s linear;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          background: rgba(30, 136, 229, 0.22);
          width: 160px;
          height: 160px;
          top: 50%;
          left: 50%;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes ripple {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .animate-fadein {
          animation: fadeinUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes fadeinUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
