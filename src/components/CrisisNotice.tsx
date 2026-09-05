import { CRISIS_HELP_TEXT } from '../config'

interface CrisisNoticeProps {
  /** immediate = 强烈冲动；high = 有明确想法或计划；soft = 温和提示（文本检测） */
  level?: 'high' | 'immediate' | 'soft'
  title?: string
  message?: string
  /** 是否显示求助渠道列表（soft 模式默认不显示） */
  showResources?: boolean
}

export function CrisisNotice({
  level = 'high',
  title,
  message,
  showResources,
}: CrisisNoticeProps) {
  const defaultTitle =
    level === 'immediate'
      ? '请先照顾好你的安全'
      : level === 'soft'
        ? '你的话让我有点担心'
        : '安全提醒'

  const defaultMessage =
    level === 'soft'
      ? '如果你正在经历强烈痛苦，或有伤害自己的想法，请一定记得：你不需要独自扛着。'
      : `如果你正在经历强烈痛苦，${CRISIS_HELP_TEXT}`

  const showList = showResources ?? level !== 'soft'

  return (
    <div className={`crisis-notice crisis-notice--${level}`} role="alert">
      <div className="crisis-notice__icon" aria-hidden="true">
        ⚠️
      </div>
      <div className="crisis-notice__body">
        <h3 className="crisis-notice__title">{title ?? defaultTitle}</h3>
        <p className="crisis-notice__text">{message ?? defaultMessage}</p>
        {showList && (
          <ul className="crisis-notice__list">
            <li>联系一位你信任的人，告诉他们你现在的感受</li>
            <li>拨打当地急救电话（中国：120）或前往医院急诊</li>
            <li>全国统一心理援助热线：12356</li>
          </ul>
        )}
        {level !== 'soft' && (
          <p className="crisis-notice__footer">你不需要独自面对这一切，寻求帮助是勇敢的表现。</p>
        )}
      </div>
    </div>
  )
}
