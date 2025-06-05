"use client";
import React, { useState } from "react";

const TABS = ["SNS", "お知らせ", "イベント"];

export default function SocialNewsTabs() {
  const [active, setActive] = useState(0);

  return (
    <section
      className="
        w-full py-7 sm:py-10
        bg-gradient-to-b from-white via-[#f6f7fa] to-[#edeffc]/80
        border-t border-primary/10 shadow-inner
        transition-all
      "
    >
      <div className="max-w-4xl mx-auto">
        {/* タブボタン */}
        <div className="flex mb-5 sm:mb-6 space-x-3 sm:space-x-4 justify-center">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`px-4 sm:px-6 py-2 rounded-full font-bold transition duration-200
                ${active === i
                  ? "bg-gradient-to-r from-[#192349] to-[#a20020] text-white shadow-lg scale-105"
                  : "bg-white text-[#192349] border border-primary/20 hover:bg-[#f8f8fd] hover:scale-105"}`}
              onClick={() => setActive(i)}
              style={{
                boxShadow: active === i ? "0 4px 16px rgba(162,0,32,0.09)" : undefined,
                fontSize: "0.96rem",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* タブ中身 */}
        <div>
          {active === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* SNSカードサンプル */}
              <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center hover:scale-105 transition">
                <span className="font-bold text-[#192349] mb-3">X（旧Twitter）</span>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline"
                >公式タイムラインを見る</a>
              </div>
              <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center hover:scale-105 transition">
                <span className="font-bold text-[#192349] mb-3">Facebook</span>
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline"
                >Facebookページ</a>
              </div>
              <div className="bg-white shadow rounded-xl p-5 flex flex-col items-center hover:scale-105 transition">
                <span className="font-bold text-[#192349] mb-3">YouTube</span>
                <a
                  href="https://youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a20020] font-bold hover:underline"
                >YouTubeチャンネル</a>
              </div>
            </div>
          )}
          {active === 1 && (
            <div className="space-y-5">
              {/* お知らせカード */}
              <div className="bg-gradient-to-r from-[#fff7f7] via-white to-[#f7f9ff] border-l-8 border-[#a20020] p-6 rounded-xl shadow hover:scale-105 transition">
                <div className="font-bold text-[#a20020] mb-1">重要なお知らせ</div>
                <div>今週の区議会活動、地域イベントのご案内など最新情報を掲載します。</div>
              </div>
            </div>
          )}
          {active === 2 && (
            <div className="space-y-5">
              {/* イベントカード */}
              <div className="bg-gradient-to-r from-[#edeffc] via-white to-[#fff7f7] border-l-8 border-[#192349] p-6 rounded-xl shadow hover:scale-105 transition">
                <div className="font-bold text-[#192349] mb-1">イベント情報</div>
                <div>開催日時・場所・内容をここに掲載。参加フォームや詳細案内も連携可能。</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
