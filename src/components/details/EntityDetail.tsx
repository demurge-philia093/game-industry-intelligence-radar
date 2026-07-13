import type { FeedItem } from '../../types/envelope'
import type { EntityPayload } from '../../types/payloads'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'
import { KvPanel } from './KvPanel'

const ACCENT = 'var(--accent-entity)'

/** 工商主体（entity）详情：工商登记字段 + 股东/对外投资/分支（如有）。 */
export function EntityDetail({ item }: { item: FeedItem }) {
  const p = item.payload as EntityPayload
  const hasRel = !!(p.shareholders?.length || p.investments?.length || p.branches?.length)
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="font-medium" style={{ color: ACCENT }}>
            {p.company_type || '企业主体'}
            {p.status ? ` · ${p.status}` : ''}
          </span>
        }
      />
      {item.deep_summary && <DeepSummary markdown={item.deep_summary} />}
      <KvPanel
        accent={ACCENT}
        rows={[
          ['统一社会信用代码', p.credit_code],
          ['法定代表人', p.legal_rep],
          ['注册资本', p.reg_capital],
          ['实缴资本', p.paid_capital],
          ['成立日期', p.establish_date],
          ['登记状态', p.status],
          ['企业类型', p.company_type],
          ['所属战略体', p.group_key],
          ['上级主体', p.parent || (p.overseas_curated ? '（海外占位）' : '（根 / 未挂）')],
          ['管辖', p.jurisdiction],
          ['注册地址', p.address],
          ['经营范围', p.business_scope],
        ]}
      />
      {hasRel && (
        <KvPanel
          accent={ACCENT}
          rows={[
            ['股东', p.shareholders?.map((s) => `${s.name}${s.ratio ? ` ${s.ratio}` : ''}`).join('、') || ''],
            ['对外投资', p.investments?.map((i) => i.name).join('、') || ''],
            ['分支机构', p.branches?.map((b) => b.name).join('、') || ''],
          ]}
        />
      )}
    </div>
  )
}
