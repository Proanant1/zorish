import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// NOTE:
// Replit-specific plugins removed for production stability
// You can re-add them later if needed

export default defineConfig({
  plugins: [
    react(),

    // Optional dev-only plugins (safe block, no breaking)
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          // Uncomment ONLY if installed
          // await import("@replit/vite-plugin-cartographer").then((m) =>
          //   m.cartographer(),
          // ),
          // await import("@replit/vite-plugin-dev-banner").then((m) =>
          //   m.devBanner(),
          // ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // Optional aliases (only if folders exist)
      // "@shared": path.resolve(__dirname, "./shared"),
      // "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,

    rollupOptions: {
      // You can extend this later if needed
    },
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    port: 5173,
  },
});