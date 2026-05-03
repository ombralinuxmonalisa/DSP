import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { albumSchema, rateLimit, sanitizeString } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    const releaseType = searchParams.get('releaseType')

    const where: Record<string, unknown> = {}
    if (artistId) where.artistId = artistId
    if (releaseType) where.releaseType = releaseType

    const albums = await prisma.album.findMany({
      where,
      include: {
        artist: { select: { id: true, name: true } },
        tracks: { select: { id: true, title: true, audioUrl: true, duration: true, position: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(albums)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`create-album:${session.userId}`, 20, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = albumSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { title, description, coverImage, releaseType, releaseDate, purchaseUrl, artistId } = parsed.data

    const album = await prisma.album.create({
      data: {
        title: sanitizeString(title),
        description: description ? sanitizeString(description) : null,
        coverImage: coverImage || null,
        releaseType,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        purchaseUrl: purchaseUrl || null,
        artistId
      },
      include: {
        artist: { select: { id: true, name: true } },
        tracks: true
      }
    })

    return NextResponse.json(album, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}