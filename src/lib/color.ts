/** 半透明背景：accent 颜色按百分比混入透明。 */
export function tint(accent: string, pct: number): string {
  return `color-mix(in srgb, ${accent} ${pct}%, transparent)`
}
