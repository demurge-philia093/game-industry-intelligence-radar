import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot, ThumbsUp, Star } from 'lucide-react'
import { useFeed } from '../hooks/useFeed'
import { sourceRecent, sourceByName, sourceGroup, listSourcesOfType } from '../lib/daily'
import {
  ENTITY_SUBMODULES,
  HOME_CONTENT_GROUPS,
  HOME_DEFAULT_VIEW,
  MODULE_GROUPS,
  SOURCE_LABEL,
  TODAY_ADDED_VIEW,
  normalizeHomeView,
} from '../lib/homeViews'
import { summarizeTodayAdded } from '../lib/todayAdded'
import { Foyer } from '../components/home/Foyer'
import { IconDial } from '../components/home/IconDial'
import { SegmentTabs, type Seg } from '../components/home/SegmentTabs'
import { SourceFeed } from '../components/home/SourceFeed'
import { TodayAdded, type TodayAddedRenderGroup } from '../components/home/TodayAdded'

const BLUE = '#3778E5'
const INK = '#16213E'
/** 左上立绘占位图——替换为 AI 简笔立绘时填此 url。 */
const CHARACTER_IMAGE = ''

type ChannelScope = 'all' | 'filtered'
type PodcastScopeByName = Record<string, ChannelScope>
type ContentFilterItems = Record<string, { is_relevant?: boolean }>

interface PodcastChannelsFile {
  channels?: { label?: string; scope?: string; enabled?: boolean }[]
}

interface ContentFilterFile {
  items?: ContentFilterItems
}

export function HomePage() {
  const { items, loading, error } = useFeed()
  // 两级视图存 URL：?view=<大类> & ?src=<二级信源>。从详情返回能恢复。无 view = 门厅。
  const [sp, setSp] = useSearchParams()
  const entered = sp.has('view')
  const activeType = normalizeHomeView(sp.get('view'))
  const activeSource = sp.get('src') || '全部'
  const enter = useCallback(() => setSp({ view: HOME_DEFAULT_VIEW }), [setSp])
  const leave = useCallback(() => setSp({}), [setSp])
  const selectType = useCallback((t: string) => setSp({ view: t }), [setSp]) // 切大类→重置二级到「全部」
  const selectSource = useCallback((s: string) => setSp({ view: activeType, src: s }), [activeType, setSp])
  const [podcastScopeByName, setPodcastScopeByName] = useState<PodcastScopeByName | null>(null)
  const [contentFilterItems, setContentFilterItems] = useState<ContentFilterItems | null>(null)
  const [lowRelevanceState, setLowRelevanceState] = useState({ contentKey: '', open: false })

  useEffect(() => {
    let alive = true
    const base = import.meta.env.BASE_URL
    fetch(`${base}data/podcast_channels.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<PodcastChannelsFile>
      })
      .then((dataFile) => {
        if (!alive) return
        const scopes: PodcastScopeByName = {}
        for (const ch of dataFile.channels || []) {
          if (ch.label && (ch.scope === 'all' || ch.scope === 'filtered')) scopes[ch.label] = ch.scope
        }
        setPodcastScopeByName(scopes)
      })
      .catch(() => {
        if (alive) setPodcastScopeByName(null)
      })
    fetch(`${base}data/content_filter.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ContentFilterFile>
      })
      .then((dataFile) => {
        if (alive) setContentFilterItems(dataFile.items || null)
      })
      .catch(() => {
        if (alive) setContentFilterItems(null)
      })
    return () => {
      alive = false
    }
  }, [])

  // 米哈游式整页纵向滑动：区块0=门厅 hero、区块1=看板。wheel 下滑进入；
  // 在看板内容顶端继续上滑则回到 hero（仿 mihoyo「release on edges」）。带锁防抖，避免一次滚轮连跳。
  const enteredRef = useRef(entered)
  const navRef = useRef({ enter, leave })
  const lockRef = useRef(false)
  useEffect(() => {
    enteredRef.current = entered
    navRef.current = { enter, leave }
  }, [entered, enter, leave])
  useEffect(() => {
    const SLIDE_MS = 650 // 略长于 CSS 过渡 0.6s
    const go = (toEntered: boolean) => {
      if (lockRef.current) return
      lockRef.current = true
      if (toEntered) navRef.current.enter()
      else navRef.current.leave()
      window.setTimeout(() => {
        lockRef.current = false
      }, SLIDE_MS)
    }
    const canScrollUp = (target: EventTarget | null) => {
      let el = target as HTMLElement | null
      while (el && el !== document.body) {
        if (el.scrollHeight - el.clientHeight > 2 && el.scrollTop > 0) return true
        el = el.parentElement
      }
      return false
    }
    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) return
      if (!enteredRef.current) {
        if (e.deltaY > 8) go(true)
      } else if (e.deltaY < -8 && !canScrollUp(e.target)) {
        go(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (!enteredRef.current && ['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        go(true)
      }
    }
    let startY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (startY == null) return
      const dy = startY - (e.touches[0]?.clientY ?? startY)
      if (!enteredRef.current && dy > 50) {
        go(true)
        startY = null
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const data = useMemo(() => items ?? [], [items])
  const todayAdded = useMemo(() => summarizeTodayAdded(data), [data])
  const latestSnapshotCount = todayAdded.total + todayAdded.backfillTotal
  const isTodayAddedView = activeType === TODAY_ADDED_VIEW
  const counts = useMemo(() => {
    const c: Record<string, number> = { [TODAY_ADDED_VIEW]: latestSnapshotCount }
    for (const group of HOME_CONTENT_GROUPS) {
      c[group.key] = data.filter((item) => group.sourceTypes.includes(item.source_type)).length
    }
    return c
  }, [data, latestSnapshotCount])

  // 二级段控：该大类下各信源（>1 个才显示，[全部 + 各源]）
  const segs = useMemo<Seg[]>(() => {
    if (isTodayAddedView) return []
    const group = MODULE_GROUPS[activeType]
    if (group) {
      // 商业实体：二级按 source_type 分（不按 source_name——组内皆「天眼查」会并成一项，§3.4）
      const present = ENTITY_SUBMODULES.filter((t) => data.some((i) => i.source_type === t))
      if (present.length === 0) return []
      return [{ key: '全部', label: '全部' }, ...present.map((t) => ({ key: t, label: SOURCE_LABEL[t] ?? t }))]
    }
    const srcs = listSourcesOfType(data, activeType)
    if (srcs.length <= 1) return []
    return [{ key: '全部', label: '全部' }, ...srcs.map((s) => ({ key: s.name, label: s.name }))]
  }, [data, activeType, isTodayAddedView])

  const showSource = !isTodayAddedView && segs.length > 0 && activeSource !== '全部'
  const contentKey = `${activeType}/${showSource ? activeSource : '全部'}`
  const lowRelevanceOpen = lowRelevanceState.contentKey === contentKey && lowRelevanceState.open
  const toggleLowRelevanceOpen = useCallback(() => {
    setLowRelevanceState((state) => ({
      contentKey,
      open: state.contentKey === contentKey ? !state.open : true,
    }))
  }, [contentKey])
  const todayAddedGroups = useMemo<TodayAddedRenderGroup[]>(() => {
    return todayAdded.groups.map((group) => {
      const visibleItems: typeof group.items = []
      const lowRelevanceItems: typeof group.items = []

      if (group.key === 'podcast' && podcastScopeByName && contentFilterItems) {
        for (const item of group.items) {
          const scope = podcastScopeByName[item.source_name]
          const score = contentFilterItems[item.id]
          if (scope === 'filtered' && score && score.is_relevant === false) lowRelevanceItems.push(item)
          else visibleItems.push(item)
        }
      } else {
        visibleItems.push(...group.items)
      }

      const foldedItems = [...lowRelevanceItems, ...group.backfillItems]
      const foldedKey = `${TODAY_ADDED_VIEW}/${group.key}`
      const foldedOpen = lowRelevanceState.contentKey === foldedKey && lowRelevanceState.open
      return {
        key: group.key,
        label: group.label,
        count: group.count,
        items: visibleItems,
        folded: foldedItems.length
          ? {
              items: foldedItems,
              open: foldedOpen,
              onToggle: () => {
                setLowRelevanceState((state) => ({
                  contentKey: foldedKey,
                  open: state.contentKey === foldedKey ? !state.open : true,
                }))
              },
            }
          : undefined,
      }
    })
  }, [contentFilterItems, lowRelevanceState.contentKey, lowRelevanceState.open, podcastScopeByName, todayAdded.groups])

  if (loading) return <div style={center}>加载情报中…</div>
  if (error) return <div style={{ ...center, color: '#c0392b' }}>数据加载失败：{error}</div>

  const moduleGroup = MODULE_GROUPS[activeType]
  // 内容清单：商业实体大类按 source_type（「全部」=组内并集）；其余大类沿用按 source_name。
  const contentItems = isTodayAddedView
    ? []
    : moduleGroup
      ? showSource
        ? sourceRecent(data, activeSource)
        : sourceGroup(data, moduleGroup)
      : showSource
        ? sourceByName(data, activeSource)
        : sourceRecent(data, activeType)
  const contentLabel = isTodayAddedView
    ? TODAY_ADDED_VIEW
    : showSource
      ? SOURCE_LABEL[activeSource] ?? activeSource
      : SOURCE_LABEL[activeType] ?? activeType
  let visibleContentItems = contentItems
  let foldedPodcastItems: typeof contentItems = []
  if (!isTodayAddedView && activeType === 'podcast' && podcastScopeByName && contentFilterItems) {
    visibleContentItems = []
    foldedPodcastItems = []
    for (const item of contentItems) {
      const scope = podcastScopeByName[item.source_name]
      const score = contentFilterItems[item.id]
      if (scope === 'filtered' && score && score.is_relevant === false) foldedPodcastItems.push(item)
      else visibleContentItems.push(item)
    }
  }

  return (
    <div style={pager}>
      <div style={{ ...pagerTrack, transform: entered ? 'translateY(-50%)' : 'translateY(0)' }}>
        {/* 区块0：门厅 hero（米哈游式整页第一屏） */}
        <section style={pagerPanel}>
          <Foyer count={latestSnapshotCount} onEnter={enter} />
        </section>
        {/* 区块1：战略雷达看板（下滑后从下方滑入，不是淡出） */}
        <section style={pagerPanel}>
          <div style={shell}>
      {/* 巨型浅灰英文水印 */}
      <div aria-hidden style={watermark}>DATA</div>
      {/* 左竖排 slogan */}
      <div className="radar-slogan" aria-hidden style={slogan}>TECH OTAKUS SAVE THE WORLD</div>

      {/* 顶部导航 */}
      <nav className="radar-nav" style={navStyle}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 5, height: 20, background: BLUE, borderRadius: 2 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '0.02em' }}>战略雷达</span>
          <span style={publicSnapshotBadge}>PUBLIC SNAPSHOT</span>
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 18 }}>
          <span className="radar-readonly" style={readOnlyLabel}>只读展示</span>
          <span style={{ fontSize: 12, color: '#999', letterSpacing: '0.1em' }}>
            <span style={{ color: INK, fontWeight: 600 }}>CH</span> / EN
          </span>
        </span>
      </nav>

      {/* 二级·信源段控（mihoyo 连体段控，仅多源大类显示） */}
      <div className="radar-seg" style={segBar}>
        {segs.length > 0 && <SegmentTabs segs={segs} active={activeSource} onSelect={selectSource} />}
      </div>

      {/* 主体：左立绘 + 右内容 */}
      <main className="radar-main" style={mainStyle}>
        <div className="radar-portrait" style={portrait}>
          {!CHARACTER_IMAGE && (
            <div style={{ textAlign: 'center', color: '#AEB4BC' }}>
              <Bot size={40} style={{ color: '#9FB4DA' }} />
              <p style={{ margin: '10px 0 0', fontSize: 12 }}>AI 立绘 · 占位</p>
            </div>
          )}
        </div>

        {/* 内容区：第一 tab=默认新增视图；否则=该大类(全部) 或 该信源 清单。切换时平滑入场。 */}
        <section className="radar-content" style={contentSection}>
          <div key={contentKey} className="tab-enter" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {isTodayAddedView ? (
              <TodayAdded summary={todayAdded} groups={todayAddedGroups} />
            ) : (
              <SourceFeed
                label={contentLabel}
                items={visibleContentItems}
                folded={
                  activeType === 'podcast' && foldedPodcastItems.length
                    ? {
                        items: foldedPodcastItems,
                        open: lowRelevanceOpen,
                        onToggle: toggleLowRelevanceOpen,
                      }
                    : undefined
                }
              />
            )}
          </div>

          {/* 螺旋校准（占位，不实现学习逻辑） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flex: 'none' }}>
            <span style={{ fontSize: 12, color: '#bbb' }}>校准：</span>
            {[
              { icon: ThumbsUp, label: '有用' },
              { icon: Star, label: '关注' },
            ].map(({ icon: Ic, label }) => (
              <button key={label} type="button" style={calibBtn} title="占位（暂不学习）">
                <Ic size={13} />
                {label}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* 底部圆形图标盘（一级·大类） */}
      <footer className="radar-footer" style={footerStyle}>
        <IconDial active={activeType} onSelect={selectType} counts={counts} />
      </footer>
          </div>
        </section>
      </div>
    </div>
  )
}

/* 整页纵向滑动容器（仿米哈游官网首页→内容的过渡）：视口高裁剪，内含 200dvh 轨道，
   轨道在 translateY(0)↔(-50%) 间用米哈游签名缓动平移——hero 上滑、看板从下滑入。 */
const pager: CSSProperties = {
  position: 'relative',
  height: '100dvh',
  width: '100%',
  overflow: 'hidden',
}
const pagerTrack: CSSProperties = {
  height: '200dvh',
  transition: 'transform 0.6s cubic-bezier(0.15, 0.59, 0.45, 0.89)',
  willChange: 'transform',
}
const pagerPanel: CSSProperties = {
  height: '100dvh',
  width: '100%',
}

const publicSnapshotBadge: CSSProperties = {
  padding: '3px 7px',
  border: '1px solid #BFD2F2',
  borderRadius: 999,
  color: '#3778E5',
  background: '#F3F7FD',
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '0.12em',
}

const readOnlyLabel: CSSProperties = {
  color: '#8B95A5',
  fontSize: 11,
  letterSpacing: '0.08em',
}

const shell: CSSProperties = {
  position: 'relative',
  height: '100dvh',
  background: '#fff',
  backgroundImage: 'radial-gradient(#E8E8EE 1px, transparent 1px)',
  backgroundSize: '22px 22px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const watermark: CSSProperties = {
  position: 'absolute',
  right: '-1vw',
  top: '14%',
  writingMode: 'vertical-rl',
  fontSize: 'clamp(60px, 11vw, 190px)',
  fontWeight: 800,
  letterSpacing: '0.04em',
  color: '#F1F2F6',
  userSelect: 'none',
  pointerEvents: 'none',
  zIndex: 0,
}

const slogan: CSSProperties = {
  position: 'absolute',
  left: 14,
  bottom: 120,
  writingMode: 'vertical-rl',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.34em',
  color: '#C4CAD4',
  userSelect: 'none',
}

const navStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 28,
  padding: '12px 40px 2px',
  maxWidth: 1200,
  width: '100%',
  margin: '0 auto',
}

const segBar: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  flex: 'none',
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '6px 40px 0',
  minHeight: 8,
}

const mainStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  flex: 1,
  minHeight: 0,
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: '10px 40px 6px',
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 1fr) minmax(0, 4fr)',
  gap: 28,
  alignItems: 'stretch',
}

const portrait: CSSProperties = {
  aspectRatio: '3 / 5',
  alignSelf: 'start',
  maxHeight: '100%',
  minHeight: 0,
  borderRadius: 16,
  border: '1px dashed #D7DBE4',
  background: CHARACTER_IMAGE
    ? `center/cover no-repeat url(${CHARACTER_IMAGE})`
    : 'linear-gradient(180deg, #F3F6FC 0%, #EAF0FB 100%)',
  display: 'grid',
  placeItems: 'center',
}

const contentSection: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const footerStyle: CSSProperties = {
  position: 'relative',
  zIndex: 2,
  flex: 'none',
  padding: '8px 24px 12px',
}

const center: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  color: '#666',
  fontSize: 15,
}

const calibBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  color: '#888',
  background: '#fff',
  border: '1px solid #E2E6EE',
  borderRadius: 999,
  padding: '4px 10px',
  cursor: 'pointer',
}
