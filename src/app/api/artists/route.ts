import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const prisma = await getPrisma()
    const artists = await prisma.artist.findMany({
      include: {
        albums: { select: { id: true, title: true, coverImage: true, releaseType: true } }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(artists)
  } catch (error) {
    console.error('Artists GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const { getSession } = await import('@/lib/auth')
    const { artistSchema, rateLimit, sanitizeString } = await import('@/lib/security')
    
    const prisma = await getPrisma()
    const session = await getSession()
    
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!rateLimit(`create-artist:${session.userId}`, 10, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = artistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { name, bio, image } = parsed.data

    const artist = await prisma.artist.create({
      data: {
        name: sanitizeString(name),
        bio: bio ? sanitizeString(bio) : null,
        image: image || null
      }
    })

    return NextResponse.json(artist, { status: 201 })
  } catch (error) {
    console.error('Artists POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}