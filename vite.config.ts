import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api/* is proxied to the live platform so the free-trial chat,
// model list and quota meter use the real backend. In production the page is
// served from aghcloud.ai itself, so the same relative paths just work.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://aghcloud.ai",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
});
