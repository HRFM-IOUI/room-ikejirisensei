import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import type { Post } from "../types/post";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_IMAGE = "/logo.svg";

// 日付を「YYYY-MM-DD」形式で表示
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
  return `${yyyy}-${mm}-${dd}`;
}

export default function HeroSection() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("date", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(postsQuery);
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
    })();
  }, []);

  return (
    <section
      className="w-full flex flex-col lg:flex-row gap-8 py-8 bg-white border-b-8 border-primary rounded-b-2xl shadow-lg mx-auto"
      style={{ maxWidth: '1180px', marginLeft: 'auto', marginRight: 'auto' }}
    >
      {/* 左：最新記事リスト */}
      <div
        className="flex-[6_6_0%] min-w-0 border-r border-gray-200 pr-4"
        style={{ maxWidth: 490 }}
      >
        <h2 className="text-2xl font-extrabold text-[#192349] mb-6 border-b-4 border-[#192349] pb-2 tracking-wide drop-shadow-sm">
          最新記事
        </h2>
        <ul className="flex flex-col gap-6">
          {posts.map((p, idx) => (
            <li
              key={p.id || idx}
              className={`
                flex items-center gap-4 p-4 bg-white
                rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg
                border-t-2 border-b-2 border-[#192349]
                shadow-[0_2px_8px_0_rgba(25,35,73,0.06)]
                hover:shadow-lg hover:scale-[1.03] hover:border-[#004080] transition-all
                duration-150
              `}
              style={{ borderLeft: "none", borderRight: "none" }}
            >
              <Image
                src={p.image || DEFAULT_IMAGE}
                alt={p.title}
                className="w-20 h-20 object-cover rounded-xl border border-[#192349]/10"
                width={80}
                height={80}
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <div className="block text-lg font-bold text-[#192349] truncate">
                  {p.title}
                </div>
                <div className="text-xs text-[#192349] opacity-70 mt-2">
                  {formatDate(p.date)}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {/* 記事一覧への導線ボタン */}
        <div className="mt-6 text-center">
          <Link
            href="/posts"
            className="
              inline-block bg-blue-700 text-white py-3 px-6 rounded-xl shadow-md font-bold
              hover:bg-blue-900 transition
            "
          >
            記事一覧を見る
          </Link>
        </div>
      </div>
      {/* 右：先生ポスター＆プロフィール */}
      <div
        className="flex flex-col items-center flex-[4_4_0%] w-full px-0 lg:pl-10 pt-6 lg:pt-0"
        style={{ maxWidth: 370 }}
      >
        <div className="relative mb-4">
          <Image
            src="/poster_2025.jpg"
            alt="池尻成二ポスター"
            className="w-[310px] lg:w-[350px] rounded-2xl shadow-lg border-4 border-primary"
            style={{ maxWidth: 350, height: 'auto' }}
            width={350}
            height={350}
            priority
          />
        </div>
        <div className="text-[#192349] font-extrabold text-xl text-center mt-2">
          練馬区議会議員 池尻成二
        </div>
        <div className="text-blue-700 font-medium text-center text-base mt-2">
          つながる市民・練馬／公式サイト
        </div>
      </div>
    </section>
  );
}
