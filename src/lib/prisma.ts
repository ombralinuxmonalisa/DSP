let prismaInstance: any = null

export async function getPrisma() {
  if (!prismaInstance) {
    try {
      const { PrismaClient } = await import('@prisma/client')
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
      })
    } catch (error) {
      console.warn('Prisma client not available during build:', error)
      throw new Error('Database not available')
    }
  }
  return prismaInstance
}