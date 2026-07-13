import { Fragment, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  children: string
  /** 可选：需要在正文中高亮的词（用于 News 的“新词诞生”信号）。 */
  highlight?: string[]
  className?: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 构造一个把命中词包成 <mark> 的子节点转换函数。 */
function buildHighlighter(terms: string[]): (children: ReactNode) => ReactNode {
  const source = terms.map(escapeRegExp).join('|')
  const splitRe = new RegExp(`(${source})`, 'gi')
  const matchRe = new RegExp(`^(?:${source})$`, 'i')

  const wrapString = (text: string): ReactNode => {
    const parts = text.split(splitRe)
    if (parts.length === 1) return text
    return parts.map((part, i) =>
      matchRe.test(part) ? (
        <mark key={i} className="term">
          {part}
        </mark>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
  }

  return (children: ReactNode): ReactNode => {
    if (typeof children === 'string') return wrapString(children)
    if (Array.isArray(children))
      return children.map((c, i) => (
        <Fragment key={i}>{typeof c === 'string' ? wrapString(c) : c}</Fragment>
      ))
    return children
  }
}

/**
 * 成熟库渲染 markdown（react-markdown + GFM）。
 * 传入 highlight 时，对正文文本节点做“新词”高亮。
 */
export function Markdown({ children, highlight, className }: MarkdownProps) {
  // 公众号配图走 mmbiz.qpic.cn，有防盗链（Referer 校验）：no-referrer → CDN 正常回图；懒加载省流。
  const components: Components = {
    img: ({ node, ...props }) => {
      void node // react-markdown 的 AST 节点不能透传给原生 img。
      return <img {...props} alt={props.alt ?? ''} referrerPolicy="no-referrer" loading="lazy" />
    },
  }
  if (highlight && highlight.length > 0) {
    const wrap = buildHighlighter(highlight)
    components.p = ({ children }) => <p>{wrap(children)}</p>
    components.li = ({ children }) => <li>{wrap(children)}</li>
    components.td = ({ children }) => <td>{wrap(children)}</td>
    components.strong = ({ children }) => <strong>{wrap(children)}</strong>
    components.em = ({ children }) => <em>{wrap(children)}</em>
  }

  return (
    <div className={`md ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
