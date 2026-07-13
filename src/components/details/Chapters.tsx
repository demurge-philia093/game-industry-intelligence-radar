import { useMemo } from 'react'
import { ListTree } from 'lucide-react'
import type { Chapter } from '../../types/payloads'
import { formatTime } from '../../lib/format'
import { tint } from '../../lib/color'

export function Chapters({
  chapters,
  currentTime,
  seekEnabled,
  onSeek,
}: {
  chapters: Chapter[]
  currentTime: number
  seekEnabled: boolean
  onSeek: (t: number) => void
}) {
  const activeIdx = useMemo(() => {
    if (!seekEnabled) return -1
    let idx = -1
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].start <= currentTime + 0.05) idx = i
      else break
    }
    return idx
  }, [chapters, currentTime, seekEnabled])

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <ListTree size={16} className="text-[var(--accent-podcast)]" />
        <h2 className="font-serif text-lg font-medium tracking-tight text-[var(--text-h)]">
          章节
        </h2>
        <span className="text-xs text-[var(--text-faint)]">
          {chapters.length} 节{seekEnabled ? ' · 点击跳转' : ' · 静态时间轴'}
        </span>
      </div>
      <ol className="flex flex-col gap-1">
        {chapters.map((c, i) => {
          const active = i === activeIdx
          const content = (
            <>
              <span
                className="w-12 shrink-0 font-mono text-xs tabular-nums"
                style={{
                  color: active
                    ? 'var(--accent-podcast)'
                    : 'var(--text-faint)',
                }}
              >
                {formatTime(c.start)}
              </span>
              <span
                className="text-sm"
                style={{
                  color: active ? 'var(--text-h)' : 'var(--text)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {c.title}
              </span>
            </>
          )
          return (
            <li key={i}>
              {seekEnabled ? (
                <button
                  type="button"
                  onClick={() => onSeek(c.start)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--panel-2)]"
                  style={{
                    background: active ? tint('var(--accent-podcast)', 12) : undefined,
                  }}
                >
                  {content}
                </button>
              ) : (
                <div className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left">
                  {content}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
