import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const { loginSchema, rateLimit } = await import('@/lib/security')
    const { verifyPassword, createToken, setSessionCookie } = await import('@/lib/auth')
    
    const prisma = await getPrisma()
    
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
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}