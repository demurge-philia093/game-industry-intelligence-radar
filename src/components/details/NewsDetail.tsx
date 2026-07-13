import type { FeedItem } from '../../types/envelope'
import type { NewsPayload } from '../../types/payloads'
import { Markdown } from '../common/Markdown'
import { ArticleReader } from './ArticleReader'
import { EmptyBody } from './EmptyBody'

/** 新闻详情：米哈游式文章阅读器，只展示抓取的正文（总结归到列表卡，不在此重复）。 */
export function NewsDetail({ item }: { item: FeedItem }) {
  const p = item.payload as NewsPayload
  const terms = p.extracted_terms?.map((t) => t.term) ?? []
  const hasBody = !!p.body?.trim()

  return (
    <ArticleReader item={item}>
      {hasBody ? (
        <Markdown highlight={terms}>{p.body}</Markdown>
      ) : (
        <EmptyBody url={item.original_url} />
      )}
    </ArticleReader>
  )
}
