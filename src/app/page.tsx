'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import AlbumCard from '@/components/AlbumCard'
import AudioPlayer from '@/components/AudioPlayer'

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

export default function HomePage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlbums()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.user?.isAdmin || false)
      }
    } catch {}
  }

  const fetchAlbums = async () => {
    try {
      const res = await fetch('/api/albums')
      if (res.ok) {
        const data = await res.json()
        setAlbums(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (track: Track, albumTracks: Track[]) => {
    setPlaylist(albumTracks)
    setCurrentTrack(track)
  }

  const handleTrackEnd = () => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1])
    }
  }

  return (
    <main style={{ paddingTop: '80px', paddingBottom: '100px', minHeight: '100vh' }}>
      <Navbar isAdmin={isAdmin} />

      <div style={{ padding: '48px 24px' }}>
        <header style={{ marginBottom: '48px' }}>
          <h1
            className="animate-slide-up"
            style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-2px', marginBottom: '8px' }}
          >
            DSP
          </h1>
          <p className="animate-slide-up" style={{ fontSize: '14px', opacity: 0.5 }}>
            DIGITAL STREAMING PLATFORM
          </p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>LOADING...</div>
        ) : (
          <>
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '24px', opacity: 0.5 }}>
                LATEST RELEASES
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '24px'
                }}
              >
                {albums.slice(0, 8).map((album) => (
                  <AlbumCard key={album.id} album={album} onPlay={handlePlay} />
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '24px', opacity: 0.5 }}>
                ALL RELEASES
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '24px'
                }}
              >
                {albums.slice(8).map((album) => (
                  <AlbumCard key={album.id} album={album} onPlay={handlePlay} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <AudioPlayer currentTrack={currentTrack} playlist={playlist} onTrackEnd={handleTrackEnd} />
    </main>
  )
}