import { AudioLines, FileText } from 'lucide-react'
import type { Person, TranscriptSegment } from '../../types/payloads'
import { Transcript } from './Transcript'

interface TranscriptSectionProps {
  transcript: TranscriptSegment[]
  people: Person[]
  currentTime: number
  playing: boolean
  seekEnabled: boolean
  onSeek: (t: number) => void
}

/**
 * GitHub Pages 公开快照的只读文字稿。
 * 公开站不启动转写任务、不轮询进度，也不会连接访问者电脑上的本地服务。
 */
export function TranscriptSection({
  transcript,
  people,
  currentTime,
  playing,
  seekEnabled,
  onSeek,
}: TranscriptSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <AudioLines size={16} className="text-[var(--signal)]" />
        <h2 className="font-serif text-lg font-medium tracking-tight text-[var(--text-h)]">
          文字稿
        </h2>
        <span className="text-xs text-[var(--text-faint)]">
          {seekEnabled ? '公开快照 · 点击时间跳转' : '公开快照 · 静态文字稿'}
        </span>
      </div>

      {transcript.length > 0 ? (
        <Transcript
          segments={transcript}
          people={people}
          currentTime={currentTime}
          playing={playing}
          seekEnabled={seekEnabled}
          onSeek={onSeek}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-2)] px-4 py-8 text-center text-sm leading-relaxed text-[var(--text-dim)]">
          <FileText size={24} className="mx-auto mb-3 text-[var(--text-faint)]" />
          该条目未附文字稿。公开站为纯静态只读版本，不提供在线转写功能。
        </div>
      )}
    </div>
  )
}
