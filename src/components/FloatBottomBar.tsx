"use client";
import { useState } from "react";
import { FaSearch, FaBars, FaUniversalAccess } from "react-icons/fa";
import * as Dialog from "@radix-ui/react-dialog";
import AccessibilityPanel from "./AccessibilityPanel";
import SideMenu from "./SideMenu";
import SearchModal from "./SearchModal";

// スマホ・タブレットでのみ表示
export default function FloatBottomBar() {
  const [openMenu, setOpenMenu] = useState<null | "access" | "menu" | "search">(null);

  return (
    <div
      className="
        fixed z-[120] bottom-0 left-0 w-full h-20
        flex justify-around items-center
        bg-white/80 backdrop-blur-md
        shadow-[0_0_24px_4px_rgba(25,35,73,0.12)]
        border-t border-primary/10
        rounded-t-2xl
        md:flex
        lg:hidden
        animate-fadeIn
        transition-all
      "
      style={{ opacity: 0.96 }}
    >
      {/* アクセシビリティDrawer */}
      <Dialog.Root open={openMenu === "access"} onOpenChange={v => setOpenMenu(v ? "access" : null)}>
        <Dialog.Trigger asChild>
          <button className="flex flex-col items-center group" aria-label="アクセシビリティ">
            <FaUniversalAccess size={26} className="mb-1 text-[#192349] group-hover:scale-110 transition" />
            <span className="text-xs">設定</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-fadeIn" />
          <Dialog.Content
            className="
              fixed z-[201] left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-3xl shadow-2xl
              w-full max-w-xs p-6 animate-fadeInUp
              flex flex-col items-center justify-center
            "
          >
            <button onClick={() => setOpenMenu(null)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black">×</button>
            <AccessibilityPanel />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* 検索Drawer */}
      <Dialog.Root open={openMenu === "search"} onOpenChange={v => setOpenMenu(v ? "search" : null)}>
        <Dialog.Trigger asChild>
          <button className="flex flex-col items-center group" aria-label="検索">
            <FaSearch size={26} className="mb-1 text-[#192349] group-hover:scale-110 transition" />
            <span className="text-xs">検索</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-fadeIn" />
          <Dialog.Content
            className="
              fixed z-[201] left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-3xl shadow-2xl
              w-full max-w-xl p-6 animate-fadeInUp
              flex flex-col items-center justify-center
            "
          >
            <button onClick={() => setOpenMenu(null)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black">×</button>
            {/* open/onCloseをPropsで制御 */}
            <SearchModal open={true} onClose={() => setOpenMenu(null)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* サイドメニューDrawer */}
      <Dialog.Root open={openMenu === "menu"} onOpenChange={v => setOpenMenu(v ? "menu" : null)}>
        <Dialog.Trigger asChild>
          <button className="flex flex-col items-center group" aria-label="メニュー">
            <FaBars size={26} className="mb-1 text-[#192349] group-hover:scale-110 transition" />
            <span className="text-xs">メニュー</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-fadeIn" />
          <Dialog.Content
            className="
              fixed z-[201] left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              bg-white rounded-3xl shadow-2xl
              w-full max-w-xs p-0 animate-fadeInUp
              flex flex-col items-center justify-center
            "
          >
            <button onClick={() => setOpenMenu(null)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black">×</button>
            <SideMenu />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
