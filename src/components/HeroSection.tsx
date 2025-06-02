import React from "react";

const blogPosts = [
  {
    title: "「ふるやま葉子」さんの推薦を決定　～都議会議員選挙2025～",
    url: "https://ikejiriseiji.jp/blog/2025/05/18/some-post-title",
    date: "2025年5月18日",
    image: "/sample1.jpg",
  },
  {
    title: "地域包括ケアの“要（かなめ）”が揺らぐ　～センター入員基準の引き下げ～",
    url: "https://ikejiriseiji.jp/blog/2025/04/01/other-post-title",
    date: "2025年4月1日",
    image: "/sample2.jpg",
  },
  {
    title: "練馬区も、「ビル風」対策を!!　～石神井再開発問題～",
    url: "https://ikejiriseiji.jp/blog/2025/03/21/yet-another-title",
    date: "2025年3月21日",
    image: "/sample3.jpg",
  },
];

export default function HeroSection() {
  return (
    <section
      className="w-full flex flex-col lg:flex-row gap-8 py-8 bg-white border-b-8 border-primary rounded-b-2xl shadow-lg mx-auto"
      style={{
        maxWidth: '1180px', // 全体をやや広げ中央寄せ
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {/* 左：最新記事リスト */}
      <div
        className="flex-[6_6_0%] min-w-0 border-r border-gray-200 pr-4"
        style={{
          maxWidth: 490, // 少しだけ縮めて調整
        }}
      >
        <h2 className="text-2xl font-extrabold text-[#192349] mb-6 border-b-4 border-[#192349] pb-2 tracking-wide drop-shadow-sm">最新記事</h2>
        <ul className="flex flex-col gap-6">
          {blogPosts.map((p, idx) => (
            <li
              key={idx}
              className={`
                flex items-center gap-4 p-4 bg-white
                rounded-tl-2xl rounded-br-2xl rounded-tr-lg rounded-bl-lg
                border-t-2 border-b-2 border-[#192349]
                shadow-[0_2px_8px_0_rgba(25,35,73,0.06)]
                hover:shadow-lg hover:scale-[1.03] hover:border-[#004080] transition-all
                duration-150
              `}
              style={{
                borderLeft: "none",
                borderRight: "none",
              }}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-20 h-20 object-cover rounded-xl border border-[#192349]/10"
                />
              )}
              <div className="flex-1 min-w-0">
                <a
                  href={p.url}
                  className="block text-lg font-bold text-[#192349] hover:text-blue-700 hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.title}
                </a>
                <div className="text-xs text-[#192349] opacity-70 mt-2">{p.date}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* 右：先生ポスター＆プロフィール（やや大きく・中央寄せ） */}
      <div
        className="flex flex-col items-center flex-[4_4_0%] w-full px-0 lg:pl-10 pt-6 lg:pt-0"
        style={{
          maxWidth: 370, // 少し拡大
        }}
      >
        <div className="relative mb-4">
          <img
            src="/poster_2025.jpg"
            alt="池尻成二ポスター"
            className="w-[310px] lg:w-[350px] rounded-2xl shadow-lg border-4 border-primary"
            style={{
              maxWidth: 350,
              height: 'auto',
            }}
          />
        </div>
        <div className="text-[#192349] font-extrabold text-xl text-center mt-2">練馬区議会議員 池尻成二</div>
        <div className="text-blue-700 font-medium text-center text-base mt-2">
          つながる市民・練馬／公式サイト
        </div>
      </div>
    </section>
  );
}
