/*
 * 信源类型的展示元数据（纯数据，无组件依赖，避免与注册表循环引用）。
 * Card / Detail 组件需要强调色或图标时从这里取。
 */

import {
  Mic,
  Newspaper,
  MessageSquare,
  Stamp,
  Building2,
  Tag,
  Briefcase,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'

export interface SourceMeta {
  label: string
  icon: LucideIcon
  /** CSS 颜色（引用 index.css 里定义的 --accent-<type>） */
  accent: string
}

export const SOURCE_META: Record<string, SourceMeta> = {
  podcast: { label: '播客', icon: Mic, accent: 'var(--accent-podcast)' },
  news: { label: '新闻', icon: Newspaper, accent: 'var(--accent-news)' },
  wechat: { label: '公众号', icon: MessageSquare, accent: 'var(--accent-wechat)' },
  banhao: { label: '版号', icon: Stamp, accent: 'var(--accent-banhao)' },
  // 商业实体大类的 4 个 source_type（IconDial 一级=「商业实体」，二级按这些 source_type 分）
  entity: { label: '工商档案', icon: Building2, accent: 'var(--accent-entity)' },
  trademark: { label: '商标', icon: Tag, accent: 'var(--accent-trademark)' },
  recruitment: { label: '招聘', icon: Briefcase, accent: 'var(--accent-recruitment)' },
  entity_change: { label: '变更', icon: RefreshCw, accent: 'var(--accent-entity)' },
}

/** 取某信源的元数据；未知类型回退到中性灰，保证不崩。 */
export function sourceMeta(type: string): SourceMeta {
  return (
    SOURCE_META[type] ?? {
      label: type,
      icon: Newspaper,
      accent: 'var(--text-dim)',
    }
  )
}
