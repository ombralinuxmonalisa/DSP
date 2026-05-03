'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavbarProps {
  isAdmin?: boolean
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderBottom: '1px solid #000',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}
    >
      <Link href="/" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-1px' }}>
        DSP
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link href="/artists" style={{ fontSize: '12px', opacity: 0.7 }}>
          ARTISTS
        </Link>
        <Link href="/albums" style={{ fontSize: '12px', opacity: 0.7 }}>
          MUSIC
        </Link>
        <Link href="/feed" style={{ fontSize: '12px', opacity: 0.7 }}>
          FEED
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{ fontSize: '12px', fontWeight: 600 }}>
            ADMIN
          </Link>
        )}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          fontSize: '12px',
          padding: '8px 16px',
          border: '1px solid #000',
          transition: 'background 0.2s, color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#000'
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff'
          e.currentTarget.style.color = '#000'
        }}
      >
        {menuOpen ? 'CLOSE' : 'MENU'}
      </button>
    </nav>
  )
}