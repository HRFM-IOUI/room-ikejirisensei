export default function Greeting() {
  return (
    <section
      className="
        w-full bg-white
        py-6 sm:py-10 px-2 sm:px-4 flex justify-center border-b border-primary/20
      "
    >
      <div className="max-w-2xl w-full">
        {/* --- 見出し: 浮かび上がるブルーシャドウ&帯 --- */}
        <div className="mb-4 sm:mb-6">
          <h2
            className="
              text-xl sm:text-3xl font-extrabold tracking-wide text-[#192349]
              drop-shadow-[0_2px_8px_rgba(25,35,73,0.13)]
              relative z-10
            "
            style={{
              letterSpacing: "0.04em",
            }}
          >
            ご挨拶
          </h2>
          {/* ブルー系グラデーションのアクセントライン */}
          <div className="h-1.5 w-12 sm:w-16 mt-2 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-800 shadow-md" />
        </div>
        {/* --- 挨拶文 --- */}
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
            練馬区議会議員の池尻成二です。<br />
            ボトムアップで政治を変える。地域から、現場から、政治を市民の手に取り戻す。そんな思いで、区政と向き合っています。
            大切にしてきた合言葉、目指す政治の方向は、<span className="text-primary font-bold">“ともに生きる　ともにつくる”</span>。
          </p>
          <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
            はじめて区議会議員選挙に挑戦したのは、1991年。地盤も看板も、ましてカバンなどない、果敢だけれども無謀な挑戦は、とても厳しい結果に終わりました。その後、落選を重ねましたが、地域のつながりを育て、志をともにしてくれる仲間に恵まれ、4度目の挑戦で2003年に初当選。どんなに苦しくても、既成の政党や出来合いの組織にたよらず、一人一人の思いと力をつなぎ直すことが政治を立て直す道だと信じ、以来、20年になります。
          </p>
          <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
            その間、2014年には区長選挙にチャレンジ、また2021年には都議会議員選挙にも挑戦しました。いずれも力及ばず悔しい結果に終わりましたが、練馬のまちと暮らし、人と思いに根差したいという原点は変わることはなく、区議会議員としては6期目を迎えています。
          </p>
          <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
            九州・福岡の出身です。三人の子どもたちはすでに皆、社会人となりました。石神井公園駅からそう遠くない三原台の賃貸マンションで、夫婦二人で暮らしています。
          </p>
          <p className="text-sm sm:text-base text-gray-900 leading-relaxed">
            ともに選挙をたたかい、政治と向き合ってきた皆さんと、2021年、
            <span className="text-red-600 font-bold">つながる市民・練馬</span>
            を発足させました。世田谷区の保坂区長などとともに、
            <span className="text-blue-800 font-bold">LIN-Net (Local Initiative Network)&nbsp;</span>
            の呼びかけにも加わりました。<br />
            <span className="font-semibold">
              Think Gobally, Act Locally!! ～地球大の視野を持って考え、地域から行動する～。
            </span>
            志は高く、目線は低く、そんな姿勢を忘れることなく、努力を続けます。
          </p>
          <p className="text-right text-gray-900 font-bold mt-6 sm:mt-8">
            つながる市民・練馬　代表／練馬区議会議員<br />
            <span className="text-lg sm:text-2xl font-signature block text-primary mt-1">池尻成二</span>
          </p>
        </div>
      </div>
    </section>
  );
}
