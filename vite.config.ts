import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  base: "/StudyAnalyzer/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/recharts|d3-|victory-vendor/.test(id)) return "charts";
            if (/framer-motion|motion-dom|motion-utils/.test(id))
              return "motion";
            if (/dexie|zod|i18next/.test(id)) return "data";
            return "vendor";
          }
        },
      },
    },
  },
});
