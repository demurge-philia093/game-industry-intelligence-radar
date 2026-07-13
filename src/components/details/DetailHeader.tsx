import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import type { FeedItem } from '../../types/envelope'
import { Cover } from '../common/Cover'
import { SourceBadge } from '../common/ui'
import { formatDate } from '../../lib/format'
import { HOME_DEFAULT_URL } from '../../lib/homeViews'
import { getHttpUrl } from '../../lib/url'

const BLUE = '#3778E5'
const INK = '#16213E'

/** 各信源详情页共享的头部：返回、封面、信源徽章、标题、信源名/时间、原链接、类型专属 extra。 */
export function DetailHeader({
  item,
  extra,
}: {
  item: FeedItem
  extra?: ReactNode
}) {
  const navigate = useNavigate()
  const loc = useLocation()
  const originalUrl = getHttpUrl(item.original_url)
  // 返回上一视图（带 ?view= 的列表态）；若是直接打开详情（无来路），兜底回主舞台默认 tab。
  const onBack = () =>
    loc.key === 'default' ? navigate(HOME_DEFAULT_URL) : navigate(-1)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}
      >
        <ChevronLeft size={16} />
        返回面板
      </button>

      <div className="mt-4 flex gap-4">
        <Cover
          item={item}
          className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20"
          iconSize={30}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-dim)]">
            <SourceBadge type={item.source_type} />
            <span className="font-medium">{item.source_name}</span>
            <span className="text-[var(--text-faint)]">·</span>
            <span>{formatDate(item.published_at)}</span>
          </div>
          <h1
            className="mt-2 text-2xl leading-[1.15] tracking-tight sm:text-[2rem]"
            style={{ fontWeight: 800, color: INK }}
          >
            {item.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-dim)]">
            {extra}
            {originalUrl ? (
              <a
                href={originalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ color: BLUE }}
              >
                <ExternalLink size={13} />
                原始链接
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
