import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss()],
  server: {
    // 固定端口：端口被占用时直接报错而不是顺延到 5174/5175。
    // 浏览器按"源"（含端口）隔离存储，端口漂移会让草稿看起来分散在多处。
    port: 5173,
    strictPort: true,
  },
});
