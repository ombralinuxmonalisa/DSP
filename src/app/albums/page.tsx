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

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchAlbums()
  }, [])

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

  const filteredAlbums = filter === 'ALL' ? albums : albums.filter((a) => a.releaseType === filter)

  return (
    <main style={{ paddingTop: '80px', paddingBottom: '100px', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '48px 24px' }}>
        <h1
          className="animate-slide-up"
          style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '32px' }}
        >
          MUSIC
        </h1>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {['ALL', 'ALBUM', 'EP', 'SINGLE', 'DELUXE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 16px',
                fontSize: '10px',
                border: '1px solid #000',
                background: filter === type ? '#000' : '#fff',
                color: filter === type ? '#fff' : '#000',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>LOADING...</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} onPlay={handlePlay} />
            ))}
          </div>
        )}
      </div>

      <AudioPlayer currentTrack={currentTrack} playlist={playlist} onTrackEnd={handleTrackEnd} />
    </main>
  )
}