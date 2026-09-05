/// <reference types="vite/client" />

interface Window {
  /** Electron preload 暴露的只读信息（浏览器环境中不存在） */
  pandaApp?: {
    platform: string
    versions: {
      electron: string
      chrome: string
      node: string
    }
    getAppVersion: () => Promise<string>
  }
}
