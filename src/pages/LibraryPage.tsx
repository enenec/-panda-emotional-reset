import { useState } from 'react'
import { AppLayout } from '../components/AppLayout'

interface LibraryModule {
  id: string
  icon: string
  title: string
  crisis?: boolean
  paragraphs?: string[]
  bullets?: string[]
  /** 结构化的分步内容 */
  steps?: { title: string; text: string }[]
  footer?: string
}

const MODULES: LibraryModule[] = [
  {
    id: 'behaviorActivation',
    icon: '🔋',
    title: '行为激活：为什么情绪低落时要从小行动开始',
    paragraphs: [
      '情绪低落时，大脑会反复告诉你“做什么都没用”。但行动往往走在情绪前面：哪怕只做一件 2 分钟的小事，也能打断“越低落越不动”的循环。',
    ],
    bullets: [
      '从最小、最容易的动作开始，而不是从“应该做的事”开始',
      '完成比完美重要：做了 1 分钟，就是成功',
      '做完一件，再决定要不要做下一件——不勉强',
    ],
  },
  {
    id: 'sleepHygiene',
    icon: '🌙',
    title: '睡眠卫生：睡前 30 分钟降低刺激',
    paragraphs: [
      '睡前 30 分钟，把灯光调暗、放下手机、让房间安静下来。困了再上床，床只用来睡觉。',
    ],
    bullets: [
      '半夜醒来睡不着？起来坐一会儿，困了再回去，比躺着焦虑好',
      '白天尽量晒晒太阳，晚上更容易有困意',
      '入睡时间不固定没关系，先试着每天朝一个大概的时间靠近',
    ],
  },
  {
    id: 'gentleEating',
    icon: '🍵',
    title: '温和饮食：没有胃口时如何先照顾身体',
    paragraphs: [
      '没胃口的时候，先照顾“能吃得下”的部分：温热的汤、粥、软面包、一杯牛奶都可以。不强迫自己“吃好”，先保证“吃一点”。',
    ],
    bullets: [
      '规律比丰盛重要：到点吃一点点，比一顿吃很多强',
      '准备一些“伸手就能吃”的食物，减少动力的消耗',
      '食欲长期很差时，也可以把这件事告诉医生',
    ],
  },
  {
    id: 'lightMovement',
    icon: '🚶',
    title: '轻运动：2 分钟伸展、5 分钟散步',
    paragraphs: ['动一动不是为了变强壮，只是让身体不那么紧绷。'],
    bullets: [
      '2 分钟伸展：耸耸肩、转转脖子、伸个懒腰',
      '5 分钟散步：在楼下或走廊走一小圈，脚踩在地上的感觉就很好',
      '强度不重要，能出门 3 分钟就已经赢了一次',
    ],
  },
  {
    id: 'cbtRecord',
    icon: '🧠',
    title: 'CBT 思维记录：给想法一个更温和的说法',
    steps: [
      { title: '① 发生了什么？', text: '只写事实，不写评价。例如：朋友没回我消息。' },
      { title: '② 我脑中出现了什么想法？', text: '例如：“TA 一定是讨厌我了。”' },
      { title: '③ 这个想法让我有什么感受？', text: '例如：难过、孤独、自我怀疑。' },
      {
        title: '④ 有没有一个更温和、更平衡的说法？',
        text: '例如：“TA 可能在忙。上次聊天时我们还挺好的。”温和版不一定对，但它让你多一个选择。',
      },
    ],
    footer: '不是要强迫自己乐观，只是练习“看见想法”，而不是被想法带走。',
  },
  {
    id: 'mindfulBreath',
    icon: '🌬️',
    title: '正念呼吸：4-1-6 呼吸法',
    steps: [
      { title: '吸气 4 秒', text: '用鼻子慢慢吸气，感受空气进入身体。' },
      { title: '停留 1 秒', text: '轻轻停一下，不用憋气。' },
      { title: '呼气 6 秒', text: '用嘴巴慢慢呼气，比吸气更长一点。' },
    ],
    footer: '重复 3-5 轮。呼气比吸气长，能告诉身体“现在是安全的”。走神了没关系，把注意力轻轻带回来就好。',
  },
  {
    id: 'selfCompassion',
    icon: '🤗',
    title: '自我同情：像对待朋友一样对待自己',
    paragraphs: [
      '如果我的朋友也这样痛苦，我会怎么安慰 TA？把想对 TA 说的话写下来，然后试着对自己说一遍。',
    ],
    bullets: [
      '“你已经很努力了”是一句可以对自己说的话',
      '痛苦是很多人都会经历的，你不孤单，也不是“太脆弱”',
      '对自己温柔，不会让你变懒；它只会让你更有力气继续走',
    ],
  },
  {
    id: 'reconnect',
    icon: '💬',
    title: '人际重新连接：从最小的一步开始',
    paragraphs: [
      '从发一个表情开始，或问一句“最近还好吗”。不用解释自己为什么沉默很久。真正在意你的人，只会高兴你回来。',
    ],
    bullets: [
      '今天只发一条消息，就算完成',
      '回复迟了也没关系，不回复也没关系',
      '约见面可以从“一起喝杯东西、坐 20 分钟”开始',
    ],
  },
  {
    id: 'seekHelp',
    icon: '🩺',
    title: '何时应该寻求专业帮助',
    paragraphs: [
      '出现以下情况时，请尽快联系精神科医生或心理咨询师。这是照顾自己的重要一步，不是软弱。',
    ],
    bullets: [
      '情绪低落持续两周以上，且明显影响生活',
      '无法正常学习或工作',
      '强烈的自责、绝望感',
      '出现伤害自己或结束生命的想法',
      '睡眠和食欲严重紊乱',
    ],
  },
  {
    id: 'crisisHelp',
    icon: '🆘',
    title: '危机帮助提示',
    crisis: true,
    paragraphs: [
      '如果你现在就有伤害自己或结束生命的想法或冲动，请立刻行动：',
    ],
    bullets: [
      '立刻联系一位身边可信任的人，告诉他们你现在的感受',
      '拨打当地急救电话（中国：120）或前往医院急诊',
      '全国统一心理援助热线：12356（24 小时）',
    ],
    footer: '你没有做错任何事，你的痛苦值得被认真对待。请先让自己安全，其他的都可以慢慢来。',
  },
]

export function LibraryPage() {
  const [openId, setOpenId] = useState<string | null>('behaviorActivation')

  return (
    <AppLayout>
      <div className="library-hero">
        <h1 className="library-title">内容库</h1>
        <p className="library-sub">一些小而实用的方法，按你舒服的节奏慢慢看。</p>
      </div>

      {MODULES.map((module) => {
        const open = openId === module.id
        return (
          <div
            key={module.id}
            className={`library-module ${module.crisis ? 'library-module--crisis' : ''}`.trim()}
          >
            <button
              type="button"
              className="library-module__header"
              onClick={() => setOpenId(open ? null : module.id)}
              aria-expanded={open}
            >
              <span className="library-module__icon" aria-hidden="true">
                {module.icon}
              </span>
              <span className="library-module__title">{module.title}</span>
              <span
                className={`library-module__chevron ${open ? 'library-module__chevron--open' : ''}`.trim()}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {open && (
              <div className="library-module__body">
                {module.paragraphs?.map((text) => <p key={text.slice(0, 16)}>{text}</p>)}
                {module.steps?.map((step) => (
                  <p key={step.title}>
                    <strong>{step.title}</strong>
                    <br />
                    {step.text}
                  </p>
                ))}
                {module.bullets && (
                  <ul>
                    {module.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {module.footer && <p className="muted">{module.footer}</p>}
              </div>
            )}
          </div>
        )
      })}
    </AppLayout>
  )
}
