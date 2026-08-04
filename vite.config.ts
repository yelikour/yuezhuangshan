import { defineConfig } from 'vite';
import { resolve } from 'path';

// 多页面入口：每个虚构网站都是一个真实的独立 HTML，保持"拟真独立网站"观感。
// 入口相对项目根目录的 *.html
const entries = {
  // P00 游戏入口（也是站点根 /）
  index: resolve(__dirname, 'index.html'),
  // P01 虚构邮箱
  mail: resolve(__dirname, 'src/pages/mail/index.html'),
  // P02 岳桩山景区官网
  scenic: resolve(__dirname, 'src/pages/scenic/index.html'),
  // P03 虚构聊天软件
  chat: resolve(__dirname, 'src/pages/chat/index.html'),
  // P04 地方资讯搜索
  news: resolve(__dirname, 'src/pages/news/index.html'),
  // P05+P06 会议后台（登录页 + 记录页）
  backend: resolve(__dirname, 'src/pages/backend/index.html'),
  // P07 切片结尾
  ending: resolve(__dirname, 'src/pages/ending/index.html'),
};

export default defineConfig({
  // base 必须是部署的绝对子路径，这样多级目录页面（src/pages/xxx/）
  // 引用打包资源（assets/xxx-hash.png）和页面间相对跳转时路径才正确。
  // dev 与 prod 统一用 '/yuezhuangshan/'，保证本地测试与线上一致：
  //   本地访问 http://localhost:5173/yuezhuangshan/
  //   线上访问 https://yelikour.github.io/yuezhuangshan/
  // 若将来换部署路径（如自定义域名根路径），把 BASE 改成 '/' 即可。
  base: '/yuezhuangshan/',
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@data': resolve(__dirname, 'src/data'),
      '@ui': resolve(__dirname, 'src/ui'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: entries,
      output: {
        // 保持入口 html 在各自目录，便于 URL 观感
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
} as any);
