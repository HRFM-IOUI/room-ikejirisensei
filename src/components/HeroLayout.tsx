"use client";
import React, { useState } from "react";
import HeroSection from "./HeroSection";
import Greeting from "./Greeting";
import WanNyanFeed from "./WanNyanFeed";
import SocialNewsTabs from "./SocialNewsTabs";
import CitizenPanel from "./CitizenPanel";
import AccessibilityPanel from "./AccessibilityPanel";
import SideMenu from "./SideMenu";
import SearchButton from "./SearchButton";
import SearchModal from "./SearchModal";

const FOOTER_HEIGHT = 110;
const SIDE_MARGIN = 8;

export default function HeroLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      className="
        relative w-full flex flex-col items-center
        min-h-[calc(100vh-180px)] mx-auto pt-4 pb-8
        sm:pt-10 sm:pb-8
      "
    >
      {/* 左サイドパネル（PC/タブレットのみ） */}
      <div
        className="
          hidden lg:flex flex-col items-center fixed z-30
        "
        style={{
          top: 90,
          left: SIDE_MARGIN,
          maxHeight: `calc(100vh - ${FOOTER_HEIGHT + 24}px)`,
          overflowY: "auto",
        }}
      >
        <CitizenPanel />
        <AccessibilityPanel className="mt-4" />
      </div>

      {/* === モバイル専用 CitizenPanel（HeroSection直上） === */}
      <div className="block lg:hidden w-full flex justify-center pt-2 pb-2 bg-white z-20">
        <CitizenPanel />
      </div>
      {/* === ここまで === */}

      {/* メイン中央 */}
      <div
        className="
          flex flex-col items-center w-full
          max-w-full px-1
          sm:px-2 md:px-4
          lg:mx-auto lg:max-w-[1200px] lg:pl-[290px] lg:pr-[290px]
          transition-all
        "
      >
        <HeroSection />
        <Greeting />
        <WanNyanFeed />
        <SocialNewsTabs />
      </div>

      {/* 右サイドパネル（PC/タブレットのみ） */}
      <div
        className="
          hidden lg:flex flex-col fixed z-30 w-64
        "
        style={{
          top: 90,
          right: SIDE_MARGIN,
          maxHeight: `calc(100vh - ${FOOTER_HEIGHT + 24}px)`,
          overflowY: "auto",
        }}
      >
        <SideMenu />
      </div>

      {/* 検索ボタン（PC/タブレットのみ） */}
      <div
        className="hidden lg:block fixed z-50"
        style={{
          right: SIDE_MARGIN,
          bottom: SIDE_MARGIN,
        }}
      >
        <SearchButton onClick={() => setIsSearchOpen(true)} />
      </div>

      {/* 検索モーダル */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
