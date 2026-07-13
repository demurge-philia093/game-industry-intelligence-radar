import { PenLine } from 'lucide-react'
import type { FeedItem } from '../../types/envelope'
import type { WechatPayload } from '../../types/payloads'
import { Markdown } from '../common/Markdown'
import { ArticleReader } from './ArticleReader'
import { EmptyBody } from './EmptyBody'

/** 公众号详情：公开站仅展示随演示数据发布的正文，不向本地或远端后端发起抓取。 */
export function WechatDetail({ item }: { item: FeedItem }) {
  const p = item.payload as WechatPayload
  const terms = p.extracted_terms?.map((term) => term.term) ?? []
  const body = p.body?.trim() ?? ''

  return (
    <ArticleReader
      item={item}
      extra={
        p.author ? (
          <span className="inline-flex items-center gap-1">
            <PenLine size={13} />
            {p.author}
          </span>
        ) : undefined
      }
    >
      {body ? (
        <Markdown highlight={terms}>{body}</Markdown>
      ) : (
        <EmptyBody url={item.original_url} />
      )}
    </ArticleReader>
  )
}
