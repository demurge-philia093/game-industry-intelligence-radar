import { FileText } from 'lucide-react'
import { getHttpUrl } from '../../lib/url'

/** 公开快照未附正文时的静态空状态；不尝试调用采集服务。 */
export function EmptyBody({ url }: { url: string }) {
  const originalUrl = getHttpUrl(url)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '52px 20px',
        color: '#8A92A0',
      }}
    >
      <FileText size={28} style={{ color: '#C4CAD4', marginBottom: 12 }} />
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8 }}>
        公开快照未收录这篇文章的完整正文。
        <br />
        {originalUrl ? (
          <a href={originalUrl} target="_blank" rel="noreferrer" style={{ color: '#3778E5' }}>
            打开原始链接阅读全文
          </a>
        ) : (
          <span style={{ fontSize: 12.5, color: '#A0A6B0' }}>原始链接暂不可用</span>
        )}
      </p>
    </div>
  )
}
