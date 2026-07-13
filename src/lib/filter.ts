/*
 * 跨信源筛选。只依赖通用 envelope 字段，因此对任何信源类型都生效。
 */

import type { FeedItem } from '../types/envelope'

export type TimeRange = 'all' | '7d' | '30d' | '90d'

export interface Filters {
  query: string
  /** 选中的信源类型；空集合 = 全部 */
  types: Set<string>
  range: TimeRange
  /** 选中的标签；空集合 = 不限 */
  tags: Set<string>
  /** 选中的实体（公司 / 作品名）；空集合 = 不限 */
  entities: Set<string>
}

export const emptyFilters = (): Filters => ({
  query: '',
  types: new Set(),
  range: 'all',
  tags: new Set(),
  entities: new Set(),
})

export const RANGE_LABELS: Record<TimeRange, string> = {
  all: '全部时间',
  '7d': '近 7 天',
  '30d': '近 30 天',
  '90d': '近 90 天',
}

const RANGE_DAYS: Record<TimeRange, number | null> = {
  all: null,
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

function itemEntities(item: FeedItem): string[] {
  return [...item.entities.companies, ...item.entities.works]
}

function searchHaystack(item: FeedItem): string {
  return [
    item.title,
    item.source_name,
    item.deep_summary,
    ...item.tags,
    ...itemEntities(item),
  ]
    .join('\n')
    .toLowerCase()
}

/** 单个条目是否通过全部筛选条件（各 facet 之间是 AND，facet 内部是 OR）。 */
export function matchesFilters(
  item: FeedItem,
  f: Filters,
  now: number = Date.now(),
): boolean {
  if (f.types.size > 0 && !f.types.has(item.source_type)) return false

  const days = RANGE_DAYS[f.range]
  if (days != null) {
    const t = new Date(item.published_at).getTime()
    if (Number.isNaN(t) || now - t > days * 86_400_000) return false
  }

  if (f.query.trim()) {
    const q = f.query.trim().toLowerCase()
    if (!searchHaystack(item).includes(q)) return false
  }

  if (f.tags.size > 0 && !item.tags.some((t) => f.tags.has(t))) return false

  if (f.entities.size > 0 && !itemEntities(item).some((e) => f.entities.has(e)))
    return false

  return true
}

/** 收集所有标签及其条目数（按出现频次降序）。 */
export function collectTags(items: FeedItem[]): { label: string; count: number }[] {
  return collectCounts(items.flatMap((i) => i.tags))
}

/** 收集所有实体（公司 + 作品）及其条目数。 */
export function collectEntities(
  items: FeedItem[],
): { label: string; kind: 'company' | 'work'; count: number }[] {
  const counts = new Map<string, { kind: 'company' | 'work'; count: number }>()
  for (const item of items) {
    for (const c of item.entities.companies) bump(counts, c, 'company')
    for (const w of item.entities.works) bump(counts, w, 'work')
  }
  return [...counts.entries()]
    .map(([label, v]) => ({ label, kind: v.kind, count: v.count }))
    .sort((a, b) => b.count - a.count)
}

function bump(
  m: Map<string, { kind: 'company' | 'work'; count: number }>,
  label: string,
  kind: 'company' | 'work',
) {
  const cur = m.get(label)
  if (cur) cur.count += 1
  else m.set(label, { kind, count: 1 })
}

function collectCounts(values: string[]): { label: string; count: number }[] {
  const m = new Map<string, number>()
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1)
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export function countActive(f: Filters): number {
  return (
    f.types.size +
    f.tags.size +
    f.entities.size +
    (f.range !== 'all' ? 1 : 0) +
    (f.query.trim() ? 1 : 0)
  )
}
