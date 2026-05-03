import { z } from 'zod'

const rateLimitStore = new Map<string, { count: number; timestamp: number }>()

export function rateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now - record.timestamp > windowMs) {
    rateLimitStore.set(identifier, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 10000)
}

export function sanitizeUsername(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(128)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128)
})

export const postSchema = z.object({
  content: z.string().min(1).max(2000)
})

export const albumSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  coverImage: z.string().url().optional(),
  releaseType: z.enum(['SINGLE', 'EP', 'ALBUM', 'DELUXE']),
  releaseDate: z.string().datetime().optional(),
  purchaseUrl: z.string().url().optional(),
  artistId: z.string().cuid()
})

export const trackSchema = z.object({
  title: z.string().min(1).max(255),
  audioUrl: z.string().url(),
  duration: z.number().int().positive().optional(),
  position: z.number().int().positive(),
  albumId: z.string().cuid(),
  artistId: z.string().cuid()
})

export const artistSchema = z.object({
  name: z.string().min(1).max(255),
  bio: z.string().max(5000).optional(),
  image: z.string().url().optional()
})