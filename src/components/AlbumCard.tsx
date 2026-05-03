'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Album {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'DELUXE'
  releaseDate: string | null
  purchaseUrl: string | null
  artist: { id: string; name: string }
  tracks: {
    id: string
    title: string
    audioUrl: string
    duration: number | null
    position: number
    artist: { id: string; name: string }
    album: { id: string; title: string; coverImage: string | null }
  }[]
}

interface AlbumCardProps {
  album: Album
  onPlay: (track: Album['tracks'][0], playlist: Album['tracks']) => void
}

export default function AlbumCard({ album, onPlay }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: '#f0f0f0' }}>
        {album.coverImage ? (
          <Image src={album.coverImage} alt={album.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{album.title[0]}</span>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            display: 'flex',
            gap: '8px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        >
          {album.purchaseUrl && (
            <a
              href={album.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '36px',
                height: '36px',
                background: '#fff',
                border: '1px solid #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                transition: 'background 0.2s'
              }}
            >
              $
            </a>
          )}
          {album.tracks.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlay(album.tracks[0], album.tracks)
              }}
              style={{
                width: '36px',
                height: '36px',
                background: '#000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s'
              }}
            >
              {isHovered ? '>' : ''}
            </button>
          )}
        </div>
      </div>

      <Link href={`/album/${album.id}`}>
        <p style={{ fontSize: '12px', fontWeight: 600 }}>{album.title}</p>
        <p style={{ fontSize: '10px', opacity: 0.6 }}>{album.artist.name}</p>
        <p style={{ fontSize: '9px', opacity: 0.4, marginTop: '4px' }}>{album.releaseType}</p>
      </Link>
    </div>
  )
}