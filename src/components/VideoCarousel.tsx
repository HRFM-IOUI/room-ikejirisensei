'use client';
import React from "react";

type Video = {
  id: string;
  title: string;
};

export default function VideoCarousel({
  videos,
  current,
  onSelect,
}: {
  videos: Video[];
  current: number;
  onSelect: (i: number) => void;
}) {
  // スクロール可能なカルーセル（今は横並び/ボタン移動）
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        overflowX: "auto",
        padding: "12px 0",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 12px #0001",
        minHeight: 95,
      }}
    >
      {videos.map((v, i) => (
        <div
          key={v.id}
          onClick={() => onSelect(i)}
          style={{
            minWidth: 88,
            maxWidth: 110,
            cursor: "pointer",
            background: i === current ? "#cbe5ff" : "#f3f7ff",
            border: i === current ? "2px solid #5b8dee" : "1px solid #d0dbe7",
            borderRadius: 7,
            boxShadow: i === current ? "0 2px 7px #5b8dee2d" : "0 1px 5px #d0dbe71d",
            padding: "6px 4px",
            textAlign: "center",
            marginRight: 5,
            transition: "all .13s",
          }}
        >
          <div
            style={{
              background: "#111",
              borderRadius: 5,
              height: 54,
              width: "100%",
              marginBottom: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              overflow: "hidden",
            }}
          >
            {/* サムネ生成は将来拡張 */}
            {v.title.slice(0, 8)}
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#444",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {v.title}
          </div>
        </div>
      ))}
    </div>
  );
}
