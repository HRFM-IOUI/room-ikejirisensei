import MegaMenu from "../components/MegaMenu";
import HeroLayout from "../components/HeroLayout";
import FooterSection from "../components/FooterSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* MegaMenu（ヘッダー固定） */}
      <header className="w-full z-50">
        <MegaMenu />
      </header>
      {/* Hero本体 */}
      <main className="flex-1 flex w-full justify-between items-start">
        <HeroLayout />
      </main>
      {/* フッター */}
      <footer className="w-full z-40">
        <FooterSection />
      </footer>
    </div>
  );
}
