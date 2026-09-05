import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { SliderInput } from '../components/SliderInput'
import { CrisisNotice } from '../components/CrisisNotice'
import type { DailyFeedback, SelfHarmUrge, TaskCompletion, TomorrowPreference } from '../types/feedback'
import {
  getDailyFeedbacks,
  getProgress,
  getUserProfile,
  saveDailyFeedback,
  saveProgress,
} from '../services/storageService'
import { detectRiskText } from '../services/safetyService'

function OptionGroup<T extends string | number>(props: {
  options: { value: T; label: string }[]
  value: T
  danger?: boolean
  onChange: (value: T) => void
}) {
  const { options, value, danger = false, onChange } = props
  return (
    <div className="option-group">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            className={[
              'option-pill',
              active ? 'option-pill--active' : '',
              danger ? 'option-pill--danger' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const COMPLETION_OPTIONS: { value: TaskCompletion; label: string }[] = [
  { value: 'all', label: '全部完成' },
  { value: 'partial', label: '完成一部分' },
  { value: 'none', label: '没完成' },
]

const TOMORROW_OPTIONS: { value: TomorrowPreference; label: string }[] = [
  { value: 'easier', label: '更轻松' },
  { value: 'same', label: '差不多' },
  { value: 'challenge', label: '稍微有挑战' },
]

const URGE_OPTIONS: { value: SelfHarmUrge; label: string }[] = [
  { value: 'none', label: '没有' },
  { value: 'mild', label: '有一点，但我目前安全' },
  { value: 'strong', label: '有明显冲动，我需要帮助' },
]

export function FeedbackPage() {
  const navigate = useNavigate()
  const [mood, setMood] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [completion, setCompletion] = useState<TaskCompletion>('partial')
  const [hardestPart, setHardestPart] = useState('')
  const [tomorrow, setTomorrow] = useState<TomorrowPreference>('same')
  const [affirmation, setAffirmation] = useState('')
  const [urge, setUrge] = useState<SelfHarmUrge>('none')

  const profile = getUserProfile()
  const progress = getProgress()
  if (!profile) return <Navigate to="/assessment" replace />
  if (!progress) return <Navigate to="/today" replace />
  if (progress.completed) return <Navigate to="/today" replace />

  const day = progress.currentDay
  // 提取为常量，供提交函数在闭包中安全使用
  const totalDays = progress.totalDays
  const completedDays = progress.completedDays
  const currentStreak = progress.streak
  const moodScores = progress.moodScores
  const energyScores = progress.energyScores
  const affirmations = progress.affirmations
  const startedAt = progress.startedAt
  const riskTextDetected = detectRiskText(hardestPart)

  function handleSubmit() {
    const feedback: DailyFeedback = {
      dayNumber: day,
      moodScore: mood,
      energyScore: energy,
      taskCompletion: completion,
      hardestPart: hardestPart.trim(),
      tomorrowPreference: tomorrow,
      affirmation: affirmation.trim(),
      selfHarmUrge: urge,
      createdAt: new Date().toISOString(),
    }
    saveDailyFeedback(feedback)

    // 更新进度：完成天数、连续天数、分数与肯定记录
    const existing = getDailyFeedbacks()
    const hadYesterday = existing.some((f) => f.dayNumber === day - 1)
    const finished = day >= totalDays

    saveProgress({
      totalDays,
      completedDays: completedDays + 1,
      streak: hadYesterday ? currentStreak + 1 : 1,
      moodScores: [...moodScores, { day, score: mood }],
      energyScores: [...energyScores, { day, score: energy }],
      affirmations: feedback.affirmation
        ? [...affirmations, { day, text: feedback.affirmation }]
        : affirmations,
      currentDay: finished ? totalDays : day + 1,
      completed: finished,
      startedAt,
    })

    navigate('/progress')
  }

  return (
    <AppLayout>
      <div className="feedback-hero">
        <h1 className="feedback-title">第 {day} 天 · 今日反馈</h1>
        <p className="feedback-sub">
          今天辛苦了。哪怕只完成了一件小事，也值得被记录。
        </p>
      </div>

      <section className="feedback-section">
        <SliderInput
          label="今天整体情绪（1-10）"
          value={mood}
          min={1}
          max={10}
          onChange={setMood}
          leftLabel="很低落"
          rightLabel="很好"
        />
        <SliderInput
          label="今天精力（1-10）"
          value={energy}
          min={1}
          max={10}
          onChange={setEnergy}
          leftLabel="很疲惫"
          rightLabel="很有精力"
        />
      </section>

      <section className="feedback-section">
        <p className="field-label">今天任务完成情况</p>
        <OptionGroup options={COMPLETION_OPTIONS} value={completion} onChange={setCompletion} />

        <p className="field-label">今天最困难的地方是什么？</p>
        <textarea
          className="textarea"
          value={hardestPart}
          onChange={(e) => setHardestPart(e.target.value)}
          placeholder="写不写都可以。有时候，只是把难处写下来，就会轻一点。"
        />
        {riskTextDetected && <CrisisNotice level="soft" />}

        <div className="divider" />

        <p className="field-label">明天希望任务</p>
        <OptionGroup options={TOMORROW_OPTIONS} value={tomorrow} onChange={setTomorrow} />

        <p className="field-label">今天想肯定自己的一件小事</p>
        <p className="form-hint" style={{ marginBottom: 8 }}>
          “哪怕很小，也值得被看见。”
        </p>
        <textarea
          className="textarea"
          value={affirmation}
          onChange={(e) => setAffirmation(e.target.value)}
          placeholder="比如：今天起床了。今天给自己倒了杯水。"
        />
      </section>

      <section className="feedback-section">
        <p className="field-label">今天是否出现过伤害自己的强烈想法？</p>
        <OptionGroup options={URGE_OPTIONS} value={urge} danger onChange={setUrge} />
        {urge === 'strong' && <CrisisNotice level="immediate" />}
        {urge === 'mild' && (
          <p className="form-hint">
            谢谢你如实告诉我。请优先照顾好自己：联系一位信任的人，或拨打心理援助热线
            12356。你目前是安全的，这很重要。
          </p>
        )}
      </section>

      <div className="feedback-actions">
        <Button size="large" onClick={handleSubmit}>
          提交今日反馈
        </Button>
      </div>
    </AppLayout>
  )
}
