import { Mic, UserRound, Users } from 'lucide-react'
import type { Person } from '../../types/payloads'
import { tint } from '../../lib/color'

function initials(name: string): string {
  return name.trim().slice(0, 2)
}

function PersonCard({ person }: { person: Person }) {
  const isHost = person.role === 'host'
  const isGuest = person.role === 'guest'
  // 采集阶段 role 可能留空（未判定 host/guest）→ 中性显示「参与者」，不臆断
  const accent = isHost
    ? 'var(--accent-podcast)'
    : isGuest
      ? 'var(--accent-news)'
      : 'var(--text-dim)'
  const roleLabel = isHost ? '主持' : isGuest ? '嘉宾' : '参与者'
  const RoleIcon = isHost ? Mic : isGuest ? UserRound : Users
  return (
    <div
      className="flex gap-3 rounded-xl border p-3.5"
      style={{
        borderColor: tint(accent, 30),
        background: `linear-gradient(180deg, ${tint(accent, 6)}, transparent), var(--panel-2)`,
      }}
    >
      {person.avatar ? (
        <img
          src={person.avatar}
          alt={person.name}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ background: tint(accent, 18), color: accent }}
        >
          {initials(person.name)}
        </span>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--text-h)]">{person.name}</span>
          <span
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ color: accent, background: tint(accent, 14) }}
          >
            <RoleIcon size={10} />
            {roleLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-dim)]">{person.affiliation}</p>
        {person.bio && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text)]">
            {person.bio}
          </p>
        )}
      </div>
    </div>
  )
}

export function People({ people }: { people: Person[] }) {
  if (people.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {people.map((p, i) => (
        <PersonCard key={i} person={p} />
      ))}
    </div>
  )
}
