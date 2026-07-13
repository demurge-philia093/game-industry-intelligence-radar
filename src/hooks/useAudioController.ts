import { useCallback, useRef, useState, type SyntheticEvent } from 'react'

/**
 * 单一音频元素的共享控制器。
 * 章节导航、播放器、文字稿三处共用同一个 <audio>，都通过这里 seek / 读时间。
 */
export function useAudioController() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  const seekTo = useCallback((t: number, autoplay = true) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = t
    setCurrentTime(t)
    if (autoplay) void a.play().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play().catch(() => {})
    else a.pause()
  }, [])

  const skip = useCallback((delta: number) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(a.duration || Infinity, a.currentTime + delta))
    setCurrentTime(a.currentTime)
  }, [])

  // 直接挂到 <audio> 上的稳定事件处理器；从事件读取元素，避免渲染期间接读取 ref。
  const onTimeUpdate = useCallback((event: SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(event.currentTarget.currentTime)
  }, [])
  const onLoadedMetadata = useCallback((event: SyntheticEvent<HTMLAudioElement>) => {
    setDuration(event.currentTarget.duration)
    setReady(true)
  }, [])
  const onPlay = useCallback(() => setPlaying(true), [])
  const onPause = useCallback(() => setPlaying(false), [])
  const onEnded = useCallback(() => setPlaying(false), [])

  return {
    currentTime,
    duration,
    playing,
    ready,
    seekTo,
    toggle,
    skip,
    audioRef,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
  }
}

export type AudioController = ReturnType<typeof useAudioController>
