import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BUILD_BASE || "/",
  build: {
    outDir: process.env.BUILD_OUT || "dist",
  },
  plugins: [react()],

  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
});
