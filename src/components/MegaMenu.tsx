// src/components/MegaMenu.tsx
"use client";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

export default function MegaMenu() {
  return (
    <NavigationMenu.Root className="relative z-10 flex justify-center bg-[#192349] py-4">
      <NavigationMenu.List className="flex gap-8">
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="text-white hover:text-yellow-300 font-bold px-4 py-2 transition"
            href="#"
          >
            プロフィール
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="text-white hover:text-yellow-300 font-bold px-4 py-2 transition"
            href="#"
          >
            イベント・トピック
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="text-white hover:text-yellow-300 font-bold px-4 py-2 transition"
            href="#"
          >
            ご支援のお願い
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link
            className="text-white hover:text-yellow-300 font-bold px-4 py-2 transition"
            href="#"
          >
            お問い合わせ
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
