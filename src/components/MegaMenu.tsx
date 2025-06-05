// src/components/MegaMenu.tsx
"use client";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

export default function MegaMenu() {
  const [open, setOpen] = useState(false);

  // メニューアイテム
  const menuItems = [
    { label: "プロフィール", href: "#" },
    { label: "イベント・トピック", href: "#" },
    { label: "ご支援のお願い", href: "#" },
    { label: "お問い合わせ", href: "#" },
  ];

  return (
    <>
      {/* --- PC/タブレット（lg以上）用 --- */}
      <NavigationMenu.Root className="relative z-10 justify-center bg-[#192349] py-4 hidden lg:flex">
        <NavigationMenu.List className="flex gap-8">
          {menuItems.map(item => (
            <NavigationMenu.Item key={item.label}>
              <NavigationMenu.Link
                className="text-white hover:text-yellow-300 font-bold px-4 py-2 transition"
                href={item.href}
              >
                {item.label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      {/* --- スマホ用: ハンバーガー＋Drawer --- */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 bg-[#192349] relative z-20">
        <div className="font-extrabold text-lg text-white tracking-wide select-none">MENU</div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              className="p-3 rounded-lg bg-[#243062] text-white text-2xl"
              aria-label="メニューを開く"
            >
              ☰
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-fadeIn" />
            <Dialog.Content
              className="fixed z-[60] left-0 top-0 w-full h-full bg-white flex flex-col items-center pt-12 px-6 animate-fadeInUp"
              style={{
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                boxShadow: "0 12px 64px #19234922",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-7 text-3xl text-gray-400 hover:text-black"
                aria-label="閉じる"
              >
                ×
              </button>
              <nav className="w-full flex flex-col items-center gap-8 mt-6">
                {menuItems.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[#192349] font-bold text-xl py-3 w-full text-center rounded-xl hover:bg-[#f4f7fa] transition"
                  >
                    {item.label}
                  </a>
                ))}
                {/* グローバルボタンもここに配置 */}
                <div className="flex gap-4 w-full justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => { window.location.href = "/login"; }}
                    className="bg-white border-2 border-[#192349] text-[#192349] rounded-lg font-bold px-7 py-2 shadow hover:bg-[#eceefa] transition"
                  >
                    ログイン
                  </button>
                  <button
                    type="button"
                    onClick={() => { window.location.href = "/signup"; }}
                    className="bg-[#192349] border-2 border-[#192349] text-white rounded-lg font-bold px-7 py-2 shadow hover:bg-[#283b72] transition"
                  >
                    新規登録
                  </button>
                </div>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
