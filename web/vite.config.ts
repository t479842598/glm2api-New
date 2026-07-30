import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// 构建产物输出到 src/glm2api/admin_web，由 Python 服务器作为静态资源提供。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/admin/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // 开发时把 /admin 前缀的请求代理到本地 Python 服务（默认 8000）。
    proxy: {
      "/admin/api": "http://127.0.0.1:8000",
      "/v1": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../src/glm2api/admin_web"),
    emptyOutDir: true,
  },
})
