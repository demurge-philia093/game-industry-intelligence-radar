import { useEffect, useRef, type CSSProperties } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { TODAY_ADDED_VIEW } from '../../lib/homeViews'

/** 门厅背景占位深色循环视频——待替换为真实 KV（替换此 src 即可）。 */
const FOYER_VIDEO = `${import.meta.env.BASE_URL}home/foyer-bg.mp4`
const FOYER_FALLBACK = 'radial-gradient(120% 90% at 50% -10%, #1d2f5e 0%, #0b1228 55%, #05070f 100%)'
const SKY = '#23ADE5'

/** 加号网格（自绘 SVG 平铺，对应 mihoyo 首屏的 “+” 点阵；非照搬其图片资源）。 */
const PLUS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cpath d='M15 11.5v7M11.5 15h7' stroke='rgba(255,255,255,0.09)' stroke-width='1'/%3E%3C/svg%3E\")"

/**
 * 门厅（进场，独立全屏）：参照 mihoyo.com 首屏 hero 结构复刻——
 * 视频底(z0) → 暗遮罩(z1) → 加号网格(z1) → 大字层叠标语 + 进入 + 滚动指示(z2)。
 * 大字标语 mihoyo 是图片，这里改为文字（亮主标 + 暗斜向副标层叠 + 天蓝点缀字）。
 */
export function Foyer({ count, onEnter }: { count: number; onEnter: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // 进入由父级 HomePage 的整页纵向滑动统一控制（wheel/方向键/触摸）。
  // 本组件只把「进入按钮 / 滚动指示」接到 onEnter；hero 区块本身不再做淡出。
  const enter = onEnter

  useEffect(() => {
    const v = videoRef.current
    if (v) {
      v.muted = true
      v.play().catch(() => {})
    }
  }, [])

  return (
    <div style={shell}>
      {/* 背景视频（z0） */}
      <video ref={videoRef} autoPlay loop muted playsInline style={video}>
        <source src={FOYER_VIDEO} type="video/mp4" />
      </video>
      {/* 暗遮罩（z1） */}
      <div style={mask} aria-hidden />
      {/* 加号网格（z1） */}
      <div style={plusGrid} aria-hidden />

      {/* 角标 */}
      <span style={{ ...cornerBar, top: 36, right: 40, background: SKY }} aria-hidden />
      <span style={{ ...cornerBar, bottom: 90, left: 40, background: '#3778E5' }} aria-hidden />

      {/* 左上 logo */}
      <div style={logo}>
        <span style={{ width: 5, height: 22, background: '#3778E5', borderRadius: 2 }} />
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '0.02em' }}>战略雷达</span>
        <span style={{ fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>
          STRATEGIC RADAR
        </span>
      </div>

      {/* 左侧小标 */}
      <div style={leftLabel}>
        <span style={{ width: 26, height: 3, background: SKY, display: 'block', marginBottom: 10 }} />
        AI 驱动
        <br />
        范式监控
        <br />
        战略雷达
      </div>

      {/* 右侧竖排标语 */}
      <div aria-hidden style={rightVert}>
        TECH OTAKUS SAVE THE WORLD
      </div>

      {/* 中央大字层叠标语 + 进入 */}
      <div style={hero}>
        <div aria-hidden style={diagDim}>
          CAPTURE&nbsp;THE&nbsp;PARADIGM&nbsp;SHIFT&nbsp;/&nbsp;BEFORE&nbsp;IT&nbsp;GOES&nbsp;MAINSTREAM
        </div>
        <p style={kicker}>WELCOME BACK · 你好，欢迎回来</p>
        <h1 style={bigText}>
          STRATEGIC
          <br />
          RA<span style={{ color: SKY }}>D</span>A<span style={{ color: SKY }}>R</span>
        </h1>
        <p style={subline}>
          {TODAY_ADDED_VIEW}{' '}
          <span style={countNum}>{count}</span>
          {' '}条
        </p>
        <button
          type="button"
          onClick={enter}
          style={enterBtn}
        >
          进入战略雷达
          <ArrowRight size={17} />
        </button>
      </div>

      {/* 底部：分段标 + 鼠标滚动指示 */}
      <div style={bottomBar}>
        <span style={partLabel}>PART 01 · 今日情报</span>
        <span style={{ ...scrollHint, cursor: 'pointer' }} onClick={enter} role="button" aria-label="下滑进入战略雷达">
          <span style={mouseIcon}>
            <span style={mouseDot} />
          </span>
          <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>下滑进入 · 背景为占位视频</span>
      </div>
    </div>
  )
}

const shell: CSSProperties = {
  position: 'relative',
  width: '100vw',
  height: '100dvh',
  overflow: 'hidden',
  cursor: 'default',
  background: FOYER_FALLBACK,
  color: '#fff',
}
const video: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }
const mask: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  background:
    'linear-gradient(180deg, rgba(6,10,24,0.55), rgba(6,10,24,0.35) 40%, rgba(6,10,24,0.7)), radial-gradient(80% 60% at 30% 40%, transparent, rgba(6,10,24,0.45))',
}
const plusGrid: CSSProperties = { position: 'absolute', inset: 0, zIndex: 1, backgroundImage: PLUS, backgroundSize: '30px 30px', opacity: 0.8 }
const cornerBar: CSSProperties = { position: 'absolute', zIndex: 2, width: 56, height: 5, borderRadius: 2 }

const logo: CSSProperties = {
  position: 'absolute',
  top: 30,
  left: 40,
  zIndex: 2,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
}
const leftLabel: CSSProperties = {
  position: 'absolute',
  left: 40,
  top: '40%',
  zIndex: 2,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.7,
  letterSpacing: '0.04em',
  color: 'rgba(255,255,255,0.78)',
}
const rightVert: CSSProperties = {
  position: 'absolute',
  right: 30,
  top: '14%',
  zIndex: 2,
  writingMode: 'vertical-rl',
  fontSize: 'clamp(40px, 7vw, 110px)',
  fontWeight: 800,
  letterSpacing: '0.06em',
  color: 'rgba(255,255,255,0.06)',
  userSelect: 'none',
}

const hero: CSSProperties = {
  position: 'absolute',
  left: '12%',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  maxWidth: '76vw',
}
const diagDim: CSSProperties = {
  position: 'absolute',
  left: '-4%',
  top: '40%',
  transform: 'rotate(-8deg)',
  fontSize: 'clamp(28px, 4vw, 64px)',
  fontWeight: 800,
  letterSpacing: '0.02em',
  color: 'rgba(255,255,255,0.05)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  pointerEvents: 'none',
  zIndex: -1,
}
const kicker: CSSProperties = {
  margin: '0 0 14px',
  fontSize: 13,
  letterSpacing: '0.34em',
  color: 'rgba(255,255,255,0.55)',
}
const bigText: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(48px, 8.5vw, 132px)',
  fontWeight: 800,
  lineHeight: 0.96,
  letterSpacing: '-0.01em',
  color: '#fff',
  textShadow: '0 12px 50px rgba(0,0,0,0.45)',
}
const subline: CSSProperties = { margin: '22px 0 0', fontSize: 'clamp(15px, 1.6vw, 19px)', color: 'rgba(255,255,255,0.82)' }
const countNum: CSSProperties = {
  fontWeight: 800,
  fontSize: '1.45em',
  background: 'linear-gradient(90deg, #6FA9F0, #C98BD8)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  padding: '0 3px',
}
const enterBtn: CSSProperties = {
  marginTop: 30,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '13px 30px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.32)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
}

const bottomBar: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 26,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 22,
}
const partLabel: CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.6)' }
const scrollHint: CSSProperties = { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }
const mouseIcon: CSSProperties = {
  width: 18,
  height: 28,
  borderRadius: 10,
  border: '1.5px solid rgba(255,255,255,0.5)',
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 5,
}
const mouseDot: CSSProperties = { width: 3, height: 6, borderRadius: 2, background: 'rgba(255,255,255,0.8)' }
