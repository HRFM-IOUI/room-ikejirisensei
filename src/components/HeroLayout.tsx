"use client";
import React, { useState, useEffect } from "react";
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
const SIDE_PANEL_WIDTH = 256; // px

export default function HeroLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // クライアント幅をstateで管理
  const [clientWidth, setClientWidth] = useState<number | null>(null);

  useEffect(() => {
    // クライアントマウント後のみwindowが使える
    function handleResize() {
      setClientWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // PC時だけ左右パディングをつける
  const mainStyle =
    clientWidth !== null && clientWidth >= 1024
      ? {
          paddingLeft: SIDE_PANEL_WIDTH + SIDE_MARGIN,
          paddingRight: SIDE_PANEL_WIDTH + SIDE_MARGIN,
        }
      : {};

  return (
    <div
      className="
        relative w-full flex flex-col items-center
        min-h-[calc(100vh-180px)] mx-auto pt-4 pb-8
        sm:pt-10 sm:pb-8
      "
    >
      {/* CitizenPanel（モバイル時は中央） */}
      <div className="block lg:hidden w-full flex justify-center mb-4 sm:mb-6">
        <div
          className="
            w-full max-w-[380px] sm:max-w-[440px]
            mx-auto
            px-4 py-6
            bg-white shadow-xl rounded-3xl
            flex flex-col items-center
          "
          style={{ width: '90vw', maxWidth: 440 }}
        >
          <CitizenPanel />
        </div>
      </div>

      {/* 左サイドパネル（PC/タブレットのみ） */}
      <div
        className="
          hidden lg:flex flex-col items-center fixed z-30
        "
        style={{
          top: 90,
          left: SIDE_MARGIN,
          width: SIDE_PANEL_WIDTH,
          maxWidth: SIDE_PANEL_WIDTH,
          maxHeight: `calc(100vh - ${FOOTER_HEIGHT + 24}px)`,
          overflowY: "auto",
        }}
      >
        <CitizenPanel />
        <AccessibilityPanel className="mt-4" />
      </div>

      {/* メイン中央 */}
      <div
        className="
          flex flex-col items-center w-full
          max-w-full px-1
          sm:px-2 md:px-4
          lg:mx-auto lg:max-w-[1500px]
          transition-all
        "
        style={mainStyle}
      >
        <HeroSection />
        <Greeting />
        <WanNyanFeed />
        <SocialNewsTabs />
      </div>

      {/* 右サイドパネル（PC/タブレットのみ） */}
      <div
        className="
          hidden lg:flex flex-col fixed z-30
        "
        style={{
          top: 90,
          right: SIDE_MARGIN,
          width: SIDE_PANEL_WIDTH,
          maxWidth: SIDE_PANEL_WIDTH,
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
