import { Play, Pause, RotateCcw, RotateCw, VolumeX } from 'lucide-react'
import type { AudioController } from '../../hooks/useAudioController'
import { formatTime } from '../../lib/format'

/**
 * 自定义音频播放器，驱动一个原生 <audio> 元素。
 * 与章节导航、文字稿共享同一个 controller。
 */
export function PodcastPlayer({
  src,
  controller,
}: {
  src?: string | null
  controller: AudioController
}) {
  if (!src?.trim()) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-2)] px-4 py-3 text-sm text-[var(--text-dim)]"
        style={{ boxShadow: 'var(--shadow)' }}
        role="status"
      >
        <VolumeX size={18} className="shrink-0 text-[var(--text-faint)]" />
        演示版未附音频，可继续浏览章节与文字稿。
      </div>
    )
  }

  const {
    currentTime,
    duration,
    playing,
    toggle,
    skip,
    seekTo,
    audioRef,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
  } = controller
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-2)] px-3 py-2.5 sm:gap-4 sm:px-4"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      <audio
        src={src}
        preload="metadata"
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />

      <button
        type="button"
        onClick={() => skip(-15)}
        className="hidden text-[var(--text-dim)] transition-colors hover:text-[var(--text-h)] sm:block"
        title="后退 15 秒"
      >
        <RotateCcw size={18} />
      </button>

      <button
        type="button"
        onClick={toggle}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#ffffff] transition-transform hover:scale-105"
        style={{ background: 'var(--signal)' }}
        title={playing ? '暂停' : '播放'}
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={() => skip(15)}
        className="hidden text-[var(--text-dim)] transition-colors hover:text-[var(--text-h)] sm:block"
        title="前进 15 秒"
      >
        <RotateCw size={18} />
      </button>

      <span className="w-12 shrink-0 text-right font-mono text-xs text-[var(--text-dim)]">
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seekTo(Number(e.target.value), false)}
        className="player-range h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(--signal) ${pct}%, var(--border-strong) ${pct}%)`,
        }}
      />

      <span className="w-12 shrink-0 font-mono text-xs text-[var(--text-faint)]">
        {formatTime(duration)}
      </span>
    </div>
  )
}
