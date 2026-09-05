/** 纯 CSS 绘制的熊猫 Mascot，无需图片资源 */

interface PandaMascotProps {
  size?: 'small' | 'medium' | 'large'
}

export function PandaMascot({ size = 'medium' }: PandaMascotProps) {
  return (
    <div
      className={`panda-mascot panda-mascot--${size}`}
      role="img"
      aria-label="温柔的熊猫伙伴"
    >
      <div className="panda-ear panda-ear--left" />
      <div className="panda-ear panda-ear--right" />
      <div className="panda-face">
        <div className="panda-eye-patch panda-eye-patch--left">
          <div className="panda-eye" />
        </div>
        <div className="panda-eye-patch panda-eye-patch--right">
          <div className="panda-eye" />
        </div>
        <div className="panda-nose" />
        <div className="panda-mouth" />
        <div className="panda-blush panda-blush--left" />
        <div className="panda-blush panda-blush--right" />
      </div>
    </div>
  )
}
