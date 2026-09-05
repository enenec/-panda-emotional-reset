import type { UserProfile } from '../types/user'
import type { DailyFeedback } from '../types/feedback'
import type {
  DailyPlan,
  PlanCategory,
  PlanStage,
  PlanTask,
  TaskDifficulty,
} from '../types/plan'
import { getStageForDay } from '../types/plan'

/**
 * 每日计划生成引擎
 *
 * 生成规则：
 * 1. 第 1-7 天（稳定期）：恢复基础节律，降低压力；
 * 2. 第 8-14 天（激活期）：增加可控感和正向活动；
 * 3. 第 15-21 天（重建期）：形成后续生活系统；
 * 4. 情绪 / 精力 <= 3 时任务难度降低；
 * 5. 昨日未完成或希望更轻松时，今日任务难度降低；
 * 6. 昨日全部完成且情绪精力尚可时，今日略微增加挑战；
 * 7. 每天生成 3-5 个任务；
 * 8. 高风险用户（high / immediate）附带 safetyNote 并降低难度。
 */

interface TaskSeed {
  title: string
  description: string
  category: PlanCategory
  estimatedMinutes: number
  difficulty: TaskDifficulty
}

// —— 各阶段任务池 ——

const STAGE_POOLS: Record<PlanStage, TaskSeed[]> = {
  stabilize: [
    {
      title: '喝一杯温水',
      description: '倒一杯温水，慢慢喝完。水分够了，身体会舒服一点。',
      category: 'body',
      estimatedMinutes: 3,
      difficulty: 'gentle',
    },
    {
      title: '认真吃一顿简单的饭',
      description: '不用丰盛，热汤、粥、面条都可以。给身体一点踏实的支持。',
      category: 'body',
      estimatedMinutes: 15,
      difficulty: 'gentle',
    },
    {
      title: '到窗边晒晒太阳',
      description: '走到窗边或阳台，让阳光落在脸上几分钟。阳光会悄悄帮你的节律恢复。',
      category: 'body',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '做一次 3 分钟伸展',
      description: '耸耸肩、转转脖子、伸个懒腰。不用标准动作，动一动就好。',
      category: 'movement',
      estimatedMinutes: 3,
      difficulty: 'gentle',
    },
    {
      title: '写下一句今天的感受',
      description: '打开本子或备忘录，只写一句话：今天，我感觉到……',
      category: 'reflection',
      estimatedMinutes: 3,
      difficulty: 'gentle',
    },
    {
      title: '整理一个很小的角落',
      description: '整理床头柜或书桌的一角，5 分钟就够。完成它会给你一点点掌控感。',
      category: 'mind',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '今晚固定一个睡觉时间',
      description: '给自己定一个大概的入睡时间，今晚试试朝它靠近一点。',
      category: 'sleep',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '对自己说一句温柔的话',
      description: "写下并念出：'我已经在努力了。' 把它贴在看得到的地方。",
      category: 'selfCompassion',
      estimatedMinutes: 3,
      difficulty: 'gentle',
    },
  ],
  activate: [
    {
      title: '出门散步 8 分钟',
      description: '在家附近走一小圈。不追求速度，脚踩在地上的感觉就很好。',
      category: 'movement',
      estimatedMinutes: 10,
      difficulty: 'moderate',
    },
    {
      title: '阅读一小段文字',
      description: '找一本轻松的书或文章，读 5 分钟。读不完也没关系。',
      category: 'reading',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
    {
      title: '记录一个自动冒出的想法',
      description: '当某个想法让你难受时，把它写下来：它说了什么？不用反驳，先看见它。',
      category: 'mind',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '做一个微小社交动作',
      description: "给一个朋友发一个表情，或问一句'最近还好吗'。只发一条就很好。",
      category: 'social',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '做一件有掌控感的小事',
      description: '把一项小任务完整做完：整理桌面、洗好碗、回复一条消息。',
      category: 'mind',
      estimatedMinutes: 15,
      difficulty: 'moderate',
    },
    {
      title: '睡前放下手机 30 分钟',
      description: '睡前把手机放远一点，听点轻音乐或发发呆。',
      category: 'sleep',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
    {
      title: '练习一次自我同情',
      description: '想象你最好的朋友正经历你的痛苦，你会对 TA 说什么？把这句话说给自己听。',
      category: 'selfCompassion',
      estimatedMinutes: 5,
      difficulty: 'gentle',
    },
    {
      title: '做一轮 4-1-6 呼吸',
      description: '吸气 4 秒，停留 1 秒，呼气 6 秒，重复 3 轮。',
      category: 'mind',
      estimatedMinutes: 3,
      difficulty: 'gentle',
    },
  ],
  rebuild: [
    {
      title: '完成一次温和运动',
      description: '散步、骑车或跟练轻运动视频，20 分钟左右，微微出汗就好。',
      category: 'movement',
      estimatedMinutes: 20,
      difficulty: 'moderate',
    },
    {
      title: '做一次自我同情书写',
      description: '写下三句你希望从朋友那里听到的、安慰自己的话。',
      category: 'selfCompassion',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
    {
      title: '澄清一件你在乎的事',
      description: "想一想：最近哪件小事让你觉得'有点意义'？把它写下来。",
      category: 'reflection',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
    {
      title: '主动联系一个重要的人',
      description: '给一个你信任的人打个电话或约一次见面，聊聊近况。',
      category: 'social',
      estimatedMinutes: 15,
      difficulty: 'moderate',
    },
    {
      title: '复盘这 21 天',
      description: '回看你的记录，写下 2 个你做到过的小事，无论多小。',
      category: 'reflection',
      estimatedMinutes: 15,
      difficulty: 'gentle',
    },
    {
      title: '写下 21 天后的维持计划',
      description: '选 2-3 个对你有帮助的小习惯，写下你会怎么继续它们。',
      category: 'mind',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
    {
      title: '给运动加一点挑战',
      description: '在你习惯的运动上多走 5 分钟，或多做一组动作。',
      category: 'movement',
      estimatedMinutes: 20,
      difficulty: 'challenging',
    },
    {
      title: '安排一件下周的小期待',
      description: '安排一件下周的小期待：一杯喜欢的饮料、一部想看的电影。',
      category: 'mind',
      estimatedMinutes: 10,
      difficulty: 'gentle',
    },
  ],
}

// —— 各阶段主题与鼓励语 ——

const THEMES: Record<PlanStage, string[]> = {
  stabilize: ['今天先把身体照顾好一点点', '先让自己稳稳落地', '慢慢找回生活的基本节律'],
  activate: ['给生活加一点小小的行动', '一点点找回掌控感', '让今天有一个小小的开始'],
  rebuild: ['为自己搭一座可以长期生活的房子', '把有用的部分留下来', '温柔地走向更远的未来'],
}

const ENCOURAGEMENTS = [
  '熊猫陪你慢慢来，今天只走一小步。',
  '你不用一下子变好，做完最小的一步就很棒。',
  '允许自己慢一点，你已经在路上了。',
  '今天也辛苦了，记得抱抱自己。',
  '小小的行动，也会让日子不一样一点点。',
  '你不需要完美，只需要继续。',
]

const DIFFICULTY_ORDER: TaskDifficulty[] = ['gentle', 'moderate', 'challenging']

function shiftDifficulty(difficulty: TaskDifficulty, offset: number): TaskDifficulty {
  const index = Math.min(
    Math.max(DIFFICULTY_ORDER.indexOf(difficulty) + offset, 0),
    DIFFICULTY_ORDER.length - 1,
  )
  return DIFFICULTY_ORDER[index]
}

/** 按类别轮流挑选任务，保证每天的计划类别多样、内容有变化 */
function pickTasks(pool: TaskSeed[], dayNumber: number, count: number): TaskSeed[] {
  const groups = new Map<PlanCategory, TaskSeed[]>()
  for (const seed of pool) {
    const list = groups.get(seed.category) ?? []
    list.push(seed)
    groups.set(seed.category, list)
  }

  const preferredOrder: PlanCategory[] = [
    'body',
    'movement',
    'sleep',
    'mind',
    'reading',
    'social',
    'reflection',
    'selfCompassion',
  ]
  const categories = preferredOrder.filter((c) => groups.has(c))
  const offset = categories.length > 0 ? dayNumber % categories.length : 0
  const rotated = [...categories.slice(offset), ...categories.slice(0, offset)]

  const picked: TaskSeed[] = []
  let round = 0
  while (picked.length < count && rotated.length > 0) {
    let addedThisRound = false
    for (const category of rotated) {
      if (picked.length >= count) break
      const list = groups.get(category)
      if (!list || list.length === 0) continue
      const seed = list[(round + dayNumber) % list.length]
      if (picked.includes(seed)) continue
      picked.push(seed)
      addedThisRound = true
    }
    if (!addedThisRound) break
    round += 1
  }
  return picked
}

export interface GeneratePlanParams {
  userProfile: UserProfile
  dayNumber: number
  previousFeedback?: DailyFeedback
}

export function generateDailyPlan({
  userProfile,
  dayNumber,
  previousFeedback,
}: GeneratePlanParams): DailyPlan {
  const stage = getStageForDay(dayNumber)
  const answers = userProfile.answers

  // 1. 按评估偏好过滤任务池
  let pool = [...STAGE_POOLS[stage]]
  if (answers.readingPreference === 'dislikes') {
    pool = pool.filter((t) => t.category !== 'reading')
  }
  if (answers.dailyTime <= 5) {
    pool = pool.filter((t) => t.estimatedMinutes <= 5)
  } else if (answers.dailyTime <= 10) {
    pool = pool.filter((t) => t.estimatedMinutes <= 10)
  } else if (answers.dailyTime <= 20) {
    pool = pool.filter((t) => t.estimatedMinutes <= 15)
  }
  if (pool.length < 3) pool = [...STAGE_POOLS[stage]]

  // 2. 计算任务数量与难度偏移
  const lowMood = answers.moodScore <= 3 || answers.energyScore <= 3
  const highRisk = userProfile.riskLevel === 'high' || userProfile.riskLevel === 'immediate'

  let count = 4
  let difficultyOffset = 0

  if (lowMood || highRisk) {
    count = 3
    difficultyOffset = -1
  } else if (previousFeedback) {
    const { taskCompletion, tomorrowPreference, moodScore, energyScore } = previousFeedback
    if (tomorrowPreference === 'easier' || taskCompletion === 'none') {
      difficultyOffset = -1
    } else if (taskCompletion === 'all' && moodScore >= 6 && energyScore >= 6) {
      difficultyOffset = 1
      count = 5
    }
  }

  count = Math.min(count, pool.length)

  // 3. 挑选任务并应用偏好与难度调整
  const seeds = pickTasks(pool, dayNumber, count)
  const tasks: PlanTask[] = seeds.map((seed, index) => {
    let difficulty = seed.difficulty
    if (answers.movementPreference === 'veryLight' && seed.category === 'movement') {
      difficulty = 'gentle'
    }
    if (answers.socialPreference === 'minimal' && seed.category === 'social') {
      difficulty = 'gentle'
    }
    difficulty = shiftDifficulty(difficulty, difficultyOffset)
    return {
      id: `day${dayNumber}-task${index + 1}-${seed.category}`,
      title: seed.title,
      description: seed.description,
      category: seed.category,
      estimatedMinutes: seed.estimatedMinutes,
      difficulty,
    }
  })

  // 4. 高风险用户附带安全提示
  let safetyNote: string | undefined
  if (highRisk) {
    safetyNote =
      '你的安全最重要。如果你此刻有伤害自己的冲动，请先放下手机，立刻联系身边可信任的人，或拨打当地急救电话（中国：120）与全国统一心理援助热线 12356。'
  }

  return {
    dayNumber,
    stage,
    theme: THEMES[stage][dayNumber % THEMES[stage].length],
    tasks,
    encouragement: ENCOURAGEMENTS[dayNumber % ENCOURAGEMENTS.length],
    safetyNote,
    generatedAt: new Date().toISOString(),
  }
}
