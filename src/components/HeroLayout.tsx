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
const SIDE_PANEL_WIDTH = 248;
const SIDE_MARGIN = 8;

export default function HeroLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative flex w-full min-h-[calc(100vh-180px)] mx-auto pt-10 pb-8">
      {/* 左サイドパネル */}
      <div
        className="hidden lg:flex flex-col items-center fixed z-30"
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

      {/* メイン中央 */}
      <div
        className="flex-1 flex flex-col items-center mx-auto"
        style={{
          marginLeft: SIDE_PANEL_WIDTH + SIDE_MARGIN + 30,   // ← 8pxから-2px、右へ10px
          marginRight: SIDE_PANEL_WIDTH + SIDE_MARGIN + 30, // ← 8pxから+18px、右へ10px
          maxWidth: "1200px",
        }}
      >
        <HeroSection />
        <Greeting />
        <WanNyanFeed />
        <SocialNewsTabs />
      </div>

      {/* 右サイドパネル */}
      <div
        className="hidden lg:flex flex-col fixed z-30 w-64"
        style={{
          top: 90,
          right: SIDE_MARGIN,
          maxHeight: `calc(100vh - ${FOOTER_HEIGHT + 24}px)`,
          overflowY: "auto",
        }}
      >
        <SideMenu />
      </div>

      {/* 検索ボタン */}
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
