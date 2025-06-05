import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import type { Post } from "../types/post";
import Image from "next/image";
import Link from "next/link";

const DEFAULT_IMAGE = "/logo.svg";

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
      className="
        w-full
        flex flex-col lg:flex-row
        gap-4 lg:gap-8 py-5 lg:py-8
        bg-white border-b-8 border-primary
        rounded-b-2xl shadow-lg mx-auto
        max-w-full lg:max-w-[1180px]
        transition-all
      "
      style={{ marginLeft: "auto", marginRight: "auto" }}
    >
      {/* 最新記事リスト */}
      <div
        className="
          w-full lg:flex-[6_6_0%] min-w-0
          border-b lg:border-b-0 lg:border-r border-gray-200
          pb-4 lg:pb-0 lg:pr-4
          transition-all
        "
        style={{ maxWidth: 490 }}
      >
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#192349] mb-5 border-b-4 border-[#192349] pb-1.5 tracking-wide drop-shadow-sm">
          最新記事
        </h2>
        <ul className="flex flex-col gap-4 sm:gap-6">
          {posts.map((p, idx) => (
            <li
              key={p.id || idx}
              className="
                flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white
                rounded-xl border-t-2 border-b-2 border-[#192349]
                shadow-[0_2px_8px_0_rgba(25,35,73,0.06)]
                hover:shadow-lg hover:scale-[1.03] hover:border-[#004080]
                transition-all duration-150
                mx-1
              "
              style={{ borderLeft: "none", borderRight: "none" }}
            >
              <Link href={`/posts/${p.id}`} className="flex items-center gap-3 sm:gap-4 w-full group">
                <Image
                  src={p.image || DEFAULT_IMAGE}
                  alt={p.title}
                  className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-xl border border-[#192349]/10 group-hover:opacity-90 transition"
                  width={80}
                  height={80}
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <div className="block text-base sm:text-lg font-bold text-[#192349] truncate group-hover:underline">
                    {p.title}
                  </div>
                  <div className="text-xs text-[#192349] opacity-70 mt-2">
                    {formatDate(p.date)}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {/* 記事一覧への導線ボタン */}
        <div className="mt-4 sm:mt-6 text-center">
          <Link
            href="/posts"
            className="
              inline-block bg-blue-700 text-white py-2.5 px-5 sm:py-3 sm:px-6 rounded-xl shadow-md font-bold
              hover:bg-blue-900 transition text-sm sm:text-base
            "
          >
            記事一覧を見る
          </Link>
        </div>
      </div>
      {/* 先生ポスター＆プロフィール */}
      <div
        className="
          w-full flex flex-col items-center
          flex-[4_4_0%] px-0 lg:pl-10 pt-5 lg:pt-0
          max-w-full lg:max-w-[370px] mx-auto
          transition-all
        "
      >
        <div className="relative mb-2 sm:mb-4 w-full flex justify-center">
          <Image
            src="/poster_2025.jpg"
            alt="池尻成二ポスター"
            className="w-[90vw] sm:w-[310px] lg:w-[350px] rounded-2xl shadow-lg border-4 border-primary"
            style={{ maxWidth: 350, height: "auto" }}
            width={350}
            height={350}
            priority
          />
        </div>
        <div className="text-[#192349] font-extrabold text-lg sm:text-xl text-center mt-2">
          練馬区議会議員 池尻成二
        </div>
        <div className="text-blue-700 font-medium text-center text-base mt-2">
          つながる市民・練馬／公式サイト
        </div>
      </div>
    </section>
  );
}
