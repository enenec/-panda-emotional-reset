import type { PlanTask, TaskState } from '../types/plan'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types/plan'

interface TaskItemProps {
  task: PlanTask
  state: TaskState
  onStateChange: (state: TaskState) => void
}

const ACTIONS: { value: TaskState; label: string; doneLabel: string }[] = [
  { value: 'done', label: '完成', doneLabel: '已完成' },
  { value: 'skipped', label: '跳过', doneLabel: '已跳过' },
  { value: 'tooHard', label: '太难了', doneLabel: '已标记太难' },
]

export function TaskItem({ task, state, onStateChange }: TaskItemProps) {
  return (
    <div className={`task-item task-item--${state}`}>
      <div className="task-item__top">
        <span className={`tag tag--${task.category}`}>{CATEGORY_LABELS[task.category]}</span>
        <span className="task-item__meta">
          {task.estimatedMinutes} 分钟 · {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </div>
      <h4 className="task-item__title">{task.title}</h4>
      <p className="task-item__desc">{task.description}</p>
      <div className="task-item__actions">
        {ACTIONS.map((action) => {
          const active = state === action.value
          return (
            <button
              key={action.value}
              className={`task-btn ${active ? 'task-btn--active' : ''}`.trim()}
              onClick={() => onStateChange(active ? 'pending' : action.value)}
              aria-pressed={active}
            >
              {active ? `✓ ${action.doneLabel}` : action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
