'use client';
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import VideoComments from "./VideoComments";
import VideoCarousel from "./VideoCarousel";

type WanNyanVideo = {
  id: string;
  type: "youtube" | "firestore";
  url: string;
  title: string;
  likes: number;
  comments: number;
};

export default function WanNyanFeed() {
  const [videos, setVideos] = useState<WanNyanVideo[]>([]);
  const [current, setCurrent] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  // 追加：どの動画にいいねしたか localStorageベースで管理
  const [liked, setLiked] = useState<{ [id: string]: boolean }>({});

  // 初回マウント時、localStorageから読み込み
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("likedVideos") : null;
    setLiked(raw ? JSON.parse(raw) : {});
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      const colRef = collection(db, "wannyanVideos");
      const snapshot = await getDocs(colRef);
      const items = snapshot.docs.map(doc => ({
        ...(doc.data() as Omit<WanNyanVideo, 'id'>),
        id: doc.id,
      }));
      setVideos(items);
    };
    fetchVideos();
  }, []);

  // 動画切り替え（PCホイール/スマホスワイプ）
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && current < videos.length - 1) setCurrent(c => c + 1);
    else if (e.deltaY < 0 && current > 0) setCurrent(c => c - 1);
  };
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 50 && current > 0) setCurrent(c => c - 1);
    if (deltaY < -50 && current < videos.length - 1) setCurrent(c => c + 1);
  };

  // いいね処理
  const handleLike = async (id: string) => {
    // 既にいいね済みならスルー
    if (liked[id]) return;
    await updateDoc(doc(db, "wannyanVideos", id), { likes: increment(1) });
    setVideos(vs =>
      vs.map(v => v.id === id ? { ...v, likes: v.likes + 1 } : v)
    );
    // localStorageにも反映
    const newLiked = { ...liked, [id]: true };
    setLiked(newLiked);
    if (typeof window !== "undefined") {
      localStorage.setItem("likedVideos", JSON.stringify(newLiked));
    }
  };

  if (videos.length === 0) {
    return <div style={{ color: "#333", textAlign: "center", marginTop: 80 }}>動画を読み込み中…</div>;
  }

  const v = videos[current];

  const renderVideo = () =>
    v.type === "youtube" ? (
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${v.url}?autoplay=1&mute=1&loop=1&playlist=${v.url}`}
        title={v.title}
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%", height: "100%",
          minHeight: "220px", maxHeight: "60vw", background: "#000", border: "none",
          borderRadius: 12,
        }}
      />
    ) : (
      <video
        src={v.url}
        controls
        autoPlay
        loop
        muted
        style={{
          width: "100%", height: "100%",
          minHeight: "220px", maxHeight: "60vw",
          background: "#000", objectFit: "cover", borderRadius: 12,
        }}
        playsInline
        preload="metadata"
      />
    );

  return (
    <section
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        background: "#fafbff",
        padding: "30px 0 60px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 6px 32px 0 #0001",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          padding: "20px 0 12px 0",
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* メイン動画 */}
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 12 }}>
          {renderVideo()}
        </div>

        {/* いいねボタン */}
        <div style={{ margin: "14px 0 4px 0", textAlign: "left", width: "92%" }}>
          <button
            onClick={() => handleLike(v.id)}
            disabled={!!liked[v.id]}
            style={{
              background: "none", border: "none", cursor: liked[v.id] ? "not-allowed" : "pointer", fontSize: 28,
              color: liked[v.id] ? "#bbb" : "#f36", marginRight: 7, verticalAlign: "middle",
              opacity: liked[v.id] ? 0.7 : 1
            }}
            title={liked[v.id] ? "すでにいいね済み" : "いいね"}
          >♥</button>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#f36", verticalAlign: "middle" }}>
            {v.likes}
          </span>
          <span style={{ marginLeft: 12, color: "#333", fontSize: 16, verticalAlign: "middle" }}>いいね</span>
        </div>

        {/* コメント欄 */}
        <div style={{ width: "96%", margin: "6px auto 0 auto" }}>
          <VideoComments videoId={v.id} />
        </div>
      </div>

      {/* カルーセル（おすすめ動画） */}
      <div style={{ width: "100%", maxWidth: 700, margin: "20px auto 0 auto" }}>
        <VideoCarousel
          videos={videos}
          current={current}
          onSelect={setCurrent}
        />
      </div>
    </section>
  );
}
