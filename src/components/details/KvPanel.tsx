import type { ReactNode } from 'react'
import { Panel } from '../common/ui'

/**
 * 通用「字段:值」面板（商业实体各 Detail 共用）。
 * 空值行自动隐藏——忠实：抓不到的字段不展示，不编造占位。
 */
export function KvPanel({ accent, rows }: { accent: string; rows: [string, ReactNode][] }) {
  const shown = rows.filter(([, v]) => v != null && v !== '')
  if (shown.length === 0) return null
  return (
    <Panel className="p-5 sm:p-6">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
        {shown.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <dt className="text-xs text-[var(--text-faint)]">{k}</dt>
            <dd
              className="break-words text-sm text-[var(--text-h)]"
              style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 8 }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
