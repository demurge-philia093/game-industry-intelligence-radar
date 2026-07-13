import { useEffect, useMemo, useRef } from 'react'
import { Volume2 } from 'lucide-react'
import type { Person, TranscriptSegment } from '../../types/payloads'
import { formatTime } from '../../lib/format'
import { tint } from '../../lib/color'

const GUEST_PALETTE = [
  'var(--accent-news)',
  'var(--accent-wechat)',
  '#9a5b6b',
  '#b07a3c',
]

/** 说话人标识：优先人工映射的真名，否则用分离算法的原始标签（SPEAKER_00/S1…）。 */
function speakerKey(seg: TranscriptSegment): string {
  return seg.speaker_name || seg.speaker || ''
}

/** 当前时间对应的段落下标：start <= t 的最后一个段落。 */
function findActiveIndex(segments: TranscriptSegment[], t: number): number {
  let idx = -1
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].start <= t + 0.05) idx = i
    else break
  }
  return idx
}

export function Transcript({
  segments,
  people,
  currentTime,
  playing,
  seekEnabled,
  onSeek,
}: {
  segments: TranscriptSegment[]
  people: Person[]
  currentTime: number
  playing: boolean
  seekEnabled: boolean
  onSeek: (t: number) => void
}) {
  // 按出现顺序的不同说话人；>1 才显示说话人标签与区分（单说话人如 whisper.cpp 的 S1 不显）
  const speakerKeys = useMemo(() => {
    const seen: string[] = []
    for (const s of segments) {
      const k = speakerKey(s)
      if (k && !seen.includes(k)) seen.push(k)
    }
    return seen
  }, [segments])
  const multiSpeaker = speakerKeys.length > 1

  const { colors, indentOf } = useMemo(() => {
    const roleByName = new Map(people.map((p) => [p.name, p.role]))
    const colors = new Map<string, string>()
    const indentOf = new Map<string, boolean>()
    let gi = 0
    speakerKeys.forEach((k, idx) => {
      const role = roleByName.get(k)
      colors.set(k, role === 'host' ? 'var(--accent-podcast)' : GUEST_PALETTE[gi++ % GUEST_PALETTE.length])
      // host 左、guest 右；SPEAKER_xx 无角色 → 按出现顺序奇偶交替缩进
      indentOf.set(k, role === 'guest' ? true : role === 'host' ? false : idx % 2 === 1)
    })
    return { colors, indentOf }
  }, [people, speakerKeys])

  const activeIdx = useMemo(
    () => (seekEnabled ? findActiveIndex(segments, currentTime) : -1),
    [segments, currentTime, seekEnabled],
  )

  const activeRef = useRef<HTMLButtonElement | null>(null)
  const prevIdx = useRef(-1)
  useEffect(() => {
    if (activeIdx !== prevIdx.current) {
      prevIdx.current = activeIdx
      if (seekEnabled && playing && activeRef.current) {
        activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [activeIdx, playing, seekEnabled])

  return (
    <div className="max-h-[64vh] overflow-y-auto rounded-xl pr-1">
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => {
          const key = speakerKey(seg)
          const color = colors.get(key) ?? 'var(--text-dim)'
          const indent = multiSpeaker && (indentOf.get(key) ?? false)
          const active = i === activeIdx
          const style = {
            borderLeftColor: active ? color : tint(color, 45),
            borderLeftWidth: active ? 3 : 2,
            background: active ? tint('var(--signal)', 10) : 'transparent',
            marginLeft: indent ? 14 : 0,
            animation: active ? 'seg-pulse 1.1s ease-out 1' : undefined,
          }
          const content = (
            <>
              <div className="mb-0.5 flex items-center gap-2">
                <span
                  className="font-mono text-[11px] tabular-nums"
                  style={{ color: active ? 'var(--signal)' : 'var(--text-faint)' }}
                >
                  {formatTime(seg.start)}
                </span>
                {multiSpeaker && (
                  <span className="text-xs font-semibold" style={{ color }}>
                    {key}
                  </span>
                )}
                {active && <Volume2 size={13} className="text-[var(--signal)]" />}
              </div>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: active ? 'var(--text-h)' : 'var(--text)' }}
              >
                {seg.text}
              </p>
            </>
          )

          return seekEnabled ? (
            <button
              key={i}
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSeek(seg.start)}
              className="group w-full rounded-lg border-l-2 px-3 py-2 text-left transition-colors"
              style={style}
              onMouseEnter={(event) => {
                if (!active) event.currentTarget.style.background = 'var(--panel-2)'
              }}
              onMouseLeave={(event) => {
                if (!active) event.currentTarget.style.background = 'transparent'
              }}
            >
              {content}
            </button>
          ) : (
            <div
              key={i}
              className="w-full rounded-lg border-l-2 px-3 py-2 text-left"
              style={{
                ...style,
                animation: undefined,
              }}
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
