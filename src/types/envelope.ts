/*
 * 通用外层 envelope —— 对应 PRD §3.1。
 * 每个条目无论信源类型，都共用这一层；列表、筛选、搜索、排序等通用功能
 * 只依赖这些字段，因此对任何信源都生效。
 */

import type {
  PodcastPayload,
  NewsPayload,
  WechatPayload,
  BanhaoPayload,
  EntityPayload,
  EntityChangePayload,
  TrademarkPayload,
  RecruitmentPayload,
} from './payloads'

/** 已登记的信源类型。新增信源时在这里扩一个字面量即可。 */
export type SourceType =
  | 'podcast'
  | 'news'
  | 'wechat'
  | 'banhao'
  | 'entity'
  | 'entity_change'
  | 'trademark'
  | 'recruitment'

export interface Entities {
  /** 提及的作品名 */
  works: string[]
  /** 提及的公司 / 机构 */
  companies: string[]
}

/** 通用外层字段（不含 payload）。 */
export interface BaseEnvelope {
  id: string
  source_type: SourceType
  source_name: string
  title: string
  original_url: string
  /** 必填，带时区 ISO 8601。全系统按它排序 / 按时间筛选。 */
  published_at: string
  ingested_at: string
  cover_image: string | null
  tags: string[]
  entities: Entities
  /** LLM 生成的深度总结（markdown）。前端原样渲染，不再生成。 */
  deep_summary: string
  /**
   * 转写状态：驱动面板的「待转写 / 转写中 / 已完成 / 失败」显示与任务流转。
   * 可选——旧条目可能没有此字段（视为未设置）。
   */
  transcript_status?: 'pending' | 'processing' | 'done' | 'failed'
  /** 该节目命中了哪些关键词（采集时记录，用于去重合并与展示）。 */
  matched_keywords?: string[]
}

/** 带类型化 payload 的完整条目。 */
export interface Envelope<P = unknown> extends BaseEnvelope {
  payload: P
}

/* 每种信源 = 外层 + 自己的 payload。 */
export type PodcastItem = Envelope<PodcastPayload> & { source_type: 'podcast' }
export type NewsItem = Envelope<NewsPayload> & { source_type: 'news' }
export type WechatItem = Envelope<WechatPayload> & { source_type: 'wechat' }
export type BanhaoItem = Envelope<BanhaoPayload> & { source_type: 'banhao' }
export type EntityItem = Envelope<EntityPayload> & { source_type: 'entity' }
export type EntityChangeItem = Envelope<EntityChangePayload> & { source_type: 'entity_change' }
export type TrademarkItem = Envelope<TrademarkPayload> & { source_type: 'trademark' }
export type RecruitmentItem = Envelope<RecruitmentPayload> & { source_type: 'recruitment' }

/** 数据文件里的条目联合类型。 */
export type FeedItem =
  | PodcastItem
  | NewsItem
  | WechatItem
  | BanhaoItem
  | EntityItem
  | EntityChangeItem
  | TrademarkItem
  | RecruitmentItem
