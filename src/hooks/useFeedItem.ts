import { useEffect, useState } from 'react'
import { loadFeedItem } from '../data/loader'
import type { FeedItem } from '../types/envelope'

export function useFeedItem(id: string | undefined) {
  const [result, setResult] = useState<{
    id: string | undefined
    item: FeedItem | null
    error: string | null
  }>({ id: undefined, item: null, error: null })

  useEffect(() => {
    let active = true
    if (!id) return undefined

    loadFeedItem(id)
      .then((nextItem) => {
        if (active) setResult({ id, item: nextItem, error: null })
      })
      .catch((reason) => {
        if (!active) return
        setResult({
          id,
          item: null,
          error: reason instanceof Error ? reason.message : String(reason),
        })
      })

    return () => {
      active = false
    }
  }, [id])

  const current = result.id === id ? result : { item: null, error: null }
  return { item: current.item, error: current.error, loading: Boolean(id) && result.id !== id }
}
