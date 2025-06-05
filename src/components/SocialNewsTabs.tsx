"use client";
import React, { useState } from "react";

// 深い赤は #a20020 で統一
const TABS = ["SNS", "お知らせ", "イベント"];

export default function SocialNewsTabs() {
  const [active, setActive] = useState(0);

  return (
    <section className={`
      w-full py-7 sm:py-10
      bg-gradient-to-b from-white via-[#f6f7fa] to-[#edeffc]/80
      border-t border-primary/10 shadow-inner
      transition-all
    `}>
      <div className="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-4">
        {/* タブボタン */}
        <div className={`
          flex mb-5 sm:mb-6 space-x-3 sm:space-x-4
          overflow-x-auto no-scrollbar
          justify-start sm:justify-center
        `}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`
                px-5 py-2 rounded-full font-bold transition duration-200 flex-shrink-0
                text-xs sm:text-base
                ${active === i
                  ? "bg-gradient-to-r from-[#192349] to-[#a20020] text-white shadow-lg scale-105"
                  : "bg-white text-[#192349] border border-primary/20 hover:bg-[#f8f8fd] hover:scale-105"}
              `}
              style={{
                boxShadow: active === i ? "0 4px 16px rgba(162,0,32,0.09)" : undefined,
                minWidth: 92
              }}
              onClick={() => setActive(i)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* タブ中身 */}
        <div>
          {active === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* SNSカードサンプル */}
              <div className="bg-white/90 shadow rounded-2xl p-5 flex flex-col items-center hover:scale-105 transition border border-[#eaeaea]">
                <span className="font-bold text-[#192349] mb-3 text-sm sm:text-base">X（旧Twitter）</span>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-xs sm:text-base"
                >公式タイムラインを見る</a>
              </div>
              <div className="bg-white/90 shadow rounded-2xl p-5 flex flex-col items-center hover:scale-105 transition border border-[#eaeaea]">
                <span className="font-bold text-[#192349] mb-3 text-sm sm:text-base">Facebook</span>
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-xs sm:text-base"
                >Facebookページ</a>
              </div>
              <div className="bg-white/90 shadow rounded-2xl p-5 flex flex-col items-center hover:scale-105 transition border border-[#eaeaea]">
                <span className="font-bold text-[#192349] mb-3 text-sm sm:text-base">YouTube</span>
                <a
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-xs sm:text-base"
                >YouTubeチャンネル</a>
              </div>
            </div>
          )}
          {active === 1 && (
            <div className="space-y-4 sm:space-y-5">
              {/* お知らせカード */}
              <div className="bg-gradient-to-r from-[#fff7f7]/90 via-white to-[#f7f9ff]/90 border-l-8 border-[#a20020] p-5 sm:p-6 rounded-xl shadow hover:scale-105 transition">
                <div className="font-bold text-[#a20020] mb-1 text-sm sm:text-base">重要なお知らせ</div>
                <div className="text-xs sm:text-base">今週の区議会活動、地域イベントのご案内など最新情報を掲載します。</div>
              </div>
              {/* 追加のお知らせカードも同様に追加OK */}
            </div>
          )}
          {active === 2 && (
            <div className="space-y-4 sm:space-y-5">
              {/* イベントカード */}
              <div className="bg-gradient-to-r from-[#edeffc]/80 via-white to-[#fff7f7]/80 border-l-8 border-[#192349] p-5 sm:p-6 rounded-xl shadow hover:scale-105 transition">
                <div className="font-bold text-[#192349] mb-1 text-sm sm:text-base">イベント情報</div>
                <div className="text-xs sm:text-base">開催日時・場所・内容をここに掲載。参加フォームや詳細案内も連携可能。</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ノースクロールバー用CSS */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
