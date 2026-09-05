/** 每日反馈相关类型定义 */

export type TaskCompletion = 'all' | 'partial' | 'none'
export type TomorrowPreference = 'easier' | 'same' | 'challenge'
export type SelfHarmUrge = 'none' | 'mild' | 'strong'

export interface DailyFeedback {
  dayNumber: number
  moodScore: number
  energyScore: number
  taskCompletion: TaskCompletion
  hardestPart: string
  tomorrowPreference: TomorrowPreference
  affirmation: string
  selfHarmUrge: SelfHarmUrge
  createdAt: string
}
