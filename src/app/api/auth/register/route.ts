import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth'
import { registerSchema, rateLimit, sanitizeEmail } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`register:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { email, username, password } = parsed.data
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedUsername = username.toLowerCase()

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: sanitizedEmail }, { username: sanitizedUsername }] }
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        username: sanitizedUsername,
        password: hashedPassword
      }
    })

    const token = await createToken({ userId: user.id, isAdmin: user.isAdmin })
    await setSessionCookie(token)

    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}