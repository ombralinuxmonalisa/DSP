import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth'
import { loginSchema, rateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`login:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { email, password } = parsed.data
    const sanitizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createToken({ userId: user.id, isAdmin: user.isAdmin })
    await setSessionCookie(token)

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin }
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}