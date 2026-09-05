/** 每日计划相关类型定义 */

/** 任务类别 */
export type PlanCategory =
  | 'body'
  | 'movement'
  | 'mind'
  | 'reading'
  | 'social'
  | 'sleep'
  | 'reflection'
  | 'selfCompassion'

/** 任务难度 */
export type TaskDifficulty = 'gentle' | 'moderate' | 'challenging'

/** 计划阶段 */
export type PlanStage = 'stabilize' | 'activate' | 'rebuild'

/** 任务状态（用户对任务的回应） */
export type TaskState = 'pending' | 'done' | 'skipped' | 'tooHard'

export const CATEGORY_LABELS: Record<PlanCategory, string> = {
  body: '身体照顾',
  movement: '轻运动',
  mind: '行为激活',
  reading: '阅读',
  social: '人际连接',
  sleep: '睡眠',
  reflection: '情绪记录',
  selfCompassion: '自我同情',
}

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  gentle: '温柔',
  moderate: '适中',
  challenging: '小挑战',
}

export const STAGE_INFO: Record<PlanStage, { label: string; range: string; goal: string }> = {
  stabilize: { label: '稳定期', range: '第 1-7 天', goal: '恢复基础节律，降低压力' },
  activate: { label: '激活期', range: '第 8-14 天', goal: '增加可控感与正向活动' },
  rebuild: { label: '重建期', range: '第 15-21 天', goal: '形成可以持续的生活系统' },
}

/** 根据天数计算所处阶段 */
export function getStageForDay(day: number): PlanStage {
  if (day <= 7) return 'stabilize'
  if (day <= 14) return 'activate'
  return 'rebuild'
}

export interface PlanTask {
  id: string
  title: string
  description: string
  category: PlanCategory
  estimatedMinutes: number
  difficulty: TaskDifficulty
}

export interface DailyPlan {
  dayNumber: number
  stage: PlanStage
  theme: string
  tasks: PlanTask[]
  encouragement: string
  /** 高风险用户的安全提示（riskLevel 为 high / immediate 时返回） */
  safetyNote?: string
  generatedAt: string
}

/** 21 天计划进度 */
export interface PlanProgress {
  totalDays: number
  currentDay: number
  completedDays: number
  streak: number
  moodScores: { day: number; score: number }[]
  energyScores: { day: number; score: number }[]
  affirmations: { day: number; text: string }[]
  startedAt: string
  completed: boolean
}
