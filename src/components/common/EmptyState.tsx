import type { ComponentType } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  title,
  hint,
  icon: Icon = Inbox,
}: {
  title: string
  hint?: string
  icon?: ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Icon size={36} className="text-[var(--text-faint)]" />
      <p className="text-[var(--text-dim)]">{title}</p>
      {hint && <p className="text-sm text-[var(--text-faint)]">{hint}</p>}
    </div>
  )
}
