import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // ← これを追加
  /* 他のconfigオプションはそのまま */
};

export default nextConfig;
