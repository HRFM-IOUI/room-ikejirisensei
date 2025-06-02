import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="
        fixed right-10 bottom-10 z-50
        rounded-full shadow-lg bg-gradient-to-tr from-sky-500 to-indigo-700
        w-20 h-20 flex flex-col items-center justify-center
        hover:scale-110 active:scale-95 transition-all
        border-4 border-white group
      "
      onClick={onClick}
      aria-label="検索"
    >
      <FaSearch size={36} className="mb-1 animate-pulse group-hover:animate-none" />
      <span className="text-xs font-semibold tracking-wide">検索</span>
    </button>
  );
}
