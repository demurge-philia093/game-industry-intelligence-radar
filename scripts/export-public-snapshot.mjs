import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const [feedInput, feedOutput, filterInput, filterOutput] = process.argv.slice(2)

if (!feedInput || !feedOutput) {
  console.error(
    'Usage: node scripts/export-public-snapshot.mjs <feed-input> <feed-output> [filter-input] [filter-output]',
  )
  process.exit(1)
}

if ((filterInput && !filterOutput) || (!filterInput && filterOutput)) {
  console.error('filter-input and filter-output must be provided together')
  process.exit(1)
}

const sensitiveQueryKeys = new Set([
  'token',
  'accesstoken',
  'access_token',
  'refresh_token',
  'refreshtoken',
  'sessionid',
  'session_id',
  'api_key',
  'apikey',
  'client_secret',
  'clientsecret',
  'auth',
  'authorization',
  'secret',
  'sig',
  'sign',
  'signature',
])

const urlFieldNames = new Set(['original_url', 'cover_image', 'audio_url', 'url', 'avatar'])
const identifierFieldNames = new Set([
  'id',
  'credit_code',
  'entity_credit_code',
  'reg_no',
  'reg_number',
  'group_key',
])

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu

const stats = {
  rawRefs: 0,
  privateFields: 0,
  localAudioPaths: 0,
  queryParams: 0,
  emails: 0,
  contacts: 0,
}

function sanitizeUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return value

  try {
    const url = new URL(value)
    let changed = false
    for (const key of [...url.searchParams.keys()]) {
      if (!sensitiveQueryKeys.has(key.toLowerCase())) continue
      stats.queryParams += url.searchParams.getAll(key).length
      url.searchParams.delete(key)
      changed = true
    }
    if (/[#?&](?:token|accessToken|access_token|refresh_token|sessionid|api_key|apikey|client_secret|auth|signature)=/iu.test(url.hash)) {
      stats.queryParams += 1
      url.hash = ''
      changed = true
    }
    const normalized = changed ? url.toString() : value
    return normalized.replace(emailPattern, () => {
      stats.emails += 1
      return 'email-redacted'
    })
  } catch {
    return value
  }
}

function sanitizeNestedContent(value, key = '') {
  if (typeof value === 'string') {
    if (urlFieldNames.has(key)) return sanitizeUrl(value)
    if (identifierFieldNames.has(key)) return value
    return sanitizeText(value)
  }
  if (Array.isArray(value)) return value.map((entry) => sanitizeNestedContent(entry, key))
  if (!value || typeof value !== 'object') return value

  for (const [childKey, childValue] of Object.entries(value)) {
    value[childKey] = sanitizeNestedContent(childValue, childKey)
  }
  return value
}

function sanitizeText(value) {
  if (typeof value !== 'string' || value.length === 0) return value

  const protectedUrls = []
  let text = value.replace(/https?:\/\/[^\s<>"'）)\]}]+/giu, (url) => {
    const marker = `\u0000PUBLIC_URL_${protectedUrls.length}\u0000`
    protectedUrls.push(sanitizeUrl(url))
    return marker
  })

  text = text.replace(emailPattern, () => {
    stats.emails += 1
    return '[邮箱已隐去]'
  })

  text = text.replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, () => {
    stats.contacts += 1
    return '[联系方式已隐去]'
  })

  text = text.replace(
    /((?:举报|联系|咨询|电话|热线|tel|phone)[^0-9]{0,12})(?:0\d{2,3}[-\s]?)?\d{7,8}(?!\d)/giu,
    (_match, prefix) => {
      stats.contacts += 1
      return `${prefix}[联系方式已隐去]`
    },
  )

  return text.replace(/\u0000PUBLIC_URL_(\d+)\u0000/g, (_marker, index) => protectedUrls[Number(index)])
}

function sanitizeFeedItem(item) {
  if (!item || typeof item !== 'object') return item

  if ('matched_keywords' in item) {
    delete item.matched_keywords
    stats.privateFields += 1
  }
  if ('transcript_status' in item) {
    delete item.transcript_status
    stats.privateFields += 1
  }

  item.original_url = sanitizeUrl(item.original_url)
  if (typeof item.cover_image === 'string') item.cover_image = sanitizeUrl(item.cover_image)
  item.deep_summary = sanitizeText(item.deep_summary)

  const payload = item.payload
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return item

  if ('raw_ref' in payload) {
    if (payload.raw_ref) stats.rawRefs += 1
    delete payload.raw_ref
  }

  if (item.source_type === 'podcast' && typeof payload.audio_url === 'string') {
    if (payload.audio_url.startsWith('/')) {
      payload.audio_url = ''
      stats.localAudioPaths += 1
    } else {
      payload.audio_url = sanitizeUrl(payload.audio_url)
    }
  }

  if (typeof payload.url === 'string') payload.url = sanitizeUrl(payload.url)

  for (const key of ['body', 'excerpt', 'background']) {
    if (typeof payload[key] === 'string') payload[key] = sanitizeText(payload[key])
  }

  if (Array.isArray(payload.transcript)) {
    for (const segment of payload.transcript) {
      if (segment && typeof segment.text === 'string') segment.text = sanitizeText(segment.text)
    }
  }

  return sanitizeNestedContent(item)
}

function sanitizeContentFilter(data) {
  if (!data || typeof data !== 'object' || !data.items || typeof data.items !== 'object') return data

  data.items = Object.fromEntries(
    Object.entries(data.items).map(([id, value]) => [
      id,
      { is_relevant: value && typeof value === 'object' ? value.is_relevant : undefined },
    ]),
  )
  return data
}

function detailBucket(id) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0
  }
  return (hash % 64).toString(16).padStart(2, '0')
}

function toFeedIndexItem(item) {
  return {
    id: item.id,
    source_type: item.source_type,
    source_name: item.source_name,
    title: item.title,
    published_at: item.published_at,
    ingested_at: item.ingested_at,
    deep_summary: item.deep_summary,
    tags: item.tags,
    entities: item.entities,
    payload: {
      excerpt:
        item.payload && typeof item.payload === 'object' && typeof item.payload.excerpt === 'string'
          ? item.payload.excerpt
          : '',
    },
  }
}

const feed = JSON.parse(await readFile(feedInput, 'utf8'))
if (!Array.isArray(feed)) throw new TypeError('feed input must be an array')

for (const item of feed) sanitizeFeedItem(item)

const detailsDirectory = join(dirname(feedOutput), 'details')
const detailChunks = new Map()
for (const item of feed) {
  const bucket = detailBucket(item.id)
  const chunk = detailChunks.get(bucket) ?? {}
  chunk[item.id] = item
  detailChunks.set(bucket, chunk)
}

await rm(detailsDirectory, { recursive: true, force: true })
await mkdir(detailsDirectory, { recursive: true })
await writeFile(feedOutput, `${JSON.stringify(feed.map(toFeedIndexItem), null, 2)}\n`)
for (let index = 0; index < 64; index += 1) {
  const bucket = index.toString(16).padStart(2, '0')
  await writeFile(
    join(detailsDirectory, `${bucket}.json`),
    `${JSON.stringify(detailChunks.get(bucket) ?? {}, null, 2)}\n`,
  )
}

if (filterInput && filterOutput) {
  const filter = JSON.parse(await readFile(filterInput, 'utf8'))
  await writeFile(filterOutput, `${JSON.stringify(sanitizeContentFilter(filter), null, 2)}\n`)
}

console.log(JSON.stringify({ records: feed.length, detailChunks: detailChunks.size, ...stats }))
