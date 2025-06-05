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
    return <div style={{ color: "#333", textAlign: "center", marginTop: 80 }}>動画を読み込み中…</div>;
  }

  const v = videos[current];

  // YouTube/Firestore 動画の自動切り替え
  const renderVideo = () => {
    if (v.type === "youtube") {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${v.url}?autoplay=1&mute=1&loop=1&playlist=${v.url}`}
          title={v.title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-md md:rounded-lg shadow-lg"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "220px",
            maxHeight: "62vw",
            background: "#000",
            border: "none"
          }}
        />
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
        className="rounded-md md:rounded-lg shadow-lg"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "220px",
          maxHeight: "62vw",
          background: "#000",
          objectFit: "cover",
        }}
        playsInline
        preload="metadata"
      />
    );
  };

  return (
    <section
      className="
        w-full
        bg-[#000] 
        flex flex-col items-center justify-center
        py-4 sm:py-8
        transition-all
        "
      style={{ minHeight: "320px" }}
    >
      <div
        tabIndex={0}
        className="
          w-full
          max-w-full
          md:max-w-2xl
          mx-auto
          flex flex-col
          items-center
          justify-center
          overflow-hidden
        "
        style={{ background: "#000", borderRadius: 12 }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full aspect-video bg-black">
          {renderVideo()}
        </div>
        <div
          className="
            w-full
            flex flex-col sm:flex-row
            items-center sm:items-end
            justify-between
            px-2 py-3 sm:px-5 sm:py-3
            gap-2 sm:gap-0
            bg-[#191929a6]
            rounded-b-md md:rounded-b-lg
            text-white
            text-xs sm:text-base
            shadow-lg
          "
        >
          <div className="flex-1 w-full text-left">
            <div className="font-bold truncate">{v.title}</div>
            <div className="mt-1">
              ❤️ {v.likes}　💬 {v.comments}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <Image
              src={v.profileIcon || "/wan_nyan_icon.png"}
              width={34}
              height={34}
              className="rounded-full border-2 border-white"
              alt={v.title + "のアイコン"}
              unoptimized
            />
            <button className="
              mt-1 sm:mt-2
              bg-white text-[#192349]
              rounded-lg
              font-bold
              px-2 py-1 text-xs sm:text-sm
              border-none
              hover:bg-gray-100
              transition
              shadow
            ">
              フォロー
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
