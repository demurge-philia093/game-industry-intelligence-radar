import {
  Layers,
  Mic,
  Newspaper,
  MessageSquare,
  Stamp,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { HOME_CONTENT_GROUPS, SOURCE_LABEL, TODAY_ADDED_VIEW } from '../../lib/homeViews'

const BLUE = '#3778E5'
const INK = '#16213E'
const GRAY = '#AEB4BC'

interface DialItem {
  key: string
  label: string
  icon: LucideIcon
  disabled?: boolean
}

const ICON_BY_KEY: Record<string, LucideIcon> = {
  podcast: Mic,
  news: Newspaper,
  wechat: MessageSquare,
  banhao: Stamp,
  [SOURCE_LABEL.商业实体]: Building2,
}

const ITEMS: DialItem[] = [
  { key: TODAY_ADDED_VIEW, label: TODAY_ADDED_VIEW, icon: Layers },
  ...HOME_CONTENT_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    icon: ICON_BY_KEY[group.key],
  })),
]

/** 底部圆形图标盘（一级·大类）：默认 tab + 各信源类型 + 商业实体（含工商/商标/招聘/变更二级）。 */
export function IconDial({
  active,
  onSelect,
  counts,
}: {
  active: string
  onSelect: (k: string) => void
  counts: Record<string, number>
}) {
  return (
    <div className="radar-icon-dial" style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {ITEMS.map((it) => {
        const on = active === it.key
        const Icon = it.icon
        const n = counts[it.key] ?? 0
        return (
          <button
            key={it.key}
            type="button"
            disabled={it.disabled}
            onClick={() => !it.disabled && onSelect(it.key)}
            title={it.disabled ? `${it.label}（待数据接入）` : it.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: it.disabled ? 'default' : 'pointer',
            }}
          >
            <span
              style={{
                position: 'relative',
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: on ? BLUE : '#fff',
                border: `1px solid ${on ? BLUE : '#E2E6EE'}`,
                color: on ? '#fff' : it.disabled ? GRAY : INK,
                boxShadow: on
                  ? '0 8px 20px -6px rgba(55,120,229,0.55)'
                  : '0 2px 8px -4px rgba(22,33,62,0.15)',
                transition: 'background .2s, box-shadow .2s, transform .2s',
                transform: on ? 'translateY(-2px)' : 'none',
              }}
            >
              <Icon size={18} />
              {!it.disabled && n > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    minWidth: 15,
                    height: 15,
                    padding: '0 4px',
                    borderRadius: 999,
                    background: on ? '#fff' : BLUE,
                    color: on ? BLUE : '#fff',
                    fontSize: 9,
                    fontWeight: 600,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1.5px solid #fff',
                  }}
                >
                  {n > 99 ? '99+' : n}
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: on ? 600 : 400,
                color: on ? BLUE : it.disabled ? GRAY : '#666',
                whiteSpace: 'nowrap',
              }}
            >
              {it.label}
              {it.disabled && <span style={{ fontSize: 9, opacity: 0.8 }}> ·待接入</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
