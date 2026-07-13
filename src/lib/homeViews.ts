import type { SourceType } from '../types/envelope'

export const TODAY_ADDED_VIEW = '最新演示'
const LEGACY_TODAY_ADDED_VIEW = '今日新增'
export const LEGACY_SUMMARY_VIEW = '汇总'
export const HOME_DEFAULT_VIEW = TODAY_ADDED_VIEW
export const HOME_DEFAULT_URL = `/?view=${HOME_DEFAULT_VIEW}`

export const SOURCE_LABEL: Record<string, string> = {
  podcast: '播客',
  news: '新闻',
  wechat: '公众号',
  banhao: '版号',
  entity: '工商档案',
  trademark: '商标',
  recruitment: '招聘',
  entity_change: '变更',
  商业实体: '商业实体',
}

export const ENTITY_SUBMODULES: SourceType[] = ['entity', 'trademark', 'recruitment', 'entity_change']

export interface HomeContentGroup {
  key: string
  label: string
  sourceTypes: SourceType[]
}

export const HOME_CONTENT_GROUPS: HomeContentGroup[] = [
  { key: 'podcast', label: SOURCE_LABEL.podcast, sourceTypes: ['podcast'] },
  { key: 'news', label: SOURCE_LABEL.news, sourceTypes: ['news'] },
  { key: 'wechat', label: SOURCE_LABEL.wechat, sourceTypes: ['wechat'] },
  { key: 'banhao', label: SOURCE_LABEL.banhao, sourceTypes: ['banhao'] },
  { key: SOURCE_LABEL.商业实体, label: SOURCE_LABEL.商业实体, sourceTypes: ENTITY_SUBMODULES },
]

/** 一级大类中，仅商业实体聚合多个 source_type；其余大类仍按自身 source_type 处理。 */
export const MODULE_GROUPS: Record<string, SourceType[]> = {
  [SOURCE_LABEL.商业实体]: ENTITY_SUBMODULES,
}

export function normalizeHomeView(view: string | null): string {
  if (!view || view === LEGACY_SUMMARY_VIEW || view === LEGACY_TODAY_ADDED_VIEW) return HOME_DEFAULT_VIEW
  return view
}
