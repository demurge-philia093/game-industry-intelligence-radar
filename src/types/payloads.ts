/*
 * 各信源的 payload 形状 —— 对应 PRD §3.2。
 *
 * 新增一种信源时，只需在这里加一个 payload interface，
 * 再写它的 Card / Detail 组件并在注册表登记，无需改动已有信源。
 */

/* ---------------- podcast（本期重点，完整定义） ---------------- */

export interface Person {
  /** host / guest；采集阶段不自动判定时留空（''），由用户后续标注。 */
  role: 'host' | 'guest' | ''
  name: string
  /** 头像 url，可空 */
  avatar: string | null
  affiliation: string
  bio: string
}

export interface Chapter {
  /** 章节起始秒数（来自节目时间轴） */
  start: number
  title: string
}

export interface TranscriptSegment {
  start: number
  end: number
  /** 分离算法给的原始标签，如 S1 / S2 */
  speaker: string
  /** 人工映射后的真名，可与 people 对应 */
  speaker_name: string
  text: string
}

export interface PodcastPayload {
  audio_url: string
  duration_seconds: number
  /** 节目简介 + 本期背景，markdown */
  background: string
  people: Person[]
  /** 可空；有则在详情页作为锚点导航 */
  chapters: Chapter[]
  /** 按时间戳排序的分说话人段落数组 */
  transcript: TranscriptSegment[]
}

/* ---------------- news ---------------- */

export interface ExtractedTerm {
  term: string
  /** 是否在此条目首次出现（“新词诞生”信号） */
  first_seen_here: boolean
  note: string
}

export interface NewsPayload {
  excerpt: string
  /** 正文，markdown */
  body: string
  extracted_terms: ExtractedTerm[]
}

/* ---------------- wechat（公众号，结构同 news + 可选 author） ---------------- */

export interface WechatPayload {
  excerpt: string
  body: string
  /** 作者 / 公众号名 */
  author?: string
  extracted_terms?: ExtractedTerm[]
}

/* ---------------- banhao（版号审批，来自 NPPA 国家新闻出版署） ---------------- */

export interface BanhaoGame {
  game_name: string
  /** 申报类别，如「移动」「移动、客户端」，可空 */
  category_declared: string
  /** 出版单位 */
  publisher: string
  /** 运营单位（按公司打标的核心字段） */
  operator: string
  /** 识别到的游戏集团；未识别留空（绝大多数为长尾小厂） */
  company_group: string
  /** 批复文号 */
  approval_doc: string
  isbn: string
  approval_date: string
  /** 真实审批月 YYYY-MM（进口为累积页时，按它而非公示月看真实月份） */
  approval_month: string
  /** 仅「审批变更」类有：变更内容（如「原申报版本增加客户端」） */
  change_info?: string
}

export interface BanhaoPayload {
  /** 五类之一：国产网络游戏 / 进口网络游戏 / 审批变更信息 / 审批撤销信息 / 进口电子游戏 */
  approval_type: string
  total: number
  /** 该批次识别到的集团及其款数（按款数降序，未识别不计入） */
  by_company: { group: string; count: number }[]
  games: BanhaoGame[]
}

/* ---------------- 商业实体 · entity（工商主体，天眼查） ---------------- */

export interface Shareholder { name: string; ratio: string; amount: string }
export interface Investment { name: string; credit_code: string; ratio: string; status: string }
export interface Branch { name: string }

export interface EntityPayload {
  legal_name: string
  credit_code: string
  reg_number: string
  legal_rep: string
  reg_capital: string
  paid_capital: string
  establish_date: string
  status: string
  company_type: string
  address: string
  business_scope: string
  jurisdiction: string
  /** 上级主体信用代码（受控子公司挂其控制根）；根 / 海外占位为 null */
  parent: string | null
  group_key: string
  shareholders: Shareholder[]
  investments: Investment[]
  branches: Branch[]
  overseas_curated: boolean
  source_fetched_at: string
  /** 生产管线内部引用；公开快照中省略。 */
  raw_ref?: string
}

/* ---------------- 商业实体 · entity_change（工商变更，意图层信号） ---------------- */

export interface EntityChangePayload {
  entity_credit_code: string
  change_item: string
  before: string
  after: string
  change_date: string
  group_key: string
  detected_at: string
  /** 生产管线内部引用；公开快照中省略。 */
  raw_ref?: string
}

/* ---------------- 商业实体 · trademark（商标，国家知识产权局/天眼查） ---------------- */

export interface TrademarkPayload {
  applicant: string
  reg_no: string
  int_cls: string
  tm_class: string
  status: string
  app_date: string
  latest_event: string
  latest_event_date: string
  group_key: string
  source_fetched_at: string
  /** 生产管线内部引用；公开快照中省略。 */
  raw_ref?: string
}

/* ---------------- 商业实体 · recruitment（招聘，天眼查快照·非实时） ---------------- */

export interface RecruitmentPayload {
  company: string
  position_title: string
  origin: string
  education: string
  experience: string
  salary: string
  /** 天眼查「开始日期」原值（偏旧快照，非实时） */
  publish_date: string
  url: string
  group_key: string
  /** 本次快照采集时刻（区别于 publish_date） */
  snapshot_fetched_at: string
  /** 生产管线内部引用；公开快照中省略。 */
  raw_ref?: string
}
