import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["slides.onlocalhost.xyz", "slides.andcake.dev"],
  },
});
