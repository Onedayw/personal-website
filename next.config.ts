import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    // /gdb is hosted by the separate gdb app (repo Onedayw/gdb, App
    // Service gdb-site), proxied here so it lives at natewang.dev/gdb.
    // The gdb app sets basePath "/gdb", so its routes are /gdb, /gdb/games/...
    return [
      {
        source: "/gdb",
        destination:
          "https://gdb-site-dsarexfcbye9cges.canadacentral-01.azurewebsites.net/gdb",
      },
      {
        source: "/gdb/:path*",
        destination:
          "https://gdb-site-dsarexfcbye9cges.canadacentral-01.azurewebsites.net/gdb/:path*",
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
