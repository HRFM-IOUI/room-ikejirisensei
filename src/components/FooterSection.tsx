export default function FooterSection() {
  return (
    <footer className="bg-[#192349] text-white pt-7 sm:pt-10 mt-10 sm:mt-14 shadow-lg relative transition-all">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between items-center space-y-3 sm:space-y-0 px-3 sm:px-4">
        <div className="text-xs sm:text-sm md:text-base font-semibold text-center sm:text-left">
          つながる市民・練馬 池尻成二事務所<br />
          練馬区 東大泉 5-6-9　TEL/FAX: 03-5933-0108
        </div>
        <div className="flex space-x-4 sm:space-x-6 text-xl sm:text-2xl mt-1 sm:mt-0">
          <a href="#" className="hover:text-[#a20020] transition" title="X">🐦</a>
          <a href="#" className="hover:text-[#a20020] transition" title="Facebook">📘</a>
          <a href="#" className="hover:text-[#a20020] transition" title="YouTube">▶️</a>
        </div>
      </div>
      {/* 全幅グラデーションバー */}
      <div className="absolute left-0 bottom-[40px] sm:bottom-[54px] w-full h-1.5 sm:h-2 bg-gradient-to-r from-[#a20020] via-[#192349] to-[#a20020]"></div>
      <div className="text-[10px] sm:text-xs text-center text-white/70 mt-8 sm:mt-12 px-2">
        COPYRIGHT © つながる市民・練馬 池尻成二オフィシャルサイト<br />
        ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
