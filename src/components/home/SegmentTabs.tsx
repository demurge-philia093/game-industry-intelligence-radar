import { useRef, useEffect, type CSSProperties } from 'react'

export interface Seg {
  key: string
  label: string
}

/**
 * 二级·信源标签（1:1 复刻 mihoyo about 页 tab：实测其 DOM/CSS 得来）：
 * 位置=内容区顶部**右对齐**（右上角）；每个 tab=1 行高裁剪窗，内含上下两份同名文字
 * （上=灰字、下=蓝底白字），激活/悬停整列上滚翻出蓝底白字（垂直翻滚=反转动效）。
 * 两 tab 紧贴、近直角、末尾一根竖分隔线。无箭头（mihoyo 无）；超宽时容器内横向滚动、激活自动居中。
 */
export function SegmentTabs({
  segs,
  active,
  onSelect,
}: {
  segs: Seg[]
  active: string
  onSelect: (k: string) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const row = rowRef.current
    const el = activeRef.current
    if (!row || !el) return
    const rr = row.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    row.scrollBy({ left: er.left + er.width / 2 - (rr.left + rr.width / 2), behavior: 'smooth' })
  }, [active, segs])

  return (
    <div ref={rowRef} className="tab-row" style={wrap}>
      {segs.map((s) => {
        const on = s.key === active
        return (
          <button
            key={s.key}
            ref={on ? activeRef : undefined}
            type="button"
            className={`flip-tab${on ? ' is-active' : ''}`}
            onClick={() => onSelect(s.key)}
          >
            <span className="flip-clip">
              <span className="flip-roll">
                <span className="flip-copy flip-plain">{s.label}</span>
                <span className="flip-copy flip-hi">{s.label}</span>
              </span>
            </span>
          </button>
        )
      })}
      <span aria-hidden style={divider} />
    </div>
  )
}

const wrap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 0,
  justifyContent: 'flex-end',
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  width: '100%',
}

const divider: CSSProperties = {
  flex: 'none',
  width: 1,
  height: 16,
  background: '#D2D7E0',
  marginLeft: 14,
}
