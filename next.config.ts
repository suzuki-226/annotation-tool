import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 本番ビルド時に ESLint を原因に失敗させない
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
