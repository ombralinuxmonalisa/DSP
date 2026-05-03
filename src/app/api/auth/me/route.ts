import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const { getSession } = await import('@/lib/auth')
    
    const prisma = await getPrisma()
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, username: true, isAdmin: true }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ user: null })
  }
}