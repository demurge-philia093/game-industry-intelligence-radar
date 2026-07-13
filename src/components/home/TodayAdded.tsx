import type { CSSProperties } from 'react'
import type { FeedItem } from '../../types/envelope'
import type { TodayAddedSummary } from '../../lib/todayAdded'
import { TODAY_ADDED_VIEW } from '../../lib/homeViews'
import { SourceFeed } from './SourceFeed'

export interface TodayAddedRenderGroup {
  key: string
  label: string
  count: number
  items: FeedItem[]
  folded?: { items: FeedItem[]; open: boolean; onToggle: () => void }
}

export function TodayAdded({
  summary,
  groups,
}: {
  summary: TodayAddedSummary
  groups: TodayAddedRenderGroup[]
}) {
  const emptyText = summary.emptyLabels.length > 0 ? summary.emptyLabels.join('、') : '无'
  const displayTotal = summary.total + summary.backfillTotal
  const overviewSegments = [`${TODAY_ADDED_VIEW} ${displayTotal} 条`]
  if (summary.latestIngestedDate) overviewSegments.push(`数据批次 ${summary.latestIngestedDate}`)
  if (summary.backfillTotal > 0) overviewSegments.push(`含历史回填 ${summary.backfillTotal} 条`)
  overviewSegments.push(`本批无条目：${emptyText}`)
  const latestText = summary.latestIngestedDate
    ? `数据批次：${summary.latestIngestedDate} · 入库 ${summary.latestIngestedCount} 条`
    : '暂无有效演示批次'
  const isEmpty = displayTotal === 0

  return (
    <div style={panel}>
      <div style={overview}>
        {overviewSegments.join(' · ')}
      </div>

      {isEmpty ? (
        <div style={emptyState}>
          <p style={emptyTitle}>暂无可展示的演示数据</p>
          <p style={emptyMeta}>{latestText}</p>
        </div>
      ) : (
        <div className="src-scroll" style={groupsList}>
          {groups.map((group) => (
            <section key={group.key} style={groupBlock}>
              <SourceFeed
                label={`${group.label} ${group.items.length + (group.folded?.items.length ?? 0)} 条`}
                items={group.items}
                folded={
                  group.folded
                    ? {
                        ...group.folded,
                        label: '条补充条目',
                        badgeLabel: '补充',
                      }
                    : undefined
                }
                hideRecencyBadge
              />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
}

const overview: CSSProperties = {
  flex: 'none',
  paddingBottom: 10,
  borderBottom: '1px solid var(--border)',
  color: 'var(--text-dim)',
  fontSize: 13,
  fontWeight: 700,
}

const groupsList: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  marginTop: 12,
  paddingRight: 8,
  paddingBottom: 8,
}

const groupBlock: CSSProperties = {
  flex: '0 0 auto',
  height: 'min(34vh, 340px)',
  minHeight: 250,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 14,
  borderTop: '1px solid var(--border)',
}

const emptyState: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
}

const emptyTitle: CSSProperties = {
  margin: 0,
  color: 'var(--text-h)',
  fontSize: 20,
  fontWeight: 800,
}

const emptyMeta: CSSProperties = {
  margin: '8px 0 0',
  color: 'var(--text-dim)',
  fontSize: 13,
}
