/** 返回可安全作为外链展示的绝对 HTTP(S) URL；其余输入一律视为不可用。 */
export function getHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
