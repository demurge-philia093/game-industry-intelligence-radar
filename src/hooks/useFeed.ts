import { useEffect, useState } from 'react'
import { loadFeed } from '../data/loader'
import type { FeedItem } from '../types/envelope'

interface FeedState {
  items: FeedItem[] | null
  loading: boolean
  error: string | null
}

/** 加载整个 feed，返回 { items, loading, error }。组件挂载时触发。 */
export function useFeed(): FeedState {
  const [state, setState] = useState<FeedState>({
    items: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let alive = true
    loadFeed()
      .then((items) => {
        if (alive) setState({ items, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (alive)
          setState({ items: null, loading: false, error: String(err) })
      })
    return () => {
      alive = false
    }
  }, [])

  return state
}
