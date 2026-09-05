import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SliderInput } from '../components/SliderInput'
import { Button } from '../components/Button'
import { CrisisNotice } from '../components/CrisisNotice'
import { PandaMascot } from '../components/PandaMascot'
import { DIFFICULTY_OPTIONS } from '../types/user'
import type {
  AssessmentAnswers,
  ExerciseHabit,
  MovementPreference,
  ReadingPreference,
  RiskLevel,
  SelfHarmAnswer,
  SocialPreference,
  TimeCommitment,
} from '../types/user'
import {
  getRiskLevelFromAssessment,
  shouldShowCrisisMessage,
} from '../services/safetyService'
import {
  createInitialProgress,
  getProgress,
  saveProgress,
  saveUserProfile,
} from '../services/storageService'

/** 表单状态：安全问题的初始值为空，强制用户做出选择 */
interface AssessmentFormState {
  moodScore: number
  energyScore: number
  sleepQuality: number
  appetite: number
  socialSupport: number
  exerciseHabit: ExerciseHabit
  dailyTime: TimeCommitment
  readingPreference: ReadingPreference
  movementPreference: MovementPreference
  socialPreference: SocialPreference
  difficulties: string[]
  selfHarm: SelfHarmAnswer | ''
}

const EXERCISE_OPTIONS: { value: ExerciseHabit; label: string }[] = [
  { value: 'none', label: '没有' },
  { value: 'occasional', label: '偶尔' },
  { value: 'regular', label: '有规律' },
]

const TIME_OPTIONS: { value: TimeCommitment; label: string }[] = [
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 20, label: '20 分钟' },
  { value: 30, label: '30 分钟以上' },
]

const READING_OPTIONS: { value: ReadingPreference; label: string }[] = [
  { value: 'likes', label: '喜欢' },
  { value: 'unsure', label: '不确定' },
  { value: 'dislikes', label: '不喜欢' },
]

const MOVEMENT_OPTIONS: { value: MovementPreference; label: string }[] = [
  { value: 'veryLight', label: '非常轻' },
  { value: 'light', label: '普通' },
  { value: 'moderate', label: '稍有挑战' },
]

const SOCIAL_OPTIONS: { value: SocialPreference; label: string }[] = [
  { value: 'minimal', label: '先少一点' },
  { value: 'moderate', label: '可以适中' },
  { value: 'more', label: '愿意多一点' },
]

const SELF_HARM_OPTIONS: { value: SelfHarmAnswer; label: string }[] = [
  { value: 'none', label: '没有' },
  { value: 'passiveThoughts', label: '偶尔有，但没有计划' },
  { value: 'plans', label: '有明确想法或计划' },
  { value: 'strongUrge', label: '我现在有强烈冲动' },
]

/** 通用单选胶囊组 */
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

const INITIAL_STATE: AssessmentFormState = {
  moodScore: 5,
  energyScore: 5,
  sleepQuality: 5,
  appetite: 5,
  socialSupport: 5,
  exerciseHabit: 'none',
  dailyTime: 10,
  readingPreference: 'unsure',
  movementPreference: 'veryLight',
  socialPreference: 'moderate',
  difficulties: [],
  selfHarm: '',
}

export function AssessmentPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<AssessmentFormState>(INITIAL_STATE)
  const [error, setError] = useState('')

  function update<K extends keyof AssessmentFormState>(key: K, value: AssessmentFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDifficulty(value: string) {
    setForm((prev) => ({
      ...prev,
      difficulties: prev.difficulties.includes(value)
        ? prev.difficulties.filter((d) => d !== value)
        : [...prev.difficulties, value],
    }))
  }

  // 安全问题实时风险等级（用于立即显示危机提示）
  const currentRisk: RiskLevel =
    form.selfHarm === ''
      ? 'none'
      : getRiskLevelFromAssessment({ ...form, selfHarm: form.selfHarm })

  function handleSubmit() {
    if (form.selfHarm === '') {
      setError('请先回答最后一个关于安全的问题，我们才能开始。')
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      return
    }

    const answers: AssessmentAnswers = { ...form, selfHarm: form.selfHarm }
    const riskLevel = getRiskLevelFromAssessment(answers)
    saveUserProfile({ assessedAt: new Date().toISOString(), answers, riskLevel })

    // 还没有进度时创建一份全新的 21 天计划进度
    if (!getProgress()) {
      saveProgress(createInitialProgress())
    }

    navigate('/today')
  }

  return (
    <div className="assessment-page">
      <div className="deco-blob deco-blob--bamboo" />
      <div className="deco-blob deco-blob--sky" />

      <div className="assessment-hero">
        <div className="assessment-hero__mascot">
          <PandaMascot size="small" />
        </div>
        <h1 className="assessment-title">先了解一下现在的你</h1>
        <p className="assessment-sub">
          没有标准答案，如实就好。这能帮熊猫为你安排刚刚好的小任务。
        </p>
      </div>

      {/* 1. 最近的感觉 */}
      <section className="assessment-section">
        <span className="assessment-section__index">第 1 部分 · 最近的感觉</span>
        <SliderInput
          label="最近一周整体心情（1-10）"
          value={form.moodScore}
          min={1}
          max={10}
          onChange={(v) => update('moodScore', v)}
          leftLabel="很低落"
          rightLabel="很好"
          hintForValue={(v) => (v <= 3 ? '辛苦你了，如实填写就好' : v <= 6 ? '没关系，慢慢来' : '听起来不错')}
        />
        <SliderInput
          label="最近一周精力水平（1-10）"
          value={form.energyScore}
          min={1}
          max={10}
          onChange={(v) => update('energyScore', v)}
          leftLabel="很疲惫"
          rightLabel="很有精力"
          hintForValue={(v) => (v <= 3 ? '累也没关系，我们慢慢来' : v <= 6 ? '正常起伏，别苛责自己' : '有劲的时候好好利用')}
        />
        <SliderInput
          label="睡眠质量（1-10）"
          value={form.sleepQuality}
          min={1}
          max={10}
          onChange={(v) => update('sleepQuality', v)}
          leftLabel="很差"
          rightLabel="很好"
          hintForValue={(v) => (v <= 3 ? '睡不好会影响一切，先照顾它' : v <= 6 ? '一点点调整就很好' : '这是很好的基础')}
        />
        <SliderInput
          label="食欲状态（1-10）"
          value={form.appetite}
          min={1}
          max={10}
          onChange={(v) => update('appetite', v)}
          leftLabel="吃不下"
          rightLabel="胃口很好"
          hintForValue={(v) => (v <= 3 ? '先吃一点点，也算照顾自己' : v <= 6 ? '吃一点是一点' : '好好吃饭很重要')}
        />
        <SliderInput
          label="社交支持感（1-10）"
          value={form.socialSupport}
          min={1}
          max={10}
          onChange={(v) => update('socialSupport', v)}
          leftLabel="很孤单"
          rightLabel="很有支持"
          hintForValue={(v) => (v <= 3 ? '一个人撑着很累，慢慢来' : v <= 6 ? '有人惦记着，就很好' : '有支持的感觉真棒')}
        />
      </section>

      {/* 2. 习惯与偏好 */}
      <section className="assessment-section">
        <span className="assessment-section__index">第 2 部分 · 习惯与偏好</span>
        <p className="field-label">你平时有运动习惯吗？</p>
        <OptionGroup options={EXERCISE_OPTIONS} value={form.exerciseHabit} onChange={(v) => update('exerciseHabit', v)} />

        <p className="field-label">每天可以留给计划的时间</p>
        <OptionGroup options={TIME_OPTIONS} value={form.dailyTime} onChange={(v) => update('dailyTime', v)} />

        <p className="field-label">阅读偏好</p>
        <OptionGroup options={READING_OPTIONS} value={form.readingPreference} onChange={(v) => update('readingPreference', v)} />

        <p className="field-label">运动强度偏好</p>
        <OptionGroup options={MOVEMENT_OPTIONS} value={form.movementPreference} onChange={(v) => update('movementPreference', v)} />

        <p className="field-label">人际任务偏好</p>
        <OptionGroup options={SOCIAL_OPTIONS} value={form.socialPreference} onChange={(v) => update('socialPreference', v)} />
      </section>

      {/* 3. 当前主要困难 */}
      <section className="assessment-section">
        <span className="assessment-section__index">第 3 部分 · 当前主要困难（可多选）</span>
        <div className="chip-group">
          {DIFFICULTY_OPTIONS.map((option) => {
            const active = form.difficulties.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                className={`chip ${active ? 'chip--active' : ''}`.trim()}
                onClick={() => toggleDifficulty(option.value)}
                aria-pressed={active}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="form-hint">也可以都不选。这里没有标准答案。</p>
      </section>

      {/* 4. 安全问题 */}
      <section className="assessment-section">
        <span className="assessment-section__index">第 4 部分 · 安全</span>
        <p className="field-label">你最近是否有伤害自己或结束生命的想法？</p>
        <OptionGroup options={SELF_HARM_OPTIONS} value={form.selfHarm} danger onChange={(v) => update('selfHarm', v)} />
        <p className="form-hint">
          这个问题是为了在你需要时第一时间给你支持。请放心，答案只保存在本机。
        </p>
        {shouldShowCrisisMessage(currentRisk) && (
          <CrisisNotice level={form.selfHarm === 'strongUrge' ? 'immediate' : 'high'} />
        )}
      </section>

      <div className="assessment-actions">
        <Button size="large" onClick={handleSubmit}>
          完成评估，开始今天
        </Button>
      </div>
      {error && (
        <p className="assessment-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
