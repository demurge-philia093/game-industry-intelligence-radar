import type { FeedItem } from '../../types/envelope'
import type { RecruitmentPayload } from '../../types/payloads'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'
import { KvPanel } from './KvPanel'

const ACCENT = 'var(--accent-recruitment)'

const fmt = (s?: string) => (s ? s.slice(0, 19).replace('T', ' ') : '')

/** 招聘（recruitment）详情：天眼查快照，双时间标注、非实时。 */
export function RecruitmentDetail({ item }: { item: FeedItem }) {
  const p = item.payload as RecruitmentPayload
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="font-medium" style={{ color: ACCENT }}>
            {p.salary || '招聘'}
          </span>
        }
      />
      {item.deep_summary && <DeepSummary markdown={item.deep_summary} />}
      <KvPanel
        accent={ACCENT}
        rows={[
          ['招聘主体', p.company],
          ['职位', p.position_title],
          ['来源', p.origin],
          ['学历', p.education],
          ['经验', p.experience],
          ['薪资', p.salary],
          ['发布日期（天眼查·偏旧）', p.publish_date],
          ['快照采集时刻', fmt(p.snapshot_fetched_at)],
          ['所属战略体', p.group_key],
        ]}
      />
      <p className="text-xs text-[var(--text-faint)]">
        ⚠ 招聘数据为天眼查历史快照，「发布日期」非实时；以「快照采集时刻」为本系统入库基准。
      </p>
    </div>
  )
}
