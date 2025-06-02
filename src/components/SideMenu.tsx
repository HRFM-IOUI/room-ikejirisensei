import React from "react";

// 余白徹底カット、メニューと事務所情報のみ
export default function SideMenu() {
  return (
    <aside
      className="
        fixed top-[72px] right-[1mm] w-[250px]
        bg-gradient-to-br from-[#1e275a] via-[#192349] to-[#1e275a]
        text-white rounded-3xl shadow-2xl z-40
        p-0 border border-white/10
        flex flex-col
        overflow-hidden
      "
      style={{
        minHeight: "unset",
        height: "auto",
        justifyContent: "flex-start",
      }}
      aria-label="サイトメニュー"
    >
      <div className="flex flex-col w-full px-6 pt-6 pb-0">
        {/* メニューリスト本体（余白徹底削除） */}
        <div>
          <div className="font-bold text-lg mb-2 tracking-wide">メニュー</div>
          <nav>
            <ul className="text-base leading-8">
              <li>
                <span className="hover:underline">守れ、大二中！掲示板</span>
              </li>
              <li>
                <span className="hover:underline">アーカイブ（書庫）</span>
              </li>
              <li>
                <span className="hover:underline">つながる市民・練馬（入会・寄付）</span>
              </li>
              <li>
                <span className="hover:underline">サイトポリシー</span>
              </li>
              <li>
                <span className="hover:underline">プライバシーポリシー</span>
              </li>
              <li>
                <span className="hover:underline">特定商取引法表記</span>
              </li>
            </ul>
          </nav>
        </div>
        {/* メニューと事務所情報の間は仕切り線のみ・上下の余白ゼロ */}
        <hr className="border-t border-white/20 my-0" />
        {/* 事務所情報（下余白ゼロ） */}
        <div className="text-base leading-6 font-normal mt-0 mb-0 py-2 px-0 text-center">
          池尻成二事務所<br />
          練馬区東大泉5-6-9<br />
          Tel&amp;Fax<br />
          <a href="tel:0359330108" className="text-[#43A9E6] font-bold">
            03-5933-0108
          </a>
        </div>
      </div>
    </aside>
  );
}
