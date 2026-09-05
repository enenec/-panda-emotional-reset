interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  leftLabel?: string
  rightLabel?: string
  /** 根据当前值给出温和的提示语 */
  hintForValue?: (value: number) => string
  onChange: (value: number) => void
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  leftLabel = '低',
  rightLabel = '高',
  hintForValue,
  onChange,
}: SliderInputProps) {
  return (
    <div className="slider">
      <div className="slider__header">
        <span className="slider__label">{label}</span>
        <span className="slider__value">{value}</span>
      </div>
      <input
        type="range"
        className="slider__input"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="slider__ends">
        <span>{leftLabel}</span>
        <span className="slider__hint">{hintForValue ? hintForValue(value) : ''}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
