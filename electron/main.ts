import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'

// 开发模式下由 vite-plugin-electron 注入 VITE_DEV_SERVER_URL
const isDev = !!process.env.VITE_DEV_SERVER_URL

function createWindow(): void {
  const win = new BrowserWindow({
    title: '熊猫情绪重启计划',
    width: 1100,
    height: 760,
    minWidth: 960,
    minHeight: 660,
    show: false,
    backgroundColor: '#FFFDF7',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 页面加载完成后再显示，避免白屏闪烁
  win.once('ready-to-show', () => win.show())

  // 外部链接一律交给系统浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL as string)
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// 渲染进程读取应用版本号（设置页展示用）
ipcMain.handle('app:get-version', () => app.getVersion())

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
