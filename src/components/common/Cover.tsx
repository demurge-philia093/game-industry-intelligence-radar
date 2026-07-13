import { useState } from 'react'
import type { BaseEnvelope } from '../../types/envelope'
import { sourceMeta } from '../../registry/meta'
import { tint } from '../../lib/color'
import { getHttpUrl } from '../../lib/url'

/**
 * 封面：有 cover_image 则显示图片，否则用信源强调色生成渐变占位（带信源图标）。
 * 自包含、离线可用，不依赖远程图片。
 */
export function Cover({
  item,
  className,
  iconSize = 40,
}: {
  item: Pick<BaseEnvelope, 'cover_image' | 'source_type'>
  className?: string
  iconSize?: number
}) {
  const meta = sourceMeta(item.source_type)
  const Icon = meta.icon
  const resolvedCover = getHttpUrl(item.cover_image)
  const coverUrl = resolvedCover?.startsWith('https://') ? resolvedCover : null
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (coverUrl && failedUrl !== coverUrl) {
    return (
      <img
        src={coverUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(coverUrl)}
        className={`object-cover ${className ?? ''}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{
        background: `radial-gradient(120% 120% at 20% 10%, ${tint(
          meta.accent,
          26,
        )}, transparent 60%), linear-gradient(135deg, var(--panel-2), var(--bg-1))`,
      }}
    >
      <Icon size={iconSize} style={{ color: meta.accent, opacity: 0.45 }} />
    </div>
  )
}
