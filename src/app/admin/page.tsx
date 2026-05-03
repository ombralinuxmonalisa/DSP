'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Artist {
  id: string
  name: string
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'albums' | 'artists' | 'tracks'>('albums')
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<{ id: string; title: string; artist: { name: string } }[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    releaseType: 'ALBUM',
    releaseDate: '',
    purchaseUrl: '',
    artistId: '',
    name: '',
    bio: '',
    image: '',
    audioUrl: '',
    duration: 0,
    position: 1,
    albumId: ''
  })
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
    fetchArtists()
    fetchAlbums()
  }, [])

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user?.isAdmin) {
          setIsAdmin(true)
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/artists')
      if (res.ok) {
        const data = await res.json()
        setArtists(data)
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
    } catch {}
  }

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMessage('Album created successfully')
        setFormData({ ...formData, title: '', description: '', coverImage: '', releaseDate: '', purchaseUrl: '' })
        fetchAlbums()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Error creating album')
      }
    } catch {
      setMessage('Error creating album')
    }
  }

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, bio: formData.bio, image: formData.image })
      })

      if (res.ok) {
        setMessage('Artist created successfully')
        setFormData({ ...formData, name: '', bio: '', image: '' })
        fetchArtists()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Error creating artist')
      }
    } catch {
      setMessage('Error creating artist')
    }
  }

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          audioUrl: formData.audioUrl,
          duration: formData.duration || null,
          position: formData.position,
          albumId: formData.albumId,
          artistId: formData.artistId
        })
      })

      if (res.ok) {
        setMessage('Track created successfully')
        setFormData({ ...formData, title: '', audioUrl: '', duration: 0, position: formData.position + 1 })
      } else {
        const data = await res.json()
        setMessage(data.error || 'Error creating track')
      }
    } catch {
      setMessage('Error creating track')
    }
  }

  if (loading) {
    return (
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '48px', textAlign: 'center' }}>LOADING...</div>
      </main>
    )
  }

  return (
    <main style={{ paddingTop: '80px', paddingBottom: '48px', minHeight: '100vh' }}>
      <Navbar isAdmin={true} />

      <div style={{ padding: '48px 24px' }}>
        <h1
          className="animate-slide-up"
          style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '32px' }}
        >
          ADMIN PANEL
        </h1>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {(['albums', 'artists', 'tracks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                fontSize: '10px',
                fontWeight: 600,
                border: '1px solid #000',
                background: activeTab === tab ? '#000' : '#fff',
                color: activeTab === tab ? '#fff' : '#000',
                textTransform: 'uppercase'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {message && (
          <p
            style={{
              fontSize: '12px',
              padding: '12px',
              marginBottom: '24px',
              border: '1px solid #000',
              background: message.includes('success') ? '#f0f0f0' : '#fff'
            }}
          >
            {message}
          </p>
        )}

        {activeTab === 'albums' && (
          <form onSubmit={handleAlbumSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>CREATE ALBUM</h2>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ padding: '12px', fontSize: '12px', minHeight: '80px' }}
            />
            <input
              type="url"
              placeholder="Cover Image URL"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <select
              value={formData.releaseType}
              onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
              style={{ padding: '12px', fontSize: '12px' }}
            >
              <option value="SINGLE">SINGLE</option>
              <option value="EP">EP</option>
              <option value="ALBUM">ALBUM</option>
              <option value="DELUXE">DELUXE</option>
            </select>
            <input
              type="date"
              placeholder="Release Date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <input
              type="url"
              placeholder="Purchase URL"
              value={formData.purchaseUrl}
              onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <select
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            >
              <option value="">SELECT ARTIST</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '16px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
              CREATE ALBUM
            </button>
          </form>
        )}

        {activeTab === 'artists' && (
          <form onSubmit={handleArtistSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>CREATE ARTIST</h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              style={{ padding: '12px', fontSize: '12px', minHeight: '80px' }}
            />
            <input
              type="url"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <button type="submit" style={{ padding: '16px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
              CREATE ARTIST
            </button>
          </form>
        )}

        {activeTab === 'tracks' && (
          <form onSubmit={handleTrackSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>ADD TRACK</h2>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <input
              type="url"
              placeholder="Audio URL (direct link)"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <input
              type="number"
              placeholder="Position in album"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            />
            <select
              value={formData.albumId}
              onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            >
              <option value="">SELECT ALBUM</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.title} - {album.artist.name}</option>
              ))}
            </select>
            <select
              value={formData.artistId}
              onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
              required
              style={{ padding: '12px', fontSize: '12px' }}
            >
              <option value="">SELECT ARTIST</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '16px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
              ADD TRACK
            </button>
          </form>
        )}
      </div>
    </main>
  )
}