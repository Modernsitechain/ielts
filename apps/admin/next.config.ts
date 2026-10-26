import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served under /admin, locally (http://localhost:3001/admin) and when
  // deployed next to apps/web on the same domain.
  basePath: "/admin",
  // Self-contained server for the Docker image; the repo root is traced so the
  // workspace packages (@ielts-mock/*) are included.
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  async redirects() {
    return [{ source: "/", destination: "/admin", basePath: false, permanent: false }];
  },
};

export default nextConfig;
