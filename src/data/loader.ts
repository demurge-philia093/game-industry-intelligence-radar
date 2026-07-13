/*
 * 数据加载。无后端：启动时 fetch /data/feed.json（条目数组），
 * 按 published_at 倒序排序后缓存。模块级缓存保证只加载一次。
 */

import type { FeedItem } from '../types/envelope'

let cache: Promise<FeedItem[]> | null = null
const detailChunkCache = new Map<string, Promise<Record<string, FeedItem>>>()

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

function detailBucket(id: string): string {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0
  }
  return (hash % 64).toString(16).padStart(2, '0')
}

export async function loadFeedItem(id: string): Promise<FeedItem | null> {
  const bucket = detailBucket(id)
  let chunkPromise = detailChunkCache.get(bucket)

  if (!chunkPromise) {
    const url = `${import.meta.env.BASE_URL}data/details/${bucket}.json`
    chunkPromise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`加载详情分片失败：HTTP ${response.status}`)
        return response.json() as Promise<Record<string, FeedItem>>
      })
      .catch((error) => {
        detailChunkCache.delete(bucket)
        throw error
      })
    detailChunkCache.set(bucket, chunkPromise)
  }

  const chunk = await chunkPromise
  return chunk[id] ?? null
}
