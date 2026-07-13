import type { ReactNode } from 'react'
import { Hash, Building2, Gamepad2 } from 'lucide-react'
import { sourceMeta } from '../../registry/meta'
import { tint } from '../../lib/color'

/** 信源徽章：图标 + 名称，按信源强调色着色。 */
export function SourceBadge({ type }: { type: string }) {
  const meta = sourceMeta(type)
  const Icon = meta.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{
        color: meta.accent,
        background: tint(meta.accent, 12),
        border: `1px solid ${tint(meta.accent, 35)}`,
      }}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  )
}

/** 标签 chip（#tag）。 */
export function TagPill({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        color: active ? 'var(--bg)' : 'var(--text-dim)',
        background: active ? 'var(--signal)' : 'var(--panel-2)',
        border: '1px solid var(--border)',
      }}
    >
      <Hash size={11} />
      {label}
    </Tag>
  )
}

/** 实体 chip（公司 / 作品）。 */
export function EntityChip({
  label,
  kind,
  onClick,
  active,
}: {
  label: string
  kind: 'company' | 'work'
  onClick?: () => void
  active?: boolean
}) {
  const Icon = kind === 'company' ? Building2 : Gamepad2
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        color: active ? 'var(--text-h)' : 'var(--text-dim)',
        background: active ? tint('var(--signal)', 18) : 'var(--panel-2)',
        border: `1px solid ${active ? tint('var(--signal)', 45) : 'var(--border)'}`,
      }}
    >
      <Icon size={11} className="opacity-70" />
      {label}
    </Tag>
  )
}

/** 通用面板容器（卡片式分区）。 */
export function Panel({
  children,
  className,
  accent,
}: {
  children: ReactNode
  className?: string
  accent?: string
}) {
  return (
    <section
      className={`rounded-2xl border bg-[var(--panel)] ${className ?? ''}`}
      style={{
        borderColor: accent ? tint(accent, 35) : 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </section>
  )
}
