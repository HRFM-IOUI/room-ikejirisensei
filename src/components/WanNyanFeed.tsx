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
          height="80vh"
          src={`https://www.youtube.com/embed/${v.url}?autoplay=1&mute=1&loop=1&playlist=${v.url}`}
          title={v.title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
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
        style={{
          width: "100vw",
          height: "80vh",
          objectFit: "cover",
          borderRadius: 8,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
        }}
        playsInline
        preload="metadata"
      />
    );
  };

  return (
    <section style={{ background: "#000", width: "100vw", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        tabIndex={0}
        style={{
          position: "relative",
          width: "100vw",
          height: "90vh",
          overflow: "hidden",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            background: "rgba(0,0,0,0.35)",
            zIndex: 2,
          }}
        >
          {renderVideo()}
          <div style={{
            color: "#fff",
            background: "rgba(25,35,73,0.65)",
            width: "100vw",
            padding: "16px 24px",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontWeight: 700 }}>{v.title}</div>
              <div style={{ fontSize: "1rem", marginTop: 6 }}>
                ❤️ {v.likes}　💬 {v.comments}
              </div>
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}>
              <Image
                src={v.profileIcon || "/wan_nyan_icon.png"}
                width={46}
                height={46}
                style={{ borderRadius: "50%", border: "2px solid #fff" }}
                alt={v.title + "のアイコン"}
                unoptimized
              />
              <button style={{
                marginTop: 8,
                background: "#fff",
                color: "#192349",
                borderRadius: "18px",
                border: "none",
                fontWeight: 600,
                padding: "4px 12px"
              }}>フォロー</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
