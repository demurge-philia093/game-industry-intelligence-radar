import { Clock, BookOpen } from 'lucide-react'
import type { FeedItem } from '../../types/envelope'
import type { PodcastPayload } from '../../types/payloads'
import { useAudioController } from '../../hooks/useAudioController'
import { formatDuration } from '../../lib/format'
import { Panel } from '../common/ui'
import { Markdown } from '../common/Markdown'
import { DeepSummary } from '../common/DeepSummary'
import { DetailHeader } from './DetailHeader'
import { People } from './People'
import { Chapters } from './Chapters'
import { PodcastPlayer } from './PodcastPlayer'
import { TranscriptSection } from './TranscriptSection'

export function PodcastDetail({ item }: { item: FeedItem }) {
  const p = item.payload as PodcastPayload
  const audio = useAudioController()
  const hasAudio = typeof p.audio_url === 'string' && p.audio_url.trim().length > 0

  return (
    <div className="flex flex-col gap-6">
      <DetailHeader
        item={item}
        extra={
          <span className="inline-flex items-center gap-1">
            {hasAudio ? (
              <>
                <Clock size={13} />
                {formatDuration(p.duration_seconds)}
              </>
            ) : (
              '静态快照'
            )}
          </span>
        }
      />

      {/* 背景信息框 */}
      {p.background && (
        <Panel className="p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--text-dim)]" />
            <h2 className="font-serif text-lg font-medium tracking-tight text-[var(--text-h)]">
              背景
            </h2>
          </div>
          <Markdown>{p.background}</Markdown>
        </Panel>
      )}

      {/* 嘉宾介绍 */}
      <People people={p.people} />

      {/* 深度总结（突出，置于文字稿之前） */}
      <DeepSummary markdown={item.deep_summary} />

      {/* 章节 + 播放器（若快照数据附带）+ 只读文字稿 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1">
          <div className="sticky top-[68px] z-20">
            <PodcastPlayer src={p.audio_url} controller={audio} />
          </div>
          <TranscriptSection
            transcript={p.transcript}
            people={p.people}
            currentTime={audio.currentTime}
            playing={audio.playing}
            seekEnabled={hasAudio}
            onSeek={(t) => audio.seekTo(t)}
          />
        </div>

        {p.chapters.length > 0 && (
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-[68px]">
              <Panel className="p-4">
                <Chapters
                  chapters={p.chapters}
                  currentTime={audio.currentTime}
                  seekEnabled={hasAudio}
                  onSeek={(t) => audio.seekTo(t)}
                />
              </Panel>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
