import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: node({
    mode: "middleware",
  }),

  vite: {
    optimizeDeps: {
      exclude: ["sqlocal"],
    },
    worker: {
      format: "es",
    },
    plugins: [
      tailwindcss() as any,
      {
        name: "configure-dev-vpfs-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        },
      },
    ],
  },
});
