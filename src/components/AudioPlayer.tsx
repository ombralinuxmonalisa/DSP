'use client'

import { useState, useRef, useEffect } from 'react'

interface Track {
  id: string
  title: string
  audioUrl: string
  duration: number | null
  position: number
  artist: { id: string; name: string }
  album: { id: string; title: string; coverImage: string | null }
}

interface AudioPlayerProps {
  currentTrack: Track | null
  playlist: Track[]
  onTrackEnd: () => void
}

export default function AudioPlayer({ currentTrack, playlist, onTrackEnd }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioUrl
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      }
    }
  }, [currentTrack])

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    onTrackEnd()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentTrack) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #000',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        zIndex: 1000
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ color: '#fff', fontSize: '10px' }}>ART</span>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600 }}>{currentTrack.title}</p>
          <p style={{ fontSize: '10px', opacity: 0.6 }}>{currentTrack.artist.name}</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={togglePlay}
            style={{
              width: '32px',
              height: '32px',
              background: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s'
            }}
          >
            {isPlaying ? '||' : '>'}
          </button>
          <span style={{ fontSize: '10px', minWidth: '40px' }}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              height: '4px',
              WebkitAppearance: 'none',
              background: '#e0e0e0',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '10px', minWidth: '40px' }}>{formatTime(duration)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px' }}>VOL</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            width: '80px',
            height: '4px',
            WebkitAppearance: 'none',
            background: '#e0e0e0',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  )
}