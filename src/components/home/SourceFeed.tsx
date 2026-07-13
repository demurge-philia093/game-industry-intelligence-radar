import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import type { FeedItem } from '../../types/envelope'
import { isPickPlaceholder } from '../../lib/daily'
import { ModuleTitle } from './Digest'

const BLUE = '#3778E5'
const INK = '#16213E'

function hm(iso: string): string {
  // 2026-06-22T15:27:00+08:00 → 06-22 15:27
  const m = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso)
  return m ? `${m[2]}-${m[3]} ${m[4]}:${m[5]}` : ''
}

/** 取该条的摘要片段（真实数据：payload.excerpt 优先，回退 deep_summary），用作卡片副点。 */
function snippet(it: FeedItem): string {
  const ex = (it.payload as { excerpt?: string })?.excerpt || it.deep_summary || ''
  const s = ex.replace(/\s+/g, ' ').trim()
  return s.length > 64 ? s.slice(0, 64) + '…' : s
}

/**
 * 某信源今日清单（点信源图标后的态）：编号卡片陈列（参考米哈游招聘页编号卡）。
 * 锁定一屏：根为 flex 列，卡片列 flex:1 内部滚动（src-scroll 冷灰细条），
 * 顶栏/底盘始终在屏，仅卡片列在框内滚动——长清单（可能 ~90 条）不顶破整页。
 */
const RENDER_CAP = 60 // 控 DOM：最多渲染 60 张（如 wechat 数千条），其余在列表内滚动也不堆 DOM

export interface SourceFeedFolded {
  items: FeedItem[]
  open: boolean
  onToggle: () => void
  /** 数量后的语义标签；默认用于普通播客的“集低相关单集”。 */
  label?: string
  /** 展开条目上的短徽标；默认“低相关”。 */
  badgeLabel?: string
}

export function SourceFeed({
  label,
  items,
  folded,
  hideRecencyBadge = false,
}: {
  label: string
  items: FeedItem[]
  folded?: SourceFeedFolded
  hideRecencyBadge?: boolean
}) {
  const foldedItems = folded?.items ?? []
  const totalCount = items.length + foldedItems.length
  const shown = items.slice(0, RENDER_CAP)
  const foldedShown = folded?.open ? foldedItems.slice(0, RENDER_CAP) : []
  const renderedCount = shown.length + foldedShown.length
  const foldedLabel = folded?.label ?? '集低相关单集'
  const foldedBadgeLabel = folded?.badgeLabel ?? '低相关'
  const foldedText =
    folded?.open && foldedShown.length < foldedItems.length
      ? `已展开 ${foldedShown.length}/${foldedItems.length} ${foldedLabel}`
      : `已${folded?.open ? '展开' : '折叠'} ${foldedItems.length} ${foldedLabel}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <ModuleTitle
        cn={hideRecencyBadge ? label : `${label}·最近`}
        en={hideRecencyBadge ? '' : 'RECENT'}
        extra={`共 ${totalCount} 条${totalCount > renderedCount ? ` · 已显示 ${renderedCount}/${totalCount}` : ''}`}
      />

      {totalCount === 0 ? (
        <p style={{ marginTop: 18, fontSize: 15, color: '#999' }}>该信源暂无条目。</p>
      ) : (
        <ul
          className="src-scroll"
          style={{
            listStyle: 'none',
            margin: '12px 0 0',
            padding: 0,
            paddingRight: 8,
            paddingBottom: 8,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {shown.map((it, i) => renderItem(it, i, null))}
          {foldedItems.length > 0 && folded && (
            <li>
              <button type="button" onClick={folded.onToggle} style={foldToggle}>
                {foldedText} · {folded.open ? '收起' : '展开'}
              </button>
            </li>
          )}
          {foldedShown.map((it, i) =>
            renderItem(it, shown.length + i, <span style={foldedBadge}>{foldedBadgeLabel}</span>),
          )}
        </ul>
      )}
    </div>
  )
}

function renderItem(it: FeedItem, i: number, badge: ReactNode) {
  const pick = isPickPlaceholder(i)
  const sub = snippet(it)
  return (
    <li key={it.id}>
      <Link to={`/item/${it.id}`} style={cardStyle(pick)} className="rd-card">
        {/* 右侧大号编号水印 */}
        <span aria-hidden style={numWatermark}>
          <span style={{ color: '#E4E8F0', fontWeight: 800 }}>&gt;&gt;&gt;</span>
          <span style={{ color: pick ? 'rgba(55,120,229,0.10)' : '#EDEFF4', fontWeight: 800 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
        </span>

        {/* 左竖条 */}
        <span style={{ width: 4, alignSelf: 'stretch', minHeight: 36, background: BLUE, borderRadius: 3, flex: 'none' }} />

        <div style={{ minWidth: 0, flex: 1, paddingRight: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {badge}
            {pick && (
              <span style={pickBadge}>
                <Sparkles size={11} />
                精选·示例
              </span>
            )}
            <h3 style={titleStyle}>{it.title}</h3>
          </div>

          {sub && <p style={subStyle}>{sub}</p>}

          <div style={metaRow}>
            <span>{it.source_name}</span>
            <span style={{ color: '#D2D7E0' }}>·</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{hm(it.published_at)}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function cardStyle(pick: boolean): CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    gap: 12,
    padding: '11px 18px',
    background: '#fff',
    border: `1px solid ${pick ? 'rgba(55,120,229,0.22)' : '#ECEEF3'}`,
    borderRadius: 12,
    boxShadow: '0 1px 2px rgba(22,33,62,0.04)',
    textDecoration: 'none',
    color: 'inherit',
    overflow: 'hidden',
  }
}

const numWatermark: CSSProperties = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 4,
  fontSize: 34,
  letterSpacing: '0.02em',
  lineHeight: 1,
  userSelect: 'none',
  pointerEvents: 'none',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: INK,
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const subStyle: CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12.5,
  color: '#8A92A0',
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const metaRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  marginTop: 6,
  fontSize: 12,
  color: '#AEB4BC',
}

const pickBadge: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  fontSize: 10.5,
  fontWeight: 600,
  color: BLUE,
  background: 'rgba(55,120,229,0.1)',
  padding: '2px 6px',
  borderRadius: 5,
  flex: 'none',
}

const foldedBadge: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10.5,
  fontWeight: 700,
  color: 'var(--text-dim)',
  background: 'var(--panel-2)',
  border: '1px solid var(--border)',
  padding: '2px 6px',
  borderRadius: 5,
  flex: 'none',
}

const foldToggle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px dashed var(--border-strong)',
  background: 'var(--panel-2)',
  color: 'var(--text-dim)',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
}
