import type { AssessmentAnswers, RiskLevel } from '../types/user'
import { CRISIS_HELP_TEXT } from '../config'

/**
 * 安全服务：风险评估、危机提示与风险文本检测
 * 本软件不提供医学诊断，安全相关功能仅用于在用户需要时第一时间提供求助信息。
 */

/** 根据评估中的安全回答计算风险等级 */
export function getRiskLevelFromAssessment(answers: AssessmentAnswers): RiskLevel {
  switch (answers.selfHarm) {
    case 'none':
      return 'none'
    case 'passiveThoughts':
      return 'low'
    case 'plans':
      return 'high'
    case 'strongUrge':
      return 'immediate'
    default:
      return 'none'
  }
}

/** 是否需要显示危机提示卡片 */
export function shouldShowCrisisMessage(riskLevel: RiskLevel): boolean {
  return riskLevel === 'high' || riskLevel === 'immediate'
}

/** 危机提示文案（按风险等级区分语气） */
export function getCrisisMessage(riskLevel: RiskLevel): string {
  if (riskLevel === 'immediate') {
    return `你此刻可能非常难受。请先停下来，把手机放下，立刻联系身边可信任的人、拨打当地急救电话（中国：120）、前往医院急诊，或拨打全国统一心理援助热线 12356。你很重要，寻求帮助是勇敢的。`
  }
  if (riskLevel === 'high') {
    return `你有伤害自己的想法，这值得认真对待。请不要独自承受：联系一位你信任的人，或拨打全国统一心理援助热线 12356，必要时前往医院急诊。软件无法代替专业帮助，但它会陪你做很小、很安全的一步。`
  }
  return CRISIS_HELP_TEXT
}

const CRISIS_WORDS = [
  '自杀',
  '不想活',
  '想死',
  '轻生',
  '活不下去',
  '结束生命',
  '伤害自己',
  '自残',
  '一了百了',
  '活着没意思',
  '活腻',
  '了结',
]

/**
 * 简单检测用户输入中是否包含风险词
 * 用于每日反馈的自由文本输入，命中时温和地提示求助渠道。
 */
export function detectRiskText(text: string): boolean {
  if (!text) return false
  return CRISIS_WORDS.some((word) => text.includes(word))
}
