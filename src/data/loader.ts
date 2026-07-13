/*
 * 数据加载。无后端：启动时 fetch /data/feed.json（条目数组），
 * 按 published_at 倒序排序后缓存。模块级缓存保证只加载一次。
 */

import type { FeedItem } from '../types/envelope'

let cache: Promise<FeedItem[]> | null = null

function byPublishedDesc(a: FeedItem, b: FeedItem): number {
  return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
}

export function loadFeed(): Promise<FeedItem[]> {
  if (!cache) {
    const url = `${import.meta.env.BASE_URL}data/feed.json`
    cache = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`加载 feed.json 失败：HTTP ${r.status}`)
        return r.json() as Promise<FeedItem[]>
      })
      .then((items) => [...items].sort(byPublishedDesc))
      .catch((err) => {
        // 失败时清空缓存，下次可重试
        cache = null
        throw err
      })
  }
  return cache
}
