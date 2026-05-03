import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
        tracks: { select: { id: true, title: true, audioUrl: true, duration: true, position: true, artistId: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(albums)
  } catch (error) {
    console.error('Albums GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}