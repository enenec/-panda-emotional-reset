import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { PandaMascot } from '../components/PandaMascot'
import { Button } from '../components/Button'
import { TaskItem } from '../components/TaskItem'
import { CrisisNotice } from '../components/CrisisNotice'
import { CompletionCelebration } from '../components/CompletionCelebration'
import { STAGE_INFO } from '../types/plan'
import type { TaskState } from '../types/plan'
import { generateDailyPlan } from '../services/planEngine'
import {
  createInitialProgress,
  getDailyFeedbacks,
  getProgress,
  getTaskStates,
  getUserProfile,
  saveProgress,
  saveTaskState,
} from '../services/storageService'
import { DISCLAIMER_TEXT } from '../config'

export function TodayPlanPage() {
  const navigate = useNavigate()
  // 本地任务状态版本号：任务状态变化时触发重新渲染
  const [, setVersion] = useState(0)

  const profile = getUserProfile()
  if (!profile) return <Navigate to="/assessment" replace />

  // 重置计划后再次进入时，自动创建新的进度
  // progress 声明为 const，保证闭包中类型为 PlanProgress
  const existingProgress = getProgress()
  const progress = existingProgress ?? createInitialProgress()
  if (!existingProgress) {
    saveProgress(progress)
  }

  // 21 天已全部完成 → 展示完成庆祝与维护建议
  if (progress.completed) {
    return (
      <AppLayout>
        <CompletionCelebration />
        <div className="today-actions">
          <Button onClick={() => navigate('/progress')}>查看我的 21 天记录</Button>
          <Button variant="outline" onClick={() => navigate('/library')}>
            查看内容库
          </Button>
          <Button variant="ghost" onClick={() => navigate('/settings')}>
            去设置页
          </Button>
        </div>
      </AppLayout>
    )
  }

  const feedbacks = getDailyFeedbacks()
  const previousFeedback = feedbacks.length > 0 ? feedbacks[feedbacks.length - 1] : undefined
  const plan = generateDailyPlan({
    userProfile: profile,
    dayNumber: progress.currentDay,
    previousFeedback,
  })
  const stageInfo = STAGE_INFO[plan.stage]
  const taskStates = getTaskStates()[progress.currentDay] ?? {}

  function handleTaskState(taskId: string, state: TaskState) {
    saveTaskState(progress.currentDay, taskId, state)
    setVersion((v) => v + 1)
  }

  return (
    <AppLayout>
      <div className="today-hero">
        <div className="today-hero__mascot">
          <PandaMascot size="medium" />
        </div>
        <div className="today-badges">
          <span className="day-badge">
            🌱 第 {plan.dayNumber} 天 / {progress.totalDays} 天
          </span>
          <span className="stage-chip">
            {stageInfo.label} · {stageInfo.range}
          </span>
        </div>
        <p className="stage-goal">{stageInfo.goal}</p>
        <h1 className="today-theme">{plan.theme}</h1>
        <p className="encouragement">{plan.encouragement}</p>
      </div>

      {plan.safetyNote && (
        <CrisisNotice level={profile.riskLevel === 'immediate' ? 'immediate' : 'high'} message={plan.safetyNote} />
      )}

      {plan.tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          state={taskStates[task.id] ?? 'pending'}
          onStateChange={(state) => handleTaskState(task.id, state)}
        />
      ))}

      <div className="today-actions">
        <Button size="large" onClick={() => navigate('/feedback')}>
          去填写今日反馈
        </Button>
        <Button variant="outline" onClick={() => navigate('/progress')}>
          查看进度
        </Button>
        <Button variant="outline" onClick={() => navigate('/library')}>
          内容库
        </Button>
      </div>

      <p className="today-disclaimer">{DISCLAIMER_TEXT}</p>
    </AppLayout>
  )
}
