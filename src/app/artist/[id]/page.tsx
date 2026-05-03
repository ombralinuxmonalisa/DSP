'use client'

import { useState, useEffect, use } from 'react'
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

interface Artist {
  id: string
  name: string
  bio: string | null
  image: string | null
  albums: Album[]
}

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchArtist()
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

  const fetchArtist = async () => {
    try {
      const res = await fetch('/api/artists')
      if (res.ok) {
        const data = await res.json()
        const found = data.find((a: Artist) => a.id === id)
        if (found) {
          setArtist(found)
        }
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
    if (!currentTrack) return
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1])
    }
  }

  if (loading) {
    return (
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Navbar isAdmin={isAdmin} />
        <div style={{ padding: '48px', textAlign: 'center' }}>LOADING...</div>
      </main>
    )
  }

  if (!artist) {
    return (
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Navbar isAdmin={isAdmin} />
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', opacity: 0.5 }}>ARTIST NOT FOUND</p>
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
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              background: '#f0f0f0',
              flexShrink: 0
            }}
          >
            {artist.image ? (
              <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '48px', fontWeight: 700 }}>{artist.name[0]}</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>ARTIST</p>
            <h1 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-2px', marginBottom: '16px' }}>
              {artist.name}
            </h1>
            {artist.bio && (
              <p style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '500px', opacity: 0.7 }}>
                {artist.bio}
              </p>
            )}
          </div>
        </div>

        {artist.albums.length > 0 && (
          <div className="animate-slide-up">
            <h2 style={{ fontSize: '12px', fontWeight: 600, opacity: 0.5, marginBottom: '24px' }}>
              RELEASES
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px'
              }}
            >
              {artist.albums.map((album) => (
                <AlbumCard key={album.id} album={album} onPlay={handlePlay} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AudioPlayer currentTrack={currentTrack} playlist={playlist} onTrackEnd={handleTrackEnd} />
    </main>
  )
}