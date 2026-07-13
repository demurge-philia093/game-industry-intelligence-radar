import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFeedItem } from '../hooks/useFeedItem'
import { EmptyState } from '../components/common/EmptyState'
import { getRenderer } from '../registry/registry'
import { HOME_DEFAULT_URL } from '../lib/homeViews'

const BLUE = '#3778E5'
const INK = '#16213E'

/** 战略雷达顶栏：与主舞台同一视觉语言（蓝竖条 + 雷达标）。详情页与主舞台一致。 */
function RadarBar() {
  return (
    <nav className="radar-detail-nav" style={barStyle}>
      <Link to={HOME_DEFAULT_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span style={{ width: 5, height: 22, background: BLUE, borderRadius: 2 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '0.02em' }}>战略雷达</span>
      </Link>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: '#8B95A5', fontSize: 11, letterSpacing: '0.08em' }}>PUBLIC SNAPSHOT · 只读</span>
        <span style={{ fontSize: 12, color: '#999', letterSpacing: '0.1em' }}>
          <span style={{ color: INK, fontWeight: 600 }}>CH</span> / EN
        </span>
      </span>
    </nav>
  )
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { item, loading, error } = useFeedItem(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const renderer = item ? getRenderer(item.source_type) : undefined

  // news / wechat 走米哈游式「文章阅读器」（自带全屏锁定壳 + 正文内部滚动），不套 DocShell。
  // 播客/版号保留文档滚动壳（它们依赖 sticky top-68 等，不改避免回归）。
  const isArticle = !!item && (item.source_type === 'news' || item.source_type === 'wechat')
  if (!loading && item && renderer && isArticle) {
    // key=item.id：切换条目时重新挂载，确保阅读器滚动状态不会跨条目串留。
    return <renderer.Detail key={item.id} item={item} />
  }

  return (
    <div style={shellStyle}>
      <RadarBar />
      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6" style={{ position: 'relative', zIndex: 1 }}>
        {loading && (
          <div className="py-20 text-center text-[var(--text-dim)]">加载中…</div>
        )}

        {!loading && error && (
          <EmptyState title="详情加载失败" hint={error} />
        )}

        {!loading && !error && !item && (
          <div className="flex flex-col items-center">
            <EmptyState title="找不到这条情报" hint={`id: ${id}`} />
            <Link
              to={HOME_DEFAULT_URL}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: '#E2E6EE', color: '#6B7280' }}
            >
              返回面板
            </Link>
          </div>
        )}

        {!loading && item && !renderer && (
          <div className="text-[var(--text-dim)]">
            未登记的信源类型：{item.source_type}
          </div>
        )}

        {item && renderer && <renderer.Detail key={item.id} item={item} />}
      </main>
    </div>
  )
}

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  backgroundImage: 'radial-gradient(#E8E8EE 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const barStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  padding: '18px 40px',
  maxWidth: 1240,
  margin: '0 auto',
  background: 'color-mix(in srgb, #fff 88%, transparent)',
  backdropFilter: 'blur(8px)',
}
