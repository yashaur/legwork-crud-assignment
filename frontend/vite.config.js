import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Inside the compose network the backend's hostname is "backend", not
// localhost — compose sets API_TARGET; host-run keeps the fallback.
const target = process.env.API_TARGET ?? "http://localhost:8000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
      },
      "/auth": {
        target,
        changeOrigin: true,
      },
    },
  },
});
