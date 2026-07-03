import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Uploads temporários são guardados no PostgreSQL. Não aumente sem necessidade.
      bodySizeLimit: "5mb",
    },
  },
};




export default nextConfig;
