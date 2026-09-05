import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// 兼容性处理：某些开发环境全局设置了 ELECTRON_RUN_AS_NODE=1，
// 会导致 Electron 以纯 Node 模式启动（ipcMain 等 API 全部不可用）。
// 在 Vite 进程内删除该变量后，子进程 Electron 就不会继承它。
delete process.env.ELECTRON_RUN_AS_NODE

// base: './' 保证打包后 Electron 通过 file:// 加载时资源路径正确
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
