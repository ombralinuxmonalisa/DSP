import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const prisma = await getPrisma()
    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')
    const artistId = searchParams.get('artistId')

    const where: Record<string, unknown> = {}
    if (albumId) where.albumId = albumId
    if (artistId) where.artistId = artistId

    const tracks = await prisma.track.findMany({
      where,
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverImage: true } }
      },
      orderBy: [{ albumId: 'asc' }, { position: 'asc' }]
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Tracks GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const { getSession } = await import('@/lib/auth')
    const { trackSchema, rateLimit, sanitizeString } = await import('@/lib/security')
    
    const prisma = await getPrisma()
    const session = await getSession()
    
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!rateLimit(`create-track:${session.userId}`, 50, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = trackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { title, audioUrl, duration, position, albumId, artistId } = parsed.data

    const track = await prisma.track.create({
      data: {
        title: sanitizeString(title),
        audioUrl,
        duration: duration || null,
        position,
        albumId,
        artistId
      },
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverImage: true } }
      }
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Tracks POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}