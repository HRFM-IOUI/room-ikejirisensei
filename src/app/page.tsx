// src/app/page.tsx
"use client";

import React, { useState } from "react";
import MegaMenu from "@/components/MegaMenu";
import HeroLayout from "@/components/HeroLayout";
import FooterSection from "@/components/FooterSection";
import FloatingSearchButton from "@/components/FloatingSearchButton";
import SearchModal from "@/components/SearchModal";
import FloatBottomBar from "@/components/FloatBottomBar";

// ログイン/新規登録ボタンのスタイル
const authButtonStyle: React.CSSProperties = {
  borderRadius: 9,
  fontWeight: 800,
  fontSize: 16,
  padding: "6px 26px",
  cursor: "pointer",
  transition: "background 0.13s, color 0.13s, box-shadow 0.14s",
  boxShadow: "0 2px 8px #19234922",
};

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafd] relative">
      {/* ナビゲーション（メガメニュー） */}
      <MegaMenu />

      {/* ログイン／新規登録ボタン（グローバルメニュー直下、右上配置） */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          gap: 14,
          margin: "18px 0 6px 0",
          paddingRight: 38,
          zIndex: 21,
        }}
      >
        <button
          type="button"
          onClick={() => (window.location.href = "/login")}
          style={{
            ...authButtonStyle,
            background: "#fff",
            color: "#192349",
            border: "2px solid #192349",
          }}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/signup")}
          style={{
            ...authButtonStyle,
            background: "#192349",
            color: "#fff",
            border: "2px solid #192349",
          }}
        >
          新規登録
        </button>
      </div>

      {/* メイン（HeroLayoutが全体の親） */}
      <HeroLayout />

      {/* フッター */}
      <FooterSection />

      {/* PC/タブレット用 未来型フローティング検索ボタン */}
      <FloatingSearchButton onClick={() => setSearchOpen(true)} />

      {/* 検索モーダル（全デバイスで共通表示） */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* モバイル専用: 下部フロートバー/Drawer型UI */}
      <FloatBottomBar />
    </div>
  );
}
