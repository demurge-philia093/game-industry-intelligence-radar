/*
 * 首页「今日要点 / 信源今日清单」的数据层。
 *
 * ⚠ 真实「命中 / 精选 / 价值排序」推送算法尚不存在（需战略体 / 关注逻辑产出）。
 *   本文件按设计指令 §4 用 **mock + 简单规则** 占位，并显式标注「(示例)」，
 *   绝不让占位冒充真实命中。约定 DailyPick 形状，待真实算法接入时替换本文件即可。
 */
import type { FeedItem } from '../types/envelope'

export interface DailyPick {
  id: string
  title: string
  source_type: string
  source_name: string
  /** 命中理由——本期为占位，恒以「(示例)」开头。真实算法接入后替换。 */
  hit_reason: string
  /** 价值排序——本期占位（按时间近似）。 */
  value_rank: number
  original_url: string
  published_at: string
}

// 占位关键词池（仅用于示例命中理由，非真实关注词）
const SAMPLE_KEYWORDS = ['AI 原生', '范式迁移', '世界模型', 'Steam', '买断制', '出海', 'UE5', '裁员']

function ts(s: string): number {
  const t = new Date(s).getTime()
  return Number.isNaN(t) ? 0 : t
}
const byRecency = (a: FeedItem, b: FeedItem) => ts(b.published_at) - ts(a.published_at)

/** 「今日」窗口：取 feed 最新日期往前 ~48h（保证有内容；真实算法接入后改为关注命中）。 */
function recentCutoff(items: FeedItem[]): number {
  const max = Math.max(0, ...items.map((i) => ts(i.published_at)))
  return max - 48 * 3600_000
}

function inWindow(item: FeedItem, cutoff: number): boolean {
  return ts(item.published_at) >= cutoff
}

export interface Digest {
  focus: DailyPick | null
  rest: DailyPick[]
  count: number
  date: string
}

/** 汇总态：今日要点 = 焦点(最高价值，占位取最新新闻) + 其余命中。 */
export function todayDigest(items: FeedItem[]): Digest {
  if (!items.length) return { focus: null, rest: [], count: 0, date: '' }
  const cutoff = recentCutoff(items)
  const today = items.filter((i) => inWindow(i, cutoff)).sort(byRecency)
  const toPick = (it: FeedItem, i: number): DailyPick => ({
    id: it.id,
    title: it.title,
    source_type: it.source_type,
    source_name: it.source_name,
    hit_reason: `(示例) 命中你关注的「${SAMPLE_KEYWORDS[i % SAMPLE_KEYWORDS.length]}」`,
    value_rank: i,
    original_url: it.original_url,
    published_at: it.published_at,
  })
  // 焦点占位：优先最新一条新闻（标题更适合做英雄区），否则最新一条
  const focusItem = today.find((t) => t.source_type === 'news') ?? today[0]
  const rest = today.filter((t) => t.id !== focusItem?.id).slice(0, 12)
  return {
    focus: focusItem ? toPick(focusItem, 0) : null,
    rest: rest.map((it, i) => toPick(it, i + 1)),
    count: today.length,
    date: today[0]?.published_at.slice(0, 10) ?? '',
  }
}

/** 某信源今日清单：该 source_type 且在今日窗口内的条目（按时间倒序）。汇总态仍用。 */
export function sourceToday(items: FeedItem[], type: string): FeedItem[] {
  const cutoff = recentCutoff(items)
  return items.filter((i) => i.source_type === type && inWindow(i, cutoff)).sort(byRecency)
}

/** 某信源「最近」清单：该 source_type 全部按时间倒序，**不受 48h 今日窗口限制**。
 *  —— 点信源 tab 是要"浏览这个源"，sparse 信源（如播客一月几条）不应因不在今日窗口而空白。
 *  渲染量由 SourceFeed 截断，这里返回全量（已排序）。 */
export function sourceRecent(items: FeedItem[], type: string): FeedItem[] {
  return items.filter((i) => i.source_type === type).sort(byRecency)
}

/** 大类「商业实体」聚合清单：组内多个 source_type 的并集，按时间倒序。
 *  —— 多 source_type 大类（MODULE_GROUPS）的「全部」二级用它。 */
export function sourceGroup(items: FeedItem[], types: string[]): FeedItem[] {
  return items.filter((i) => types.includes(i.source_type)).sort(byRecency)
}

/** 大模型精选标记——本期占位（每 4 条标 1 条），真实精选由战略体产出。 */
export function isPickPlaceholder(index: number): boolean {
  return index % 4 === 0
}

/* ---------------- 信源标签（扁平、按最近活跃排序） ---------------- */
export interface SourceTab {
  name: string
  type: string
  count: number
}

/** 列出 feed 里全部不同信源（按各源最新一条的时间倒序，活跃源在前）。供顶部源标签条用。 */
export function listSources(items: FeedItem[]): SourceTab[] {
  const m = new Map<string, { type: string; count: number; latest: number }>()
  for (const it of items) {
    const k = it.source_name || it.source_type
    const cur = m.get(k) ?? { type: it.source_type, count: 0, latest: 0 }
    cur.count += 1
    cur.latest = Math.max(cur.latest, ts(it.published_at))
    m.set(k, cur)
  }
  return [...m.entries()]
    .sort((a, b) => b[1].latest - a[1].latest)
    .map(([name, v]) => ({ name, type: v.type, count: v.count }))
}

/** 某信源（按 source_name）的清单，按时间倒序。点源标签后展示。 */
export function sourceByName(items: FeedItem[], name: string): FeedItem[] {
  return items.filter((i) => (i.source_name || i.source_type) === name).sort(byRecency)
}

/** 某大类（source_type）下的各信源（二级标签用），按最近活跃排序。 */
export function listSourcesOfType(items: FeedItem[], type: string): SourceTab[] {
  return listSources(items.filter((i) => i.source_type === type))
}
