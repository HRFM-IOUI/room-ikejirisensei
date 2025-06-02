import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="
        bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl flex flex-col gap-4
        border border-gray-200 relative animate-fadeInUp
      ">
        <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-black" onClick={onClose} aria-label="閉じる">
          <FaTimes />
        </button>
        <div className="flex items-center gap-3">
          <FaSearch size={28} className="text-[#192349]" />
          <input
            type="text"
            className="flex-1 border-none focus:ring-0 outline-none bg-transparent text-xl"
            placeholder="サイト内検索..."
            autoFocus
          />
        </div>
        {/* おすすめキーワード/履歴 */}
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="bg-gray-200 px-2 py-1 rounded-full">政策</span>
          <span className="bg-gray-200 px-2 py-1 rounded-full">議会</span>
          <span className="bg-gray-200 px-2 py-1 rounded-full">練馬</span>
        </div>
        {/* 検索ロジックは自由実装 */}
      </div>
    </div>
  );
}
