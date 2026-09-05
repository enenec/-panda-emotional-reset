import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { NavBar } from './NavBar'
import { PandaMascot } from './PandaMascot'
import { getProgress } from '../services/storageService'
import { APP_NAME } from '../config'

/** 显示底部导航的页面 */
const NAV_PATHS = ['/today', '/progress', '/library', '/settings']

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const showNav = NAV_PATHS.includes(location.pathname)
  const progress = getProgress()
  const inProgress = progress !== null && !progress.completed

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <PandaMascot size="small" />
          <span className="app-header__name">{APP_NAME}</span>
        </div>
        {inProgress && (
          <div className="app-header__day">
            第 {progress.currentDay} 天 / {progress.totalDays} 天
          </div>
        )}
      </header>

      <main className="app-main">{children}</main>

      {showNav && <NavBar />}

      <footer className="app-footer">
        熊猫陪你慢慢来，今天只走一小步。 · 本软件不提供医学诊断，不替代专业治疗。
      </footer>
    </div>
  )
}
