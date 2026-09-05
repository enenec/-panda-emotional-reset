import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import {
  clearAllData,
  exportAllData,
  resetPlanOnly,
} from '../services/storageService'
import { checkActivationStatus, deactivateForDev } from '../services/licenseService'
import type { LicenseStatus } from '../types/license'
import { APP_NAME, APP_VERSION, DISCLAIMER_TEXT, FULL_SAFETY_TEXT, PRIVACY_TEXT } from '../config'

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('zh-CN')
}

/** 两步确认按钮：第一次点击进入确认态，避免误操作 */
function ConfirmButton(props: {
  label: string
  confirmText: string
  onConfirm: () => void
}) {
  const { label, confirmText, onConfirm } = props
  const [arming, setArming] = useState(false)

  if (!arming) {
    return (
      <Button variant="danger" size="small" onClick={() => setArming(true)}>
        {label}
      </Button>
    )
  }
  return (
    <div className="confirm-row">
      <span className="confirm-row__text">{confirmText}</span>
      <Button
        variant="danger"
        size="small"
        onClick={() => {
          setArming(false)
          onConfirm()
        }}
      >
        确定
      </Button>
      <Button variant="ghost" size="small" onClick={() => setArming(false)}>
        取消
      </Button>
    </div>
  )
}

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function SettingsPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<LicenseStatus | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [appVersion, setAppVersion] = useState(APP_VERSION)

  useEffect(() => {
    let cancelled = false
    void checkActivationStatus().then((s) => {
      if (!cancelled) setStatus(s)
    })
    if (window.pandaApp) {
      window.pandaApp
        .getAppVersion()
        .then((v) => {
          if (!cancelled) setAppVersion(v)
        })
        .catch(() => {
          /* 保持默认版本号 */
        })
    }
    return () => {
      cancelled = true
    }
  }, [])

  function handleExport() {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(exportAllData(), `panda-emotional-reset-data-${stamp}.json`)
  }

  async function handleDeactivate() {
    await deactivateForDev()
    navigate('/activation')
  }

  const versions = window.pandaApp?.versions

  return (
    <AppLayout>
      <h1 className="settings-title">设置</h1>
      <p className="page-subtitle">这里管理你的激活状态与本地数据。</p>

      {/* 激活状态 */}
      <section className="settings-section">
        <h2 className="settings-section__title">🔑 激活状态</h2>
        {status === null ? (
          <p className="muted">正在读取…</p>
        ) : status.activated ? (
          <>
            <div className="settings-row">
              <span className="settings-row__label">状态</span>
              <span className="badge-active">已激活</span>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">识别码</span>
              <span className="settings-row__value">{status.code}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">激活时间</span>
              <span className="settings-row__value">
                {status.activatedAt ? formatDate(status.activatedAt) : '-'}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">验证方式</span>
              <span className="settings-row__value">
                {status.mode === 'server' ? '服务器验证' : '本地模拟验证（演示版）'}
              </span>
            </div>
            <div className="divider" />
            <Button variant="ghost" size="small" onClick={() => void handleDeactivate()}>
              解除激活（仅开发调试用）
            </Button>
          </>
        ) : (
          <>
            <div className="settings-row">
              <span className="settings-row__label">状态</span>
              <span className="badge-inactive">未激活</span>
            </div>
            <Button size="small" onClick={() => navigate('/activation')}>
              去激活
            </Button>
          </>
        )}
      </section>

      {/* 免责声明 */}
      <section className="settings-section">
        <h2 className="settings-section__title">📋 免责声明与安全提示</h2>
        <p className="muted" style={{ marginBottom: 10 }}>
          {DISCLAIMER_TEXT}
        </p>
        {showDisclaimer ? (
          <div className="notice-card notice-card--warm">
            <span className="notice-card__icon" aria-hidden="true">
              🤍
            </span>
            <div>
              <p className="notice-card__title">如果你正在经历强烈痛苦</p>
              <p>{FULL_SAFETY_TEXT}</p>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="small" onClick={() => setShowDisclaimer(true)}>
            重新查看免责声明与安全提示
          </Button>
        )}
      </section>

      {/* 数据管理 */}
      <section className="settings-section">
        <h2 className="settings-section__title">🗂️ 数据管理</h2>
        <div className="settings-row">
          <span className="settings-row__label">导出本地数据</span>
          <Button variant="soft" size="small" onClick={handleExport}>
            导出为 JSON 文件
          </Button>
        </div>
        <div className="divider" />
        <div className="settings-row">
          <span className="settings-row__label">重置 21 天计划</span>
          <ConfirmButton
            label="重置计划"
            confirmText="将清空进度与反馈（保留激活状态和评估档案），确定吗？"
            onConfirm={() => {
              resetPlanOnly()
              navigate('/today')
            }}
          />
        </div>
        <div className="divider" />
        <div className="settings-row">
          <span className="settings-row__label">清除所有本地数据</span>
          <ConfirmButton
            label="清除全部数据"
            confirmText="将删除评估、反馈、进度和激活状态，确定吗？"
            onConfirm={() => {
              clearAllData()
              navigate('/activation')
            }}
          />
        </div>
      </section>

      {/* 隐私说明 */}
      <section className="settings-section">
        <h2 className="settings-section__title">🔒 隐私说明</h2>
        <p className="muted">{PRIVACY_TEXT}</p>
      </section>

      {/* 版本与返回 */}
      <section className="settings-section">
        <h2 className="settings-section__title">ℹ️ 关于</h2>
        <div className="settings-row">
          <span className="settings-row__label">应用</span>
          <span className="settings-row__value">
            {APP_NAME} v{appVersion}
          </span>
        </div>
        {versions && (
          <div className="settings-row">
            <span className="settings-row__label">运行环境</span>
            <span className="settings-row__value">
              Electron {versions.electron} · Chromium {versions.chrome} · Node {versions.node}
            </span>
          </div>
        )}
        <div className="divider" />
        <Button variant="outline" size="small" onClick={() => navigate('/welcome')}>
          返回欢迎页
        </Button>
      </section>
    </AppLayout>
  )
}
