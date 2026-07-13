import { Sparkles, AlignLeft } from 'lucide-react'
import { Markdown } from './Markdown'
import { tint } from '../../lib/color'

const BLUE = '#3778E5'
const INK = '#16213E'

/**
 * 结论框。各信源详情页复用，位于正文/文字稿之前 —— 对应 PRD「先给结论」。
 * label/ai 由调用方按数据真实来源指定：
 *   · 播客等上游真有 LLM 深度总结 → 默认「深度总结 · AI 生成」。
 *   · news/wechat 当前是信源自带摘要（采集零额度、无 LLM）→ 传 label=「信源摘要」ai=false，不谎称 AI。
 * 内容为空则不渲染（忠实：没有就不显示空框）。
 */
export function DeepSummary({
  markdown,
  label = '深度总结',
  ai = true,
}: {
  markdown: string
  label?: string
  ai?: boolean
}) {
  if (!markdown?.trim()) return null
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        borderColor: tint(BLUE, 36),
        background: `linear-gradient(180deg, ${tint(BLUE, 7)}, transparent 80%), #fff`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: tint(BLUE, 14), color: BLUE }}
        >
          {ai ? <Sparkles size={16} /> : <AlignLeft size={16} />}
        </span>
        <h2 className="text-lg tracking-tight" style={{ fontWeight: 700, color: INK }}>
          {label}
        </h2>
        {ai && (
          <span
            className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{ color: BLUE, background: tint(BLUE, 12) }}
          >
            AI 生成
          </span>
        )}
      </div>
      <Markdown>{markdown}</Markdown>
    </section>
  )
}
