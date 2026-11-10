import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  server: { port: 8080, strictPort: true },

  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/plotly.js-dist-min/")) {
            return "plotly";
          }
        },
      },
    },
  },
});
