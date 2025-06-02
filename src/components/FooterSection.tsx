// src/components/FooterSection.tsx
export default function FooterSection() {
  return (
    <footer className="bg-[#192349] text-white pt-10 mt-14 shadow-lg relative">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:justify-between items-center space-y-5 md:space-y-0 px-4">
        <div className="text-sm md:text-base font-semibold">
          つながる市民・練馬 池尻成二事務所<br />
          練馬区 東大泉 5-6-9　TEL/FAX: 03-5933-0108
        </div>
        <div className="flex space-x-6 text-2xl">
          <a href="#" className="hover:text-[#a20020] transition" title="X">🐦</a>
          <a href="#" className="hover:text-[#a20020] transition" title="Facebook">📘</a>
          <a href="#" className="hover:text-[#a20020] transition" title="YouTube">▶️</a>
        </div>
      </div>
      {/* ここで「全幅」バーを外側に */}
      <div className="absolute left-0 bottom-[54px] w-full h-2 bg-gradient-to-r from-[#a20020] via-[#192349] to-[#a20020]"></div>
      <div className="text-xs text-center text-white/70 mt-12">
        COPYRIGHT © つながる市民・練馬 池尻成二オフィシャルサイト<br />
        ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
