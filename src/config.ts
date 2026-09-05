/** 应用基础信息与安全文案 */

export const APP_NAME = '熊猫情绪重启计划'
export const APP_VERSION = '1.0.0'
export const APP_SUBTITLE = '21 天，和一只温柔的熊猫一起，把生活慢慢找回来。'

/** 医疗免责声明（欢迎页 / 设置页 / 风险提示处展示） */
export const DISCLAIMER_TEXT =
  '本软件仅用于心理健康自助支持，不提供医学诊断，不替代心理咨询、精神科治疗或药物治疗。'

/** 危机帮助提示（欢迎页 / 危机提醒卡片展示） */
export const CRISIS_HELP_TEXT =
  '如你有伤害自己或结束生命的想法，请立即联系身边可信任的人、当地急救电话、医院急诊或专业危机干预热线。'

/** 完整安全提示（两段合一，与产品要求一致） */
export const FULL_SAFETY_TEXT = `${DISCLAIMER_TEXT}${CRISIS_HELP_TEXT}`

/** 隐私说明（设置页展示） */
export const PRIVACY_TEXT =
  '当前版本中，你的评估、反馈和计划数据默认只保存在本机 localStorage，不会自动上传。'
