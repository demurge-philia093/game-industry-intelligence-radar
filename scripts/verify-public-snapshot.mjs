import { readFile, readdir } from 'node:fs/promises'

const dataDirectory = new URL('../public/data/', import.meta.url)

function detailBucket(id) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0
  }
  return (hash % 64).toString(16).padStart(2, '0')
}

function fail(message) {
  throw new Error(`snapshot verification failed: ${message}`)
}

function collectStrings(value, output) {
  if (typeof value === 'string') {
    output.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStrings(entry, output)
    return
  }
  if (!value || typeof value !== 'object') return
  for (const entry of Object.values(value)) collectStrings(entry, output)
}

const index = JSON.parse(await readFile(new URL('feed.json', dataDirectory), 'utf8'))
if (!Array.isArray(index) || index.length !== 5202) fail(`expected 5202 index records, got ${index.length}`)
const indexIds = new Set(index.map((item) => item.id))
if (indexIds.size !== index.length) fail(`expected ${index.length} unique index ids, got ${indexIds.size}`)

const detailDirectory = new URL('details/', dataDirectory)
const files = (await readdir(detailDirectory)).filter((name) => name.endsWith('.json')).sort()
if (files.length !== 64) fail(`expected 64 detail shards, got ${files.length}`)

const chunks = new Map()
const detailIds = new Set()
const detailStrings = []
let detailCount = 0

for (const file of files) {
  const bucket = file.slice(0, -5)
  const chunk = JSON.parse(await readFile(new URL(file, detailDirectory), 'utf8'))
  chunks.set(bucket, chunk)
  for (const [id, item] of Object.entries(chunk)) {
    if (id !== item.id) fail(`detail key/id mismatch for ${id}`)
    if (detailIds.has(id)) fail(`duplicate detail id ${id}`)
    if (detailBucket(id) !== bucket) fail(`detail ${id} is in the wrong shard`)
    if (item.payload && typeof item.payload === 'object' && 'raw_ref' in item.payload) {
      fail(`internal raw_ref field remains on ${id}`)
    }
    if ('matched_keywords' in item || 'transcript_status' in item) {
      fail(`private task metadata remains on ${id}`)
    }
    detailIds.add(id)
    detailCount += 1
  }
  collectStrings(chunk, detailStrings)
}

if (detailCount !== index.length) fail(`index/detail count mismatch ${index.length}/${detailCount}`)
if (detailIds.size !== index.length) fail(`expected ${index.length} unique detail ids, got ${detailIds.size}`)
for (const id of detailIds) {
  if (!indexIds.has(id)) fail(`orphan detail id ${id}`)
}

for (const item of index) {
  const detail = chunks.get(detailBucket(item.id))?.[item.id]
  if (!detail) fail(`missing detail for ${item.id}`)
  for (const key of ['source_type', 'source_name', 'title', 'published_at', 'ingested_at']) {
    if (item[key] !== detail[key]) fail(`index/detail ${key} mismatch for ${item.id}`)
  }
}

const expectedTypes = [
  'banhao',
  'entity',
  'entity_change',
  'news',
  'podcast',
  'recruitment',
  'trademark',
  'wechat',
]
const actualTypes = [...new Set(index.map((item) => item.source_type))].sort()
if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) fail('source type coverage changed')

const allText = detailStrings.join('\n')
const nonUrlText = detailStrings
  .map((value) => value.replace(/https?:\/\/[^\s<>"']+/giu, ''))
  .join('\n')

const forbiddenPatterns = [
  { label: 'email address', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu, text: allText },
  {
    label: 'mobile contact outside URL',
    pattern: /(?<!\d)1[3-9]\d{9}(?!\d)/u,
    text: nonUrlText,
  },
  {
    label: 'labelled phone contact outside URL',
    pattern: /(?:举报|联系|咨询|电话|热线|tel|phone)[^0-9\r\n]{0,12}(?:0\d{2,3}[-\s]?)?\d{7,8}(?!\d)/iu,
    text: nonUrlText,
  },
  {
    label: 'sensitive URL parameter or fragment',
    pattern: /[?&#](?:token|accessToken|access_token|refresh_token|sessionid|session_id|api_key|apikey|client_secret|auth|authorization|signature)=/iu,
    text: allText,
  },
  { label: 'local file URL', pattern: /file:\/\//iu, text: allText },
  { label: 'macOS/Linux home path', pattern: /\/(?:Users|home)\/[A-Za-z0-9._-]+\//u, text: nonUrlText },
  { label: 'Windows user path', pattern: /[A-Za-z]:\\Users\\/iu, text: nonUrlText },
  { label: 'localhost URL', pattern: /localhost(?=[:/]|$)/iu, text: nonUrlText },
  {
    label: 'GitHub token',
    pattern: /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/u,
    text: allText,
  },
  { label: 'AWS access key', pattern: /AKIA[0-9A-Z]{16}/u, text: allText },
  { label: 'Google API key', pattern: /AIza[0-9A-Za-z_-]{30,}/u, text: allText },
  { label: 'Slack token', pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/u, text: allText },
  { label: 'OpenAI key', pattern: /sk-(?:proj|svcacct)-[A-Za-z0-9_-]{16,}/u, text: allText },
  { label: 'Anthropic key', pattern: /sk-ant-[A-Za-z0-9_-]{16,}/u, text: allText },
  {
    label: 'JWT',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/u,
    text: allText,
  },
  { label: 'Bearer token', pattern: /Bearer\s+[A-Za-z0-9._-]{16,}/iu, text: allText },
  { label: 'private key', pattern: /-----BEGIN .*PRIVATE KEY-----/u, text: allText },
]
for (const { label, pattern, text } of forbiddenPatterns) {
  if (pattern.test(text)) fail(`${label} found`)
}

const filter = JSON.parse(await readFile(new URL('content_filter.json', dataDirectory), 'utf8'))
for (const [id, value] of Object.entries(filter.items ?? {})) {
  const keys = Object.keys(value).sort()
  if (keys.length !== 1 || keys[0] !== 'is_relevant') fail(`private filter metadata remains on ${id}`)
}

const typeCounts = Object.fromEntries(
  actualTypes.map((type) => [type, index.filter((item) => item.source_type === type).length]),
)
console.log(
  JSON.stringify({ indexRecords: index.length, detailRecords: detailCount, shards: files.length, typeCounts }),
)
