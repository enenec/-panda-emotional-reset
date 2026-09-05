import type { UserProfile } from '../types/user'
import type { DailyFeedback } from '../types/feedback'
import type { PlanProgress, TaskState } from '../types/plan'
import type { ActivationInfo } from '../types/license'

/**
 * 本地数据存储服务（MVP 使用 localStorage）
 * 所有数据仅保存在本机，不会自动上传。
 * 未来如需云端同步，可在此层替换为 IndexedDB / 本地文件 / 服务器 API。
 */

const KEYS = {
  activation: 'panda.activation',
  profile: 'panda.userProfile',
  feedbacks: 'panda.dailyFeedbacks',
  progress: 'panda.progress',
  taskStates: 'panda.taskStates',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('[storageService] 写入失败：', key, error)
  }
}

function remove(key: string): void {
  localStorage.removeItem(key)
}

// —— 激活状态 ——

export function getActivation(): ActivationInfo | null {
  return read<ActivationInfo | null>(KEYS.activation, null)
}

export function saveActivation(info: ActivationInfo): void {
  write(KEYS.activation, info)
}

export function clearActivation(): void {
  remove(KEYS.activation)
}

// —— 用户档案 ——

export function getUserProfile(): UserProfile | null {
  return read<UserProfile | null>(KEYS.profile, null)
}

export function saveUserProfile(profile: UserProfile): void {
  write(KEYS.profile, profile)
}

// —— 每日反馈 ——

export function getDailyFeedbacks(): DailyFeedback[] {
  return read<DailyFeedback[]>(KEYS.feedbacks, [])
}

/** 追加一条反馈；同一天重复提交时覆盖旧记录 */
export function saveDailyFeedback(feedback: DailyFeedback): void {
  const list = getDailyFeedbacks()
  const index = list.findIndex((f) => f.dayNumber === feedback.dayNumber)
  if (index >= 0) list[index] = feedback
  else list.push(feedback)
  list.sort((a, b) => a.dayNumber - b.dayNumber)
  write(KEYS.feedbacks, list)
}

// —— 进度 ——

export function getProgress(): PlanProgress | null {
  return read<PlanProgress | null>(KEYS.progress, null)
}

export function saveProgress(progress: PlanProgress): void {
  write(KEYS.progress, progress)
}

/** 创建一份全新的 21 天计划进度 */
export function createInitialProgress(): PlanProgress {
  return {
    totalDays: 21,
    currentDay: 1,
    completedDays: 0,
    streak: 0,
    moodScores: [],
    energyScores: [],
    affirmations: [],
    startedAt: new Date().toISOString(),
    completed: false,
  }
}

// —— 任务状态（完成 / 跳过 / 太难了） ——

export function getTaskStates(): Record<number, Record<string, TaskState>> {
  return read<Record<number, Record<string, TaskState>>>(KEYS.taskStates, {})
}

export function saveTaskState(dayNumber: number, taskId: string, state: TaskState): void {
  const all = getTaskStates()
  const dayStates = all[dayNumber] ?? {}
  dayStates[taskId] = state
  all[dayNumber] = dayStates
  write(KEYS.taskStates, all)
}

// —— 整体操作 ——

/** 导出全部本地数据（用于备份，不会上传） */
export function exportAllData(): Record<string, unknown> {
  return {
    app: 'panda-emotional-reset',
    exportedAt: new Date().toISOString(),
    activation: getActivation(),
    userProfile: getUserProfile(),
    dailyFeedbacks: getDailyFeedbacks(),
    progress: getProgress(),
    taskStates: getTaskStates(),
  }
}

/** 清除所有本地数据（含激活状态，清除后需重新激活） */
export function clearAllData(): void {
  Object.values(KEYS).forEach(remove)
}

/** 只重置 21 天计划（保留激活状态与用户档案） */
export function resetPlanOnly(): void {
  remove(KEYS.feedbacks)
  remove(KEYS.progress)
  remove(KEYS.taskStates)
}
