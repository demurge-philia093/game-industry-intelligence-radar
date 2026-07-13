import { useState, type ReactNode, type CSSProperties } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ExternalLink, ChevronDown } from 'lucide-react'
import type { FeedItem } from '../../types/envelope'
import { Cover } from '../common/Cover'
import { SourceBadge } from '../common/ui'
import { formatDate } from '../../lib/format'
import { HOME_DEFAULT_URL } from '../../lib/homeViews'
import { getHttpUrl } from '../../lib/url'

const BLUE = '#3778E5'
const INK = '#16213E'

/**
 * 文章阅读器（news / wechat 详情）：参考 mihoyo.com about 页——锁定一屏，
 * 固定装饰框（左竖排 slogan、右巨型竖排水印、顶栏），**只有中间正文区内部滚动**，
 * 整页不变；入场平滑淡入上移。详情只展示抓取的正文，不放总结（总结在列表卡）。
 * 播客/版号不走此壳（它们非正文型、且依赖文档滚动的 sticky）。
 */
export function ArticleReader({
  item,
  extra,
  action,
  children,
}: {
  item: FeedItem
  extra?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  const navigate = useNavigate()
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const onBack = () => (loc.key === 'default' ? navigate(HOME_DEFAULT_URL) : navigate(-1))
  const watermark = (item.source_type || 'RADAR').toUpperCase()
  const originalUrl = getHttpUrl(item.original_url)

  return (
    <div style={shell}>
      {/* 左竖排 slogan + 蓝竖条 */}
      <div aria-hidden style={leftSlogan}>
        <span style={{ width: 4, height: 36, background: BLUE, borderRadius: 2, marginBottom: 14 }} />
        TECH OTAKUS SAVE THE WORLD
      </div>
      {/* 右巨型竖排水印（随信源类型） */}
      <div aria-hidden style={rightMark}>{watermark}</div>

      {/* 固定顶栏：返回 + 战略雷达 */}
      <nav style={bar}>
        <button type="button" onClick={onBack} style={backBtn}>
          <ChevronLeft size={16} />
          返回面板
        </button>
        <Link to={HOME_DEFAULT_URL} style={brand}>
          <span style={{ width: 5, height: 20, background: BLUE, borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '0.02em' }}>战略雷达</span>
        </Link>
        {action ? <div style={{ marginLeft: 'auto' }}>{action}</div> : null}
        <span style={{ marginLeft: action ? 16 : 'auto', fontSize: 12, color: '#999', letterSpacing: '0.1em' }}>
          <span style={{ color: INK, fontWeight: 600 }}>CH</span> / EN
        </span>
      </nav>

      {/* 仅此区内部滚动 */}
      <main
        className="src-scroll"
        style={scrollArea}
        onScroll={(e) => setScrolled((e.currentTarget as HTMLElement).scrollTop > 16)}
      >
        <article className="reader-enter" style={articleStyle}>
          {/* 文章头 */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Cover item={item} className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" iconSize={30} />
            <div style={{ minWidth: 0 }}>
              <div className="flex flex-wrap items-center gap-2" style={{ fontSize: 12, color: '#8A92A0' }}>
                <SourceBadge type={item.source_type} />
                <span style={{ fontWeight: 500 }}>{item.source_name}</span>
                <span style={{ color: '#C4CAD4' }}>·</span>
                <span>{formatDate(item.published_at)}</span>
              </div>
              <h1 style={titleStyle}>{item.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1" style={{ fontSize: 12, color: '#8A92A0' }}>
                {extra}
                {originalUrl ? (
                  <a
                    href={originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: BLUE, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <ExternalLink size={13} />
                    原始链接
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* 正文（只展示抓取的正文） */}
          <div style={{ marginTop: 24 }}>{children}</div>
        </article>
      </main>

      {/* 滚动提示（滚动后淡出） */}
      <div aria-hidden style={{ ...scrollHint, opacity: scrolled ? 0 : 0.55 }}>
        <ChevronDown size={18} />
      </div>
    </div>
  )
}

const shell: CSSProperties = {
  position: 'relative',
  height: '100dvh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  backgroundImage: 'radial-gradient(#E8E8EE 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const leftSlogan: CSSProperties = {
  position: 'absolute',
  left: 16,
  bottom: 90,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  writingMode: 'vertical-rl',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.34em',
  color: '#C4CAD4',
  userSelect: 'none',
  zIndex: 0,
}

const rightMark: CSSProperties = {
  position: 'absolute',
  right: '-0.5vw',
  top: '12%',
  writingMode: 'vertical-rl',
  fontSize: 'clamp(56px, 10vw, 170px)',
  fontWeight: 800,
  letterSpacing: '0.05em',
  color: '#F1F2F6',
  userSelect: 'none',
  pointerEvents: 'none',
  zIndex: 0,
}

const bar: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  padding: '14px 40px',
  maxWidth: 1240,
  width: '100%',
  margin: '0 auto',
}

const backBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: 14,
  color: '#6B7280',
}

const brand: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  textDecoration: 'none',
}

const scrollArea: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  padding: '6px 40px 0',
  width: '100%',
}

const articleStyle: CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '6px 0 72px',
}

const titleStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 'clamp(23px, 2.4vw, 34px)',
  fontWeight: 800,
  color: INK,
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
}

const scrollHint: CSSProperties = {
  position: 'absolute',
  right: 26,
  bottom: 22,
  zIndex: 2,
  color: '#9FB4DA',
  transition: 'opacity .3s ease',
  pointerEvents: 'none',
}
