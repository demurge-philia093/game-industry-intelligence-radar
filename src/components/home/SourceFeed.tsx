import { useId, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { FeedItem } from '../../types/envelope'
import { ModuleTitle } from './Digest'

type UnknownRecord = Record<string, unknown>
type DetailFact = { label: string; value: string }

const RAW_TEXT_LIMIT = 2_048

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function cleanText(value: unknown, limit: number): string {
  if (typeof value !== 'string') return ''
  // 先限制输入规模，再清理标签与空白，避免异常长正文拖慢列表渲染。
  const bounded = value.slice(0, RAW_TEXT_LIMIT)
  const cleaned = bounded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned.length > limit ? `${cleaned.slice(0, limit)}…` : cleaned
}

function firstCleanText(values: unknown[], limit: number): string {
  for (const value of values) {
    const text = cleanText(value, limit)
    if (text) return text
  }
  return ''
}

function stringList(value: unknown, limit = 32): string[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, 32)
    .map((entry) => cleanText(entry, limit))
    .filter(Boolean)
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function validDateValue(value: unknown): string {
  const text = typeof value === 'string' ? value.slice(0, 40).trim() : ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match || Number.isNaN(Date.parse(text))) return ''
  const [, year, month, day] = match
  return isValidCalendarDate(Number(year), Number(month), Number(day)) ? text : ''
}

function hm(value: unknown): string {
  if (typeof value !== 'string') return ''
  const text = value.slice(0, 64).trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.exec(text)
  if (!match || Number.isNaN(Date.parse(text))) return ''
  const [, year, month, day, hour, minute] = match
  if (!isValidCalendarDate(Number(year), Number(month), Number(day))) return ''
  return `${month}-${day} ${hour}:${minute}`
}

function fact(label: string, value: unknown, limit = 48): DetailFact | null {
  const text = cleanText(value, limit)
  return text ? { label, value: text } : null
}

function numberValue(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? String(value) : ''
}

function typedFacts(item: FeedItem, payload: UnknownRecord | null): DetailFact[] {
  if (!payload) return []
  const facts: DetailFact[] = []
  const add = (entry: DetailFact | null) => {
    if (entry) facts.push(entry)
  }

  switch (item.source_type) {
    case 'entity':
      add(fact('状态', payload.status))
      add(fact('法定代表人', payload.legal_rep))
      add(fact('注册资本', payload.reg_capital))
      add(fact('成立', validDateValue(payload.establish_date)))
      break
    case 'entity_change':
      add(fact('变更前', payload.before))
      add(fact('变更后', payload.after))
      add(fact('日期', validDateValue(payload.change_date)))
      break
    case 'trademark':
      add(fact('状态', payload.status))
      add(fact('类别', payload.int_cls))
      add(fact('申请人', payload.applicant))
      add(fact('最新事件', payload.latest_event))
      break
    case 'recruitment':
      add(fact('薪资', payload.salary))
      add(fact('学历', payload.education))
      add(fact('经验', payload.experience))
      add(fact('来源', payload.origin))
      break
    case 'banhao': {
      add(fact('审批', payload.approval_type))
      const total = numberValue(payload.total)
      add(fact('数量', total ? `${total} 款` : ''))
      const groups = Array.isArray(payload.by_company)
        ? payload.by_company
            .slice(0, 3)
            .map(asRecord)
            .filter((group): group is UnknownRecord => Boolean(group))
            .map((group) => {
              const name = cleanText(group.group, 22)
              const count = numberValue(group.count)
              return name && count ? `${name} ${count}` : name
            })
            .filter(Boolean)
        : []
      add(fact('集团', groups.join(' / '), 72))
      break
    }
    default:
      break
  }

  return facts.slice(0, 4)
}

function detailFields(item: FeedItem) {
  const payload = asRecord(item.payload)
  const entities = asRecord(item.entities)
  const title = cleanText(item.title, 240)
  const sourceName = cleanText(item.source_name, 80)
  const summary = firstCleanText(
    [payload?.excerpt, payload?.background, item.deep_summary, payload?.body],
    220,
  )
  const facts = typedFacts(item, payload)
  const factValues = new Set(facts.map((entry) => entry.value))
  const topics = [
    ...stringList(item.matched_keywords),
    ...stringList(item.tags),
    ...stringList(entities?.works),
    ...stringList(entities?.companies),
  ]
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((value) => value !== title && value !== sourceName && !factValues.has(value))
    .slice(0, 4)

  return {
    title,
    sourceName,
    summary,
    facts,
    topics,
    published: hm(item.published_at),
  }
}

function detailDescription(summary: string, facts: DetailFact[], topics: string[]): string {
  const parts: string[] = []
  if (summary) parts.push(`摘要：${summary}`)
  if (facts.length > 0) parts.push(facts.map(({ label, value }) => `${label}：${value}`).join('；'))
  if (topics.length > 0) parts.push(`主题：${topics.join('、')}`)
  return parts.join('；')
}

/**
 * 某信源今日清单（点信源图标后的态）：编号卡片陈列（参考米哈游招聘页编号卡）。
 * 锁定一屏：根为 flex 列，卡片列 flex:1 内部滚动（src-scroll 冷灰细条），
 * 顶栏/底盘始终在屏，仅卡片列在框内滚动——长清单（可能 ~90 条）不顶破整页。
 */
const RENDER_CAP = 60 // 控 DOM：最多渲染 60 张（如 wechat 数千条），其余在列表内滚动也不堆 DOM

export function SourceFeed({
  label,
  items,
  folded,
  hideRecencyBadge = false,
}: {
  label: string
  items: FeedItem[]
  folded?: { items: FeedItem[]; open: boolean; onToggle: () => void }
  hideRecencyBadge?: boolean
}) {
  const foldedItems = folded?.items ?? []
  const totalCount = items.length + foldedItems.length
  const shown = items.slice(0, RENDER_CAP)
  const foldedShown = folded?.open ? foldedItems.slice(0, RENDER_CAP) : []
  const renderedCount = shown.length + foldedShown.length
  const foldedText =
    folded?.open && foldedShown.length < foldedItems.length
      ? `已展开 ${foldedShown.length}/${foldedItems.length} 集低相关单集`
      : `已${folded?.open ? '展开' : '折叠'} ${foldedItems.length} 集低相关单集`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, minWidth: 0 }}>
      <ModuleTitle
        cn={hideRecencyBadge ? label : `${label}·最近`}
        en={hideRecencyBadge ? '' : 'RECENT'}
        extra={`共 ${totalCount} 条${totalCount > renderedCount ? ` · 已显示 ${renderedCount}/${totalCount}` : ''}`}
      />

      {totalCount === 0 ? (
        <p style={{ marginTop: 18, fontSize: 15, color: '#999' }}>该信源暂无条目。</p>
      ) : (
        <ul
          className="src-scroll"
          style={{
            listStyle: 'none',
            margin: '12px 0 0',
            padding: 0,
            paddingRight: 8,
            paddingBottom: 8,
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {shown.map((item, index) => (
            <SourceFeedItem item={item} index={index} badge={null} key={item.id} />
          ))}
          {foldedItems.length > 0 && folded && (
            <li>
              <button type="button" onClick={folded.onToggle} style={foldToggle}>
                {foldedText} · {folded.open ? '收起' : '展开'}
              </button>
            </li>
          )}
          {foldedShown.map((item, index) => (
            <SourceFeedItem
              item={item}
              index={shown.length + index}
              badge={<span style={lowBadge}>低相关</span>}
              key={item.id}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function SourceFeedItem({ item, index, badge }: { item: FeedItem; index: number; badge: ReactNode }) {
  const details = detailFields(item)
  const descriptionId = useId()
  const hasBriefMeta = Boolean(details.sourceName || details.published)
  const hasMeaningfulDetail = Boolean(details.summary || details.facts.length || details.topics.length)
  const description = hasMeaningfulDetail
    ? detailDescription(details.summary, details.facts, details.topics)
    : ''
  const touchLine =
    details.summary ||
    details.facts.map(({ label, value }) => `${label}：${value}`).join(' · ') ||
    details.topics.join(' · ')

  return (
    <li>
      <Link
        to={`/item/${item.id}`}
        className={`rd-card${hasMeaningfulDetail ? ' rd-card--has-detail' : ''}`}
        aria-label={details.title}
        aria-describedby={hasMeaningfulDetail ? descriptionId : undefined}
      >
        <span className="rd-card__number" aria-hidden="true">
          <span className="rd-card__chevrons">&gt;&gt;&gt;</span>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </span>

        <span className="rd-card__line" aria-hidden="true" />

        <div className="rd-card__brief" aria-hidden="true">
          <div className="rd-card__title-row">
            {badge}
            {details.title && <h3 className="rd-card__title">{details.title}</h3>}
          </div>
          {hasBriefMeta && (
            <div className="rd-card__meta">
              {details.sourceName && <span>{details.sourceName}</span>}
              {details.sourceName && details.published && <span>·</span>}
              {details.published && <span>{details.published}</span>}
            </div>
          )}
          {hasMeaningfulDetail && touchLine && <p className="rd-card__touch-summary">{touchLine}</p>}
        </div>

        {hasMeaningfulDetail && (
          <div className="rd-card__detail" aria-hidden="true">
            {details.summary && <p className="rd-card__summary">{details.summary}</p>}
            {(details.facts.length > 0 || details.topics.length > 0) && (
              <div className="rd-card__signals">
                {details.facts.map(({ label, value }) => (
                  <span className="rd-card__fact" key={`${label}-${value}`}>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </span>
                ))}
                {details.topics.map((topic) => (
                  <span className="rd-card__topic" key={topic}>{topic}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {hasMeaningfulDetail && <span className="sr-only" id={descriptionId}>{description}</span>}
      </Link>
    </li>
  )
}

const lowBadge: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10.5,
  fontWeight: 700,
  color: 'var(--text-dim)',
  background: 'var(--panel-2)',
  border: '1px solid var(--border)',
  padding: '2px 6px',
  borderRadius: 5,
  flex: 'none',
}

const foldToggle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px dashed var(--border-strong)',
  background: 'var(--panel-2)',
  color: 'var(--text-dim)',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
}
