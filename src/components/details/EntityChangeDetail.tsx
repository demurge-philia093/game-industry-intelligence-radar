import type { FeedItem } from '../../types/envelope'
import type { EntityChangePayload } from '../../types/payloads'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'
import { KvPanel } from './KvPanel'

const ACCENT = 'var(--accent-entity)'

const fmt = (s?: string) => (s ? s.slice(0, 19).replace('T', ' ') : '')

/** 工商变更（entity_change）详情：意图层信号（新设子公司 / 经营范围 / 注册资本等变更）。 */
export function EntityChangeDetail({ item }: { item: FeedItem }) {
  const p = item.payload as EntityChangePayload
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="font-medium" style={{ color: ACCENT }}>
            {p.change_item || '工商变更'}
          </span>
        }
      />
      {item.deep_summary && <DeepSummary markdown={item.deep_summary} />}
      <KvPanel
        accent={ACCENT}
        rows={[
          ['主体信用代码', p.entity_credit_code],
          ['变更事项', p.change_item],
          ['变更日期', p.change_date],
          ['变更前', p.before],
          ['变更后', p.after],
          ['所属战略体', p.group_key],
          ['探测时刻', fmt(p.detected_at)],
        ]}
      />
    </div>
  )
}
