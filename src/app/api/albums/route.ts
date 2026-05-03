import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { getPrisma } = await import('@/lib/prisma')
    const prisma = await getPrisma()
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
  } catch (error) {
    console.error('Albums GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}