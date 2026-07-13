import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { FeedItem } from '../../types/envelope'
import type { BanhaoGame, BanhaoPayload } from '../../types/payloads'
import { tint } from '../../lib/color'
import { Panel } from '../common/ui'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'

const ACCENT = 'var(--accent-banhao)'
const NONE = '__none__' // 未识别集团的筛选值

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
      style={{
        color: active ? '#ffffff' : ACCENT,
        background: active ? ACCENT : tint(ACCENT, 10),
        borderColor: active ? ACCENT : tint(ACCENT, 30),
      }}
    >
      {label}
      {count != null && <span className={active ? 'opacity-80' : 'opacity-60'}>{count}</span>}
    </button>
  )
}

export function BanhaoDetail({ item }: { item: FeedItem }) {
  const p = item.payload as BanhaoPayload
  const isChange = p.approval_type.includes('变更')
  const [group, setGroup] = useState('') // '' = 全部
  const [q, setQ] = useState('')

  const games = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return p.games.filter((g: BanhaoGame) => {
      if (group === NONE && g.company_group) return false
      if (group && group !== NONE && g.company_group !== group) return false
      if (qq) {
        const hay = `${g.game_name}\n${g.operator}\n${g.publisher}\n${g.approval_doc}`.toLowerCase()
        if (!hay.includes(qq)) return false
      }
      return true
    })
  }, [p.games, group, q])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="font-medium" style={{ color: ACCENT }}>
            {p.approval_type} · 共 {p.total} 款
          </span>
        }
      />

      <DeepSummary markdown={item.deep_summary} />

      <Panel className="p-5 sm:p-6">
        {/* 按集团筛选 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip label="全部" count={p.total} active={group === ''} onClick={() => setGroup('')} />
          {p.by_company.map((c) => (
            <Chip
              key={c.group}
              label={c.group}
              count={c.count}
              active={group === c.group}
              onClick={() => setGroup(c.group)}
            />
          ))}
          <Chip label="未识别" active={group === NONE} onClick={() => setGroup(NONE)} />
        </div>

        {/* 文本搜索 */}
        <div className="relative mb-4">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜游戏名 / 运营单位 / 出版单位 / 文号…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-2)] py-2 pl-9 pr-3 text-sm text-[var(--text-h)] outline-none focus:border-[var(--signal)]"
          />
        </div>

        <div className="mb-2 text-xs text-[var(--text-dim)]">
          显示 {games.length} / {p.total} 款
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-faint)]">
                <th className="py-2 pr-3 font-medium">名称</th>
                <th className="py-2 pr-3 font-medium">申报类别</th>
                <th className="py-2 pr-3 font-medium">运营单位</th>
                <th className="py-2 pr-3 font-medium">{isChange ? '变更信息' : '出版单位'}</th>
                <th className="py-2 pr-3 font-medium">批复文号</th>
                <th className="py-2 font-medium">审批时间</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g, i) => (
                <tr
                  key={g.approval_doc + i}
                  className="border-t border-[var(--border)] align-top"
                >
                  <td className="py-2.5 pr-3 font-medium text-[var(--text-h)]">{g.game_name}</td>
                  <td className="py-2.5 pr-3 text-[var(--text-dim)]">{g.category_declared || '—'}</td>
                  <td className="py-2.5 pr-3">
                    <span className="text-[var(--text)]">{g.operator}</span>
                    {g.company_group && (
                      <span
                        className="ml-1.5 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium"
                        style={{
                          color: ACCENT,
                          background: tint(ACCENT, 14),
                          border: `1px solid ${tint(ACCENT, 32)}`,
                        }}
                      >
                        {g.company_group}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--text-dim)]">
                    {isChange ? g.change_info || '—' : g.publisher}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-[var(--text-dim)]">
                    {g.approval_doc}
                  </td>
                  <td className="py-2.5 font-mono text-xs text-[var(--text-dim)]">
                    {g.approval_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {games.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--text-dim)]">无匹配记录</div>
          )}
        </div>
      </Panel>
    </div>
  )
}
