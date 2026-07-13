import type { FeedItem } from '../../types/envelope'
import type { TrademarkPayload } from '../../types/payloads'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'
import { KvPanel } from './KvPanel'

const ACCENT = 'var(--accent-trademark)'

/** 商标（trademark）详情：一商标一条，按注册号锚定。 */
export function TrademarkDetail({ item }: { item: FeedItem }) {
  const p = item.payload as TrademarkPayload
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="font-medium" style={{ color: ACCENT }}>
            {p.status || '商标'}
            {p.int_cls ? ` · ${p.int_cls}` : ''}
          </span>
        }
      />
      {item.deep_summary && <DeepSummary markdown={item.deep_summary} />}
      <KvPanel
        accent={ACCENT}
        rows={[
          ['注册号', p.reg_no],
          ['申请人', p.applicant],
          ['国际分类', p.int_cls],
          ['类别号 tmClass', p.tm_class],
          ['商标状态', p.status],
          ['申请日期', p.app_date],
          ['最近事件', p.latest_event],
          ['事件时间', p.latest_event_date],
          ['所属战略体', p.group_key],
        ]}
      />
    </div>
  )
}
