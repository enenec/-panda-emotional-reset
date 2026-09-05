import { clearActivation, getActivation, saveActivation } from './storageService'
import type { ActivationInfo, LicenseResult, LicenseStatus } from '../types/license'

/**
 * 激活码服务
 *
 * 当前版本使用「本地模拟验证」：只校验识别码是否在本地白名单中。
 * 正式售卖前，应将 LocalLicenseProvider 替换为 RemoteLicenseProvider（服务器验证）。
 * 结构已预留好：页面层只依赖 activateLicense / checkActivationStatus / deactivateForDev，
 * 替换 provider 时页面代码无需改动。
 */

/** 本地模拟激活码白名单（仅用于开发与演示） */
const LOCAL_VALID_CODES: string[] = [
  'PANDA-RESET-2025',
  'PANDA-21DAY-DEMO',
  'TEST-PANDA-0001',
]

/** 未来服务器验证的接口地址预留（当前未启用） */
// const LICENSE_SERVER_BASE_URL = 'https://license.example.com/api/v1'

/** 验证提供者接口：本地模拟与服务器验证共用同一套接口 */
export interface LicenseProvider {
  activate(code: string): Promise<LicenseResult>
  checkStatus(): Promise<LicenseStatus>
  deactivate(): Promise<void>
}

/** 归一化识别码：去空格、转大写 */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '-')
}

// ===================== 本地模拟验证（当前使用） =====================

const localProvider: LicenseProvider = {
  async activate(code) {
    const normalized = normalizeCode(code)
    if (!normalized) {
      return {
        success: false,
        message: '请输入你的专属识别码。',
        status: await localProvider.checkStatus(),
      }
    }
    if (LOCAL_VALID_CODES.includes(normalized)) {
      const info: ActivationInfo = {
        code: normalized,
        activatedAt: new Date().toISOString(),
        mode: 'local',
      }
      saveActivation(info)
      return {
        success: true,
        message: '激活成功，欢迎回来。',
        status: { activated: true, ...info },
      }
    }
    return {
      success: false,
      message: '这个识别码看起来不太对，请检查后重试，或联系获取渠道。',
      status: await localProvider.checkStatus(),
    }
  },

  async checkStatus() {
    const info = getActivation()
    if (info) {
      return { activated: true, code: info.code, activatedAt: info.activatedAt, mode: info.mode }
    }
    return { activated: false }
  },

  async deactivate() {
    clearActivation()
  },
}

// ===================== 服务器验证（预留，正式售卖前启用） =====================
//
// 启用步骤：
// 1. 部署激活码校验服务器（校验签名、绑定设备、防重放等）；
// 2. 实现 remoteProvider 并替换下方 provider 指向；
// 3. 服务器不可用时返回明确的错误信息，不允许离线绕过验证。
//
// const remoteProvider: LicenseProvider = {
//   async activate(code) {
//     try {
//       const res = await fetch(`${LICENSE_SERVER_BASE_URL}/licenses/activate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ code: normalizeCode(code), deviceId: 'xxx' }),
//       })
//       const data: { ok: boolean; message: string; license?: ActivationInfo } = await res.json()
//       if (data.ok && data.license) {
//         saveActivation({ ...data.license, mode: 'server' })
//         return { success: true, message: '激活成功，欢迎回来。', status: { activated: true, ...data.license, mode: 'server' } }
//       }
//       return { success: false, message: data.message || '激活失败，请稍后重试。', status: await remoteProvider.checkStatus() }
//     } catch {
//       return { success: false, message: '无法连接激活服务器，请检查网络后重试。', status: await remoteProvider.checkStatus() }
//     }
//   },
//   async checkStatus() {
//     const info = getActivation()
//     if (!info) return { activated: false }
//     // 建议定期向服务器复核激活有效性（例如每 7 天一次）
//     return { activated: true, code: info.code, activatedAt: info.activatedAt, mode: info.mode }
//   },
//   async deactivate() {
//     clearActivation()
//   },
// }

/** 切换验证方式的唯一入口：正式售卖前把 provider 换成 remoteProvider 即可 */
let provider: LicenseProvider = localProvider

// ===================== 对外接口 =====================

export function activateLicense(code: string): Promise<LicenseResult> {
  return provider.activate(code)
}

export function checkActivationStatus(): Promise<LicenseStatus> {
  return provider.checkStatus()
}

/** 解除激活（仅用于开发调试；设置页可触发） */
export function deactivateForDev(): Promise<void> {
  return provider.deactivate()
}
