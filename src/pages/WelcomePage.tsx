import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { PandaMascot } from '../components/PandaMascot'
import { Button } from '../components/Button'
import { getProgress, getUserProfile } from '../services/storageService'
import { APP_NAME, CRISIS_HELP_TEXT, DISCLAIMER_TEXT } from '../config'

export function WelcomePage() {
  const navigate = useNavigate()
  const profile = getUserProfile()
  const progress = getProgress()

  // 已评估 → 直接进入今日计划；未评估 → 先做初始评估
  const startTarget = profile ? '/today' : '/assessment'
  const inProgress = progress !== null && !progress.completed

  return (
    <AppLayout>
      <div className="deco-blob deco-blob--bamboo" />
      <div className="deco-blob deco-blob--yellow" />
      <div className="page-content">
        <div className="welcome-hero">
          <div className="welcome-hero__mascot">
            <PandaMascot size="large" />
          </div>
          <h1 className="welcome-title">欢迎来到{APP_NAME}</h1>
          <p className="welcome-intro">
            你不需要一下子变好。今天，我们只从一个很小、很温柔的行动开始。
          </p>
          {inProgress && (
            <p className="welcome-progress-hint">
              你的计划正在进行中：第 {progress.currentDay} 天 / 21 天
            </p>
          )}
        </div>

        <div className="welcome-notices">
          <div className="notice-card notice-card--cream">
            <span className="notice-card__icon" aria-hidden="true">
              🐾
            </span>
            <div>
              <p className="notice-card__title">重要说明</p>
              <p>{DISCLAIMER_TEXT}</p>
            </div>
          </div>

          <div className="notice-card notice-card--warm">
            <span className="notice-card__icon" aria-hidden="true">
              🤍
            </span>
            <div>
              <p className="notice-card__title">如果你正在经历强烈痛苦</p>
              <p>{CRISIS_HELP_TEXT}</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <Button size="large" onClick={() => navigate(startTarget)}>
            {profile ? '继续我的 21 天计划' : '开始我的 21 天计划'}
          </Button>
          <Button size="large" variant="outline" onClick={() => navigate('/library')}>
            查看内容库
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
