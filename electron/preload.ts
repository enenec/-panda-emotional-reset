import { contextBridge, ipcRenderer } from 'electron'

// 通过 contextBridge 暴露最小化的只读信息，保持 contextIsolation 安全
contextBridge.exposeInMainWorld('pandaApp', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
})
