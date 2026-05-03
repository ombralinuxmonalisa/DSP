'use client'

import { useState, useEffect, use } from 'react'
import Navbar from '@/components/Navbar'
import AudioPlayer from '@/components/AudioPlayer'
import Link from 'next/link'

interface Track {
  id: string
  title: string
  audioUrl: string
  duration: number | null
  position: number
  artist: { id: string; name: string }
  album: { id: string; title: string; coverImage: string | null }
}

interface Album {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'DELUXE'
  releaseDate: string | null
  purchaseUrl: string | null
  artist: { id: string; name: string }
  tracks: Track[]
}

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [album, setAlbum] = useState<Album | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchAlbum()
    checkAuth()
  }, [id])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.user?.isAdmin || false)
      }
    } catch {}
  }

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/albums?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setAlbum(data[0])
          setPlaylist(data[0].tracks)
        }
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (track: Track) => {
    setCurrentTrack(track)
  }

  const handleTrackEnd = () => {
    if (!currentTrack || !album) return
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1])
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Navbar isAdmin={isAdmin} />
        <div style={{ padding: '48px', textAlign: 'center' }}>LOADING...</div>
      </main>
    )
  }

  if (!album) {
    return (
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Navbar isAdmin={isAdmin} />
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', opacity: 0.5 }}>ALBUM NOT FOUND</p>
          <Link href="/albums" style={{ fontSize: '12px', textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
            BACK TO MUSIC
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ paddingTop: '80px', paddingBottom: '100px', minHeight: '100vh' }}>
      <Navbar isAdmin={isAdmin} />

      <div style={{ padding: '48px 24px' }}>
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: '48px',
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              width: '300px',
              height: '300px',
              background: '#f0f0f0',
              flexShrink: 0
            }}
          >
            {album.coverImage ? (
              <img src={album.coverImage} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '64px', fontWeight: 700 }}>{album.title[0]}</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>{album.releaseType}</p>
            <h1 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-2px', marginBottom: '8px' }}>
              {album.title}
            </h1>
            <Link
              href={`/artist/${album.artist.id}`}
              style={{ fontSize: '14px', opacity: 0.7, display: 'block', marginBottom: '16px' }}
            >
              {album.artist.name}
            </Link>
            {album.releaseDate && (
              <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '24px' }}>
                {new Date(album.releaseDate).getFullYear()}
              </p>
            )}

            {album.description && (
              <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', maxWidth: '500px' }}>
                {album.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {album.tracks.length > 0 && (
                <button
                  onClick={() => handlePlay(album.tracks[0])}
                  style={{
                    padding: '16px 32px',
                    background: '#000',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {currentTrack ? (currentTrack.audioUrl ? 'PAUSE' : 'PLAY') : 'PLAY'}
                </button>
              )}
              {album.purchaseUrl && (
                <a
                  href={album.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '16px 32px',
                    border: '1px solid #000',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  BUY $
                </a>
              )}
            </div>
          </div>
        </div>

        {album.tracks.length > 0 && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: '12px', fontWeight: 600, opacity: 0.5, marginBottom: '24px' }}>
              {album.tracks.length} TRACK{album.tracks.length !== 1 ? 'S' : ''}
            </h2>
            <div style={{ maxWidth: '800px' }}>
              {album.tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handlePlay(track)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ width: '32px', fontSize: '12px', opacity: 0.5 }}>{index + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{track.title}</p>
                    <p style={{ fontSize: '10px', opacity: 0.5 }}>{track.artist.name}</p>
                  </div>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>
                    {formatDuration(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AudioPlayer currentTrack={currentTrack} playlist={playlist} onTrackEnd={handleTrackEnd} />
    </main>
  )
}