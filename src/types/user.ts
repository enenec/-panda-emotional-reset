/** 用户相关类型定义 */

/** 风险评估等级 */
export type RiskLevel = 'none' | 'low' | 'high' | 'immediate'

/** 运动习惯 */
export type ExerciseHabit = 'none' | 'occasional' | 'regular'
/** 每天可投入时间（分钟） */
export type TimeCommitment = 5 | 10 | 20 | 30
/** 阅读偏好 */
export type ReadingPreference = 'likes' | 'unsure' | 'dislikes'
/** 运动偏好 */
export type MovementPreference = 'veryLight' | 'light' | 'moderate'
/** 人际任务偏好 */
export type SocialPreference = 'minimal' | 'moderate' | 'more'
/** 安全相关回答 */
export type SelfHarmAnswer = 'none' | 'passiveThoughts' | 'plans' | 'strongUrge'

/** 初始评估答案 */
export interface AssessmentAnswers {
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
  selfHarm: SelfHarmAnswer
}

/** 用户档案（评估完成后生成） */
export interface UserProfile {
  assessedAt: string
  answers: AssessmentAnswers
  riskLevel: RiskLevel
}

/** 当前主要困难选项 */
export const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: 'wakingUp', label: '起床困难' },
  { value: 'sleepDisorder', label: '睡眠紊乱' },
  { value: 'appetiteChange', label: '食欲变化' },
  { value: 'lackMotivation', label: '缺乏动力' },
  { value: 'selfBlame', label: '自责内耗' },
  { value: 'loneliness', label: '孤独' },
  { value: 'anxiety', label: '焦虑' },
  { value: 'attentionDifficulty', label: '注意力困难' },
  { value: 'irregularRhythm', label: '生活节律混乱' },
]
