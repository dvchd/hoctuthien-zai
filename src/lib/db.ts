import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Ensure database is connected
export async function ensureDatabaseConnection() {
  try {
    await db.$connect()
    console.log('[Database] Connected successfully')
  } catch (error) {
    console.error('[Database] Connection error:', error)
    throw error
  }
}
