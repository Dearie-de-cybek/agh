import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// /api/* must reach aghcloud.ai: the platform sends no CORS headers, so the
// browser can only call it same-origin. Dev and `vite preview` both proxy it;
// any other static host needs an equivalent rewrite/proxy for /api/*.
// Override the target with VITE_API_ORIGIN (e.g. a staging environment).
const api = {
  "/api": {
    target: process.env.VITE_API_ORIGIN || "https://aghcloud.ai",
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: "localhost",
  },
};

// Dev-only helper: lets the running page write a rendered frame of the hero
// scene to public/brand (used to generate the poster image).
const savePoster = (): Plugin => ({
  name: "agh-save-poster",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use("/__save", (req, res) => {
      const name = new URL(req.url ?? "", "http://x").searchParams.get("name") ?? "";
      if (req.method !== "POST" || !/^[\w-]+\.(webp|png)$/.test(name)) {
        res.statusCode = 400;
        return res.end("bad request");
      }
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const file = resolve("public/brand", name);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, Buffer.concat(chunks));
        res.end("ok");
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), savePoster()],
  server: { port: 5173, proxy: api },
  preview: { port: 4173, proxy: api },
});
