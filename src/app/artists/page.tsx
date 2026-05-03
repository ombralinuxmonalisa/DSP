'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Artist {
  id: string
  name: string
  bio: string | null
  image: string | null
  albums: { id: string; title: string; coverImage: string | null; releaseType: string }[]
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/artists')
      if (res.ok) {
        const data = await res.json()
        setArtists(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '48px 24px' }}>
        <h1
          className="animate-slide-up"
          style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '48px' }}
        >
          ARTISTS
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>LOADING...</div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}
          >
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  gap: '24px',
                  padding: '24px',
                  border: '1px solid #000',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{artist.name[0]}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{artist.name}</h2>
                  {artist.bio && <p style={{ fontSize: '12px', opacity: 0.6 }}>{artist.bio.slice(0, 150)}...</p>}
                  <p style={{ fontSize: '10px', opacity: 0.4, marginTop: '8px' }}>
                    {artist.albums.length} RELEASE{artist.albums.length !== 1 ? 'S' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}