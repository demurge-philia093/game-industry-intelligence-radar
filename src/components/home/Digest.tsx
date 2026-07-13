import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Digest as DigestData } from '../../lib/daily'

const BLUE = '#3778E5'
const SKY = '#23ADE5'
const INK = '#16213E'
const GRAD = 'linear-gradient(90deg, #4F8FE0, #B06AB3)'

/** 中英对照模块小标（签名样式）：中文粗主标 + 英文大写浅灰副。 */
export function ModuleTitle({ cn, en, extra }: { cn: string; en: string; extra?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: INK, letterSpacing: '0.01em' }}>{cn}</span>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', color: '#B9C0CC' }}>{en}</span>
      </div>
      {extra && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#999' }}>{extra}</p>}
    </div>
  )
}

/** 汇总态：今日焦点（最高价值，单行大标）+ 其余命中（蓝竖条列表）。每条可跳详情。
 *  锁定一屏：根为 flex 列；其余命中列表 flex:1 内部滚动，超出不顶破整页。 */
export function Digest({ data }: { data: DigestData }) {
  const { focus, rest, count, date } = data
  if (!focus) {
    return <p style={{ color: '#999', fontSize: 15 }}>今日窗口暂无命中条目。</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <ModuleTitle cn="演示要点" en="DEMO" extra={`${date} · 共 ${count} 条命中你的关注`} />

      {/* 焦点 */}
      <Link to={`/item/${focus.id}`} style={{ display: 'block', textDecoration: 'none', marginTop: 14, flex: 'none' }}>
        <h2
          style={{
            fontSize: 'clamp(22px, 1.9vw, 30px)',
            fontWeight: 800,
            color: INK,
            lineHeight: 1.12,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {focus.title}
        </h2>
        <p
          style={{
            margin: '6px 0 0',
            fontStyle: 'italic',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: GRAD,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}
        >
          DEMO TOP SIGNAL
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666' }}>
          <span style={{ color: BLUE }}>{focus.hit_reason}</span>
          <span style={{ color: '#bbb' }}> · </span>来源 {focus.source_name}
        </p>
      </Link>

      {/* 其余命中（flex:1，内部滚动） */}
      {rest.length > 0 && (
        <div style={{ marginTop: 18, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <ModuleTitle cn="其余命中" en="MORE SIGNALS" />
          <ul
            className="src-scroll"
            style={{
              listStyle: 'none',
              margin: '10px 0 0',
              padding: 0,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {rest.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/item/${p.id}`}
                  className="rd-row"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '7px 12px 7px 0',
                    borderTop: '1px solid #EEF1F6',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ width: 3, alignSelf: 'stretch', minHeight: 16, background: SKY, borderRadius: 2, flex: 'none' }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 14.5,
                        fontWeight: 500,
                        color: INK,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.title}
                    </span>
                    <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#999' }}>
                      来源 {p.source_name}
                      <span style={{ color: '#ccc' }}> · </span>
                      <span style={{ color: BLUE }}>{p.hit_reason}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={15} style={{ color: '#C4CAD4', flex: 'none', marginTop: 3 }} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
