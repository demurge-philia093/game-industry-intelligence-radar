/* 通用格式化工具。 */

/** 秒 → mm:ss 或 h:mm:ss */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** 秒 → “约 48 分钟” / “1 小时 12 分钟” */
export function formatDuration(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60)
  if (m < 60) return `约 ${m} 分钟`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} 小时 ${rest} 分钟` : `${h} 小时`
}

/**
 * ISO 8601 → “2026-05-28”。
 * 按信源自带的时区显示（直接取 ISO 字符串里的日期部分），
 * 而非观看者本地时区——这对按发布时区组织的情报更忠实，也避免跨时区的 ±1 天偏移。
 */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** ISO 8601 → 相对时间，如 “3 天前” */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return iso
  const diff = Math.max(0, now - t)
  const day = 86_400_000
  const days = Math.floor(diff / day)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 30) return `${days} 天前`
  if (days < 365) return `${Math.floor(days / 30)} 个月前`
  return `${Math.floor(days / 365)} 年前`
}
