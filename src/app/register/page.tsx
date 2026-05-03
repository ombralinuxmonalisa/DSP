'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      router.push('/')
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 700, display: 'block', marginBottom: '48px' }}>
          DSP
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '32px' }}>REGISTER</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <p style={{ fontSize: '12px', color: '#c00', padding: '12px', border: '1px solid #c00' }}>
              {error}
            </p>
          )}

          <div>
            <label style={{ fontSize: '10px', opacity: 0.5, display: 'block', marginBottom: '8px' }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', fontSize: '12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '10px', opacity: 0.5, display: 'block', marginBottom: '8px' }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_-]+$"
              style={{ width: '100%', padding: '12px', fontSize: '12px' }}
            />
            <p style={{ fontSize: '9px', opacity: 0.5, marginTop: '4px' }}>3-30 characters, letters, numbers, _ and - only</p>
          </div>

          <div>
            <label style={{ fontSize: '10px', opacity: 0.5, display: 'block', marginBottom: '8px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              style={{ width: '100%', padding: '12px', fontSize: '12px' }}
            />
            <p style={{ fontSize: '9px', opacity: 0.5, marginTop: '4px' }}>Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: '#000',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '16px',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '24px', textAlign: 'center' }}>
          ALREADY HAVE AN ACCOUNT? <Link href="/login" style={{ textDecoration: 'underline' }}>LOGIN</Link>
        </p>
      </div>
    </main>
  )
}