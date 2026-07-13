import type { FeedItem } from '../types/envelope'
import { HOME_CONTENT_GROUPS } from './homeViews'

const SHANGHAI_TIME_ZONE = 'Asia/Shanghai'
const DAY_MS = 24 * 60 * 60 * 1000
export const FRESH_PUBLISHED_WINDOW_DAYS = 3
const shanghaiDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SHANGHAI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

let warnedInvalidIngestedAt = false

export interface TodayAddedGroup {
  key: string
  label: string
  count: number
  items: FeedItem[]
  backfillCount: number
  backfillItems: FeedItem[]
}

export interface TodayAddedSummary {
  batchKey: string
  total: number
  backfillTotal: number
  groups: TodayAddedGroup[]
  emptyLabels: string[]
  latestIngestedDate: string
  latestIngestedCount: number
}

function shanghaiDateKey(date: Date): string {
  const parts = shanghaiDateFormatter.formatToParts(date)
  const get = (type: 'year' | 'month' | 'day') => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function dateKeyFromIso(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return null
  return shanghaiDateKey(new Date(time))
}

function dayNumberFromDateKey(dateKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return Number.NaN
  const [, year, month, day] = match
  return Math.floor(Date.UTC(Number(year), Number(month) - 1, Number(day)) / DAY_MS)
}

function timestampFromIso(value: string): number {
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : 0
}

function isFreshPublishedDate(publishedDateKey: string | null, batchKey: string): boolean {
  if (!publishedDateKey) return false
  const publishedDay = dayNumberFromDateKey(publishedDateKey)
  const batchDay = dayNumberFromDateKey(batchKey)
  if (!Number.isFinite(publishedDay) || !Number.isFinite(batchDay)) return false
  return publishedDay >= batchDay - FRESH_PUBLISHED_WINDOW_DAYS + 1 && publishedDay <= batchDay
}

function warnInvalidIngestedAt(count: number) {
  if (count === 0 || warnedInvalidIngestedAt) return
  warnedInvalidIngestedAt = true
  console.warn(`[demo-batch] skipped ${count} item(s) with missing or invalid ingested_at`)
}

export function summarizeTodayAdded(items: FeedItem[]): TodayAddedSummary {
  const freshItemsByGroup = new Map(HOME_CONTENT_GROUPS.map((group) => [group.key, [] as FeedItem[]]))
  const backfillItemsByGroup = new Map(HOME_CONTENT_GROUPS.map((group) => [group.key, [] as FeedItem[]]))
  const ingestCountsByDate = new Map<string, number>()
  const validIngestions: { item: FeedItem; ingestedDate: string }[] = []
  let invalidIngestedAtCount = 0

  for (const item of items) {
    const ingestedDate = dateKeyFromIso(item.ingested_at)
    if (!ingestedDate) {
      invalidIngestedAtCount += 1
      continue
    }

    validIngestions.push({ item, ingestedDate })
    ingestCountsByDate.set(ingestedDate, (ingestCountsByDate.get(ingestedDate) ?? 0) + 1)
  }

  warnInvalidIngestedAt(invalidIngestedAtCount)

  let latestIngestedDate = ''
  let latestIngestedCount = 0
  for (const [date, count] of ingestCountsByDate) {
    if (date > latestIngestedDate) {
      latestIngestedDate = date
      latestIngestedCount = count
    }
  }

  // 公开演示始终锚定数据集自身的最新有效入库日，不依赖访问者当前日期。
  for (const { item, ingestedDate } of validIngestions) {
    if (ingestedDate !== latestIngestedDate) continue

    const group = HOME_CONTENT_GROUPS.find((candidate) => candidate.sourceTypes.includes(item.source_type))
    if (!group) continue

    const publishedDate = dateKeyFromIso(item.published_at)
    if (isFreshPublishedDate(publishedDate, latestIngestedDate)) freshItemsByGroup.get(group.key)?.push(item)
    else backfillItemsByGroup.get(group.key)?.push(item)
  }

  const groups = HOME_CONTENT_GROUPS.map((group) => {
    const groupItems = [...(freshItemsByGroup.get(group.key) ?? [])].sort(
      (a, b) => timestampFromIso(b.published_at) - timestampFromIso(a.published_at),
    )
    const backfillItems = [...(backfillItemsByGroup.get(group.key) ?? [])].sort(
      (a, b) => timestampFromIso(b.published_at) - timestampFromIso(a.published_at),
    )
    return {
      key: group.key,
      label: group.label,
      count: groupItems.length,
      items: groupItems,
      backfillCount: backfillItems.length,
      backfillItems,
    }
  })

  return {
    batchKey: latestIngestedDate,
    total: groups.reduce((sum, group) => sum + group.count, 0),
    backfillTotal: groups.reduce((sum, group) => sum + group.backfillCount, 0),
    groups: groups.filter((group) => group.count > 0 || group.backfillCount > 0),
    emptyLabels: groups.filter((group) => group.count === 0 && group.backfillCount === 0).map((group) => group.label),
    latestIngestedDate,
    latestIngestedCount,
  }
}
