import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ActivationPage } from './pages/ActivationPage'
import { WelcomePage } from './pages/WelcomePage'
import { AssessmentPage } from './pages/AssessmentPage'
import { TodayPlanPage } from './pages/TodayPlanPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { ProgressPage } from './pages/ProgressPage'
import { LibraryPage } from './pages/LibraryPage'
import { SettingsPage } from './pages/SettingsPage'
import { getActivation, getUserProfile } from './services/storageService'

/**
 * 启动逻辑：
 * 1. 未激活 → /activation
 * 2. 已激活但没有用户档案 → /welcome
 * 3. 已激活且已有用户档案 → /today
 */
function StartupRedirect() {
  if (!getActivation()) return <Navigate to="/activation" replace />
  if (!getUserProfile()) return <Navigate to="/welcome" replace />
  return <Navigate to="/today" replace />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<StartupRedirect />} />
        <Route path="/activation" element={<ActivationPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/today" element={<TodayPlanPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<StartupRedirect />} />
      </Routes>
    </HashRouter>
  )
}
