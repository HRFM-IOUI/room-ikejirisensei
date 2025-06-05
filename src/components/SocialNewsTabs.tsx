"use client";
import React, { useState } from "react";

// 深い赤は #a20020 で統一
const TABS = ["SNS", "お知らせ", "イベント"];

export default function SocialNewsTabs() {
  const [active, setActive] = useState(0);

  return (
    <section
      className="
        w-full
        py-6 sm:py-10
        bg-gradient-to-b from-white via-[#f6f7fa] to-[#edeffc]/80
        border-t border-primary/10
        shadow-inner
        transition-all
      "
    >
      <div className="max-w-4xl mx-auto px-1 sm:px-3">
        {/* タブボタン */}
        <div className="flex mb-5 gap-2 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`
                px-4 py-1.5 sm:px-6 sm:py-2 rounded-full font-bold
                whitespace-nowrap transition
                text-sm sm:text-base
                ${
                  active === i
                    ? "bg-gradient-to-r from-[#192349] to-[#a20020] text-white shadow-lg scale-105"
                    : "bg-white text-[#192349] border border-primary/20 hover:bg-[#f8f8fd] hover:scale-105"
                }
              `}
              onClick={() => setActive(i)}
              style={{
                boxShadow:
                  active === i
                    ? "0 4px 16px rgba(162,0,32,0.09)"
                    : undefined,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* タブ中身 */}
        <div>
          {active === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* SNSカードサンプル */}
              <div className="bg-white shadow rounded-xl p-4 sm:p-5 flex flex-col items-center hover:scale-105 transition text-center">
                <span className="font-bold text-[#192349] mb-2 sm:mb-3 text-sm sm:text-base">X（旧Twitter）</span>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-sm sm:text-base"
                >
                  公式タイムラインを見る
                </a>
              </div>
              <div className="bg-white shadow rounded-xl p-4 sm:p-5 flex flex-col items-center hover:scale-105 transition text-center">
                <span className="font-bold text-[#192349] mb-2 sm:mb-3 text-sm sm:text-base">Facebook</span>
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-sm sm:text-base"
                >
                  Facebookページ
                </a>
              </div>
              <div className="bg-white shadow rounded-xl p-4 sm:p-5 flex flex-col items-center hover:scale-105 transition text-center">
                <span className="font-bold text-[#192349] mb-2 sm:mb-3 text-sm sm:text-base">YouTube</span>
                <a
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline text-sm sm:text-base"
                >
                  YouTubeチャンネル
                </a>
              </div>
            </div>
          )}
          {active === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-gradient-to-r from-[#fff7f7] via-white to-[#f7f9ff] border-l-4 sm:border-l-8 border-[#a20020] p-4 sm:p-6 rounded-xl shadow hover:scale-105 transition text-sm sm:text-base">
                <div className="font-bold text-[#a20020] mb-1">重要なお知らせ</div>
                <div>今週の区議会活動、地域イベントのご案内など最新情報を掲載します。</div>
              </div>
              {/* 追加カードも同様に追加OK */}
            </div>
          )}
          {active === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-gradient-to-r from-[#edeffc] via-white to-[#fff7f7] border-l-4 sm:border-l-8 border-[#192349] p-4 sm:p-6 rounded-xl shadow hover:scale-105 transition text-sm sm:text-base">
                <div className="font-bold text-[#192349] mb-1">イベント情報</div>
                <div>開催日時・場所・内容をここに掲載。参加フォームや詳細案内も連携可能。</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* hide-scrollbar（必要ならグローバルCSSに追加） */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
