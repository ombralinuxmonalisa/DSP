'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

interface Post {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string }
  comments: { id: string; content: string; author: { username: string } }[]
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)

  useEffect(() => {
    fetchPosts()
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || !user) return

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost })
      })
      if (res.ok) {
        setNewPost('')
        fetchPosts()
      }
    } catch {}
  }

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <h1
          className="animate-slide-up"
          style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '32px' }}
        >
          FEED
        </h1>

        {user && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={2000}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '16px',
                fontSize: '12px',
                resize: 'none',
                border: '1px solid #000'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#000',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'transform 0.1s'
                }}
              >
                POST
              </button>
            </div>
          </form>
        )}

        {!user && (
          <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '32px', textAlign: 'center' }}>
            <a href="/login" style={{ textDecoration: 'underline' }}>LOGIN</a> TO POST
          </p>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>LOADING...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.map((post) => (
              <article
                key={post.id}
                className="animate-fade-in"
                style={{
                  padding: '24px',
                  border: '1px solid #000'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>@{post.author.username}</span>
                  <span style={{ fontSize: '10px', opacity: 0.4 }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{post.content}</p>
                {post.comments.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                    <p style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>
                      {post.comments.length} COMMENT{post.comments.length !== 1 ? 'S' : ''}
                    </p>
                    {post.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>@{comment.author.username}: </span>
                        {comment.content}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}