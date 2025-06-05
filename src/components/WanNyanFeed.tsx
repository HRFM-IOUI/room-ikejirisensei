'use client';
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

type WanNyanVideo = {
  type: "youtube" | "firestore";
  url: string; // YouTubeは動画ID, Firestoreは動画URL
  title: string;
  likes: number;
  comments: number;
  profileIcon?: string;
};

export default function WanNyanFeed() {
  const [videos, setVideos] = useState<WanNyanVideo[]>([]);
  const [current, setCurrent] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      const colRef = collection(db, "wannyanVideos");
      const snapshot = await getDocs(colRef);
      const items = snapshot.docs.map(doc => doc.data() as WanNyanVideo);
      setVideos(items);
    };
    fetchVideos();
  }, []);

  // ホイール/スワイプで動画切替
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && current < videos.length - 1) setCurrent(c => c + 1);
    else if (e.deltaY < 0 && current > 0) setCurrent(c => c - 1);
  };

  // スワイプ判定
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 50 && current > 0) setCurrent(c => c - 1);
    if (deltaY < -50 && current < videos.length - 1) setCurrent(c => c + 1);
  };

  if (videos.length === 0) {
    return <div className="text-center mt-16 text-gray-500">動画を読み込み中…</div>;
  }

  const v = videos[current];

  // 動画プレイヤー：レスポンシブサイズで表示
  const renderVideo = () => {
    if (v.type === "youtube") {
      return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${v.url}?autoplay=1&mute=1&loop=1&playlist=${v.url}`}
            title={v.title}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{
              borderRadius: 12,
              background: "#000"
            }}
          />
        </div>
      );
    }
    // Firestoreアップロード動画
    return (
      <video
        src={v.url}
        controls
        autoPlay
        loop
        muted
        className="w-full aspect-video bg-black rounded-xl"
        style={{
          objectFit: "cover",
          borderRadius: 12,
        }}
        playsInline
        preload="metadata"
      />
    );
  };

  return (
    <section
      className="
        bg-gradient-to-b from-[#222c44] via-[#1d243a] to-[#18181b]
        w-full flex flex-col items-center justify-center
        py-10 sm:py-16 px-0
        min-h-[60vw] sm:min-h-[340px] md:min-h-[450px]
        transition-all
      "
    >
      <div
        tabIndex={0}
        className="
          relative w-full max-w-xl sm:max-w-2xl lg:max-w-4xl
          flex flex-col items-center justify-center
          rounded-2xl shadow-xl
          bg-black/40 backdrop-blur-md
          overflow-hidden
          p-0
        "
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 動画本体 */}
        {renderVideo()}
        {/* 下部パネル */}
        <div className="
          w-full flex items-center justify-between
          bg-gradient-to-t from-[#192349bb] to-transparent
          px-4 sm:px-6 py-3 sm:py-4
          rounded-b-2xl
          backdrop-blur
        ">
          {/* 左：動画タイトル等 */}
          <div>
            <div className="font-bold text-white text-base sm:text-lg mb-1">{v.title}</div>
            <div className="text-xs sm:text-sm text-blue-100">
              ❤️ {v.likes}　💬 {v.comments}
            </div>
          </div>
          {/* 右：アイコン＋フォローボタン */}
          <div className="flex flex-col items-center gap-2">
            <Image
              src={v.profileIcon || "/wan_nyan_icon.png"}
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow"
              alt={v.title + "のアイコン"}
              unoptimized
            />
            <button className="
              mt-1 rounded-2xl px-4 py-1
              bg-white text-[#192349] font-bold text-xs sm:text-sm shadow
              hover:bg-blue-50 active:scale-95 transition
            ">フォロー</button>
          </div>
        </div>
      </div>
      {/* ページャー・インジケーターなど追加したい場合ここに */}
    </section>
  );
}
