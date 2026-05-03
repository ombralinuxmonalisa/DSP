import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { artistSchema, rateLimit, sanitizeString } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        albums: { select: { id: true, title: true, coverImage: true, releaseType: true } }
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(artists)
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}