/** 21 天计划完成后的庆祝与后续维护建议（今日计划页 / 进度页共用） */

export function CompletionCelebration() {
  return (
    <div className="celebration">
      <div className="celebration__emoji" aria-hidden="true">
        🎉
      </div>
      <h2 className="celebration__title">你走完了 21 天</h2>
      <p className="celebration__text">
        这不是结束，而是你已经验证过的、属于自己的照顾系统。
      </p>
      <div className="celebration__tips">
        <h3>之后的维护小建议</h3>
        <ul>
          <li>保留 2-3 个最有帮助的小习惯，不必全部继续</li>
          <li>每周给自己安排一件小小的期待</li>
          <li>情绪反复是正常的，低谷时回到最小的一步</li>
          <li>需要时，可以随时在设置页重置计划再来一轮，或导出你的记录</li>
        </ul>
      </div>
    </div>
  )
}
