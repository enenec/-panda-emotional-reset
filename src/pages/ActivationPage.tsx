import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PandaMascot } from '../components/PandaMascot'
import { Button } from '../components/Button'
import { activateLicense, checkActivationStatus } from '../services/licenseService'
import { APP_NAME, APP_SUBTITLE, DISCLAIMER_TEXT } from '../config'

export function ActivationPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // 已激活则直接进入欢迎页（正常流程下启动逻辑会先跳转，这里兜底）
  useEffect(() => {
    let cancelled = false
    void checkActivationStatus().then((status) => {
      if (!cancelled && status.activated) navigate('/welcome', { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (checking) return
    setChecking(true)
    setError('')
    const result = await activateLicense(code)
    setChecking(false)
    if (result.success) {
      navigate('/welcome')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="activation-page">
      <div className="deco-blob deco-blob--bamboo" />
      <div className="deco-blob deco-blob--yellow" />
      <div className="deco-blob deco-blob--sky" />

      <div className="card activation-card">
        <div className="activation-card__mascot">
          <PandaMascot size="medium" />
        </div>
        <h1 className="activation-title">{APP_NAME}</h1>
        <p className="activation-subtitle">{APP_SUBTITLE}</p>

        <form onSubmit={handleSubmit}>
          <input
            className="activation-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="请输入你的专属识别码"
            autoFocus
            spellCheck={false}
            aria-label="专属识别码"
          />
          <Button type="submit" block size="large" disabled={checking} className="mt-16">
            {checking ? '正在验证…' : '激活'}
          </Button>
        </form>

        {error && (
          <div className="activation-error" role="alert">
            {error}
          </div>
        )}

        <button type="button" className="activation-help-link" onClick={() => setShowHelp((v) => !v)}>
          这是什么？
        </button>

        {showHelp && (
          <div className="activation-help">
            <p>
              这是你获取本软件时拿到的专属识别码。激活后无需联网即可在本机使用。
              演示版本可用测试识别码：<code>PANDA-RESET-2025</code>（更多见 README）。
            </p>
          </div>
        )}
      </div>

      <p className="activation-page__disclaimer">{DISCLAIMER_TEXT}</p>
    </div>
  )
}
