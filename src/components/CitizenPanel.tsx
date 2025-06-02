import React from "react";
import Image from "next/image";
import { FaTwitter, FaLine, FaFacebookF } from "react-icons/fa";

export default function CitizenPanel() {
  return (
    <div
      className="
        rounded-[60px] bg-white shadow-xl
        flex flex-col items-center justify-center
        w-[220px] h-[320px] border border-gray-100
        hover:shadow-2xl transition-all duration-200
        ring-2 ring-transparent hover:ring-blue-300
        group
      "
      tabIndex={0}
      aria-label="つながる市民・練馬"
    >
      {/* ロゴ画像を最大まで大きく */}
      <a href="https://ikejiriseiji.jp" target="_blank" rel="noopener noreferrer" className="mb-3 mt-2">
        <Image
          src="/eyecatch.jpg"
          width={165}
          height={90.75} // アスペクト比合わせて調整（99=180×0.55）
          alt="つながる市民・練馬"
          className="drop-shadow-sm"
          priority
        />
      </a>
      <div className="font-bold mt-2 mb-2 text-[#192349] text-lg tracking-wide select-none">
        つながる市民・練馬
      </div>
      <div className="flex flex-col gap-2 items-center mt-1 w-full">
        <a
          href="https://twitter.com/"
          className="flex items-center gap-2 text-[#1da1f2] font-bold transition-all hover:scale-110"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter size={21} />
          <span className="hidden md:inline">Twitter</span>
        </a>
        <a
          href="https://line.me/"
          className="flex items-center gap-2 text-[#06C755] font-bold transition-all hover:scale-110"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLine size={21} />
          <span className="hidden md:inline">Line</span>
        </a>
        <a
          href="https://facebook.com/"
          className="flex items-center gap-2 text-[#1877F3] font-bold transition-all hover:scale-110"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebookF size={21} />
          <span className="hidden md:inline">Facebook</span>
        </a>
      </div>
    </div>
  );
}
