interface ProgressBarProps {
  /** 进度条标题（左侧） */
  label?: string
  /** 当前值 */
  value: number
  /** 最大值 */
  max?: number
  /** 右侧说明文字 */
  hint?: string
}

export function ProgressBar({ label, value, max = 100, hint }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="progress-bar">
      {(label || hint) && (
        <div className="progress-bar__label">
          <span>{label ?? ''}</span>
          <span>{hint ?? ''}</span>
        </div>
      )}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
