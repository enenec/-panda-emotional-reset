/** 激活码相关类型定义 */

/** 激活模式：local = 本地模拟验证；server = 服务器验证（预留） */
export type LicenseMode = 'local' | 'server'

export interface ActivationInfo {
  code: string
  activatedAt: string
  mode: LicenseMode
}

export interface LicenseStatus {
  activated: boolean
  code?: string
  activatedAt?: string
  mode?: LicenseMode
}

export interface LicenseResult {
  success: boolean
  message: string
  status: LicenseStatus
}
