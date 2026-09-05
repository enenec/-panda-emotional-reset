import { Navigate, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { CompletionCelebration } from '../components/CompletionCelebration'
import { getProgress, getUserProfile } from '../services/storageService'

export function ProgressPage() {
  const navigate = useNavigate()
  const profile = getUserProfile()
  if (!profile) return <Navigate to="/assessment" replace />

  const progress = getProgress()

  // 还没有任何计划记录
  if (!progress) {
    return (
      <AppLayout>
        <div className="empty-state">
          <div className="empty-state__emoji">🐾</div>
          <p>计划还没有开始。去做今天的第一个小任务吧。</p>
          <div className="empty-state__actions">
            <Button onClick={() => navigate('/today')}>去今日计划</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const completionRate = Math.round((progress.completedDays / progress.totalDays) * 100)

  return (
    <AppLayout>
      <div className="progress-hero">
        <h1 className="progress-title">我的进度</h1>
        <p className="progress-sub">你走的每一步，这里都记得。</p>
      </div>

      {progress.completed && <CompletionCelebration />}

      <Card title="21 天计划总览">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__num">{progress.completedDays}</div>
            <div className="stat-card__label">已完成天数</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__num">
              {progress.completed ? '完成' : `第 ${progress.currentDay} 天`}
            </div>
            <div className="stat-card__label">当前进度</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__num">{progress.streak}</div>
            <div className="stat-card__label">连续完成天数</div>
          </div>
        </div>
        <ProgressBar
          label="完成率"
          hint={`${completionRate}%`}
          value={completionRate}
          max={100}
        />
      </Card>

      {progress.moodScores.length > 0 && (
        <Card title="最近情绪分数">
          {[...progress.moodScores].reverse().slice(0, 7).map((item) => (
            <div key={item.day} className="score-row">
              <span className="score-row__day">第 {item.day} 天</span>
              <ProgressBar value={item.score * 10} max={100} />
              <span className="score-row__day" style={{ width: 'auto' }}>
                {item.score} 分
              </span>
            </div>
          ))}
        </Card>
      )}

      {progress.energyScores.length > 0 && (
        <Card title="最近精力分数">
          {[...progress.energyScores].reverse().slice(0, 7).map((item) => (
            <div key={item.day} className="score-row">
              <span className="score-row__day">第 {item.day} 天</span>
              <ProgressBar value={item.score * 10} max={100} />
              <span className="score-row__day" style={{ width: 'auto' }}>
                {item.score} 分
              </span>
            </div>
          ))}
        </Card>
      )}

      {progress.affirmations.length > 0 && (
        <Card title="你写下的自我肯定">
          {[...progress.affirmations].reverse().map((item) => (
            <div key={item.day} className="affirmation-item">
              <div className="affirmation-item__day">第 {item.day} 天</div>
              {item.text}
            </div>
          ))}
        </Card>
      )}

      <p className="progress-encouragement">你不是没有进步，你是在用很小的步子往前走。</p>

      <div className="progress-actions">
        <Button size="large" onClick={() => navigate('/today')}>
          返回今日计划
        </Button>
        <Button variant="outline" size="large" onClick={() => navigate('/library')}>
          查看内容库
        </Button>
      </div>
    </AppLayout>
  )
}
