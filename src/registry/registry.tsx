/*
 * 信源类型渲染器注册表 —— 对应 PRD §2 的核心架构决策。
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 如何新增一种信源（不改动任何已有信源 / 首页）：                    │
 * │   1. 在 types/payloads.ts 定义该类型的 payload 形状，            │
 * │      并把它并入 types/envelope.ts 的 FeedItem 联合类型。         │
 * │   2. 写一个 DetailComponent（详情页）。                          │
 * │   3. 在下方 SourceTypeRegistry 里登记一行，并在 registry/meta.ts │
 * │      里补一条 label / icon / accent。                            │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 注：列表卡片现由 home/SourceFeed 统一渲染（通用卡，按 envelope 通用字段），
 * 不再走 per-type Card 组件；故注册表只保留 Detail。
 */

import type { ComponentType } from 'react'
import type { FeedItem } from '../types/envelope'
import { SOURCE_META, type SourceMeta } from './meta'

import { PodcastDetail } from '../components/details/PodcastDetail'
import { NewsDetail } from '../components/details/NewsDetail'
import { WechatDetail } from '../components/details/WechatDetail'
import { BanhaoDetail } from '../components/details/BanhaoDetail'
import { EntityDetail } from '../components/details/EntityDetail'
import { EntityChangeDetail } from '../components/details/EntityChangeDetail'
import { TrademarkDetail } from '../components/details/TrademarkDetail'
import { RecruitmentDetail } from '../components/details/RecruitmentDetail'

export interface DetailProps {
  item: FeedItem
}

export interface SourceRenderer extends SourceMeta {
  Detail: ComponentType<DetailProps>
}

export const SourceTypeRegistry: Record<string, SourceRenderer> = {
  podcast: { ...SOURCE_META.podcast, Detail: PodcastDetail },
  news: { ...SOURCE_META.news, Detail: NewsDetail },
  wechat: { ...SOURCE_META.wechat, Detail: WechatDetail },
  banhao: { ...SOURCE_META.banhao, Detail: BanhaoDetail },
  entity: { ...SOURCE_META.entity, Detail: EntityDetail },
  entity_change: { ...SOURCE_META.entity_change, Detail: EntityChangeDetail },
  trademark: { ...SOURCE_META.trademark, Detail: TrademarkDetail },
  recruitment: { ...SOURCE_META.recruitment, Detail: RecruitmentDetail },
  // 新增信源在此登记 ↑
}

/** 注册表登记的信源类型顺序（首页分区按此顺序渲染）。 */
export const REGISTERED_TYPES = Object.keys(SourceTypeRegistry)

export function getRenderer(type: string): SourceRenderer | undefined {
  return SourceTypeRegistry[type]
}
