import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  
  if (!url) {
    console.warn('⚠️ No database URL found in environment variables.');
    return new PrismaClient();
  }

  try {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ 
      adapter,
      log: ['error'] 
    });
  } catch (error) {
    console.error('❌ Failed to initialize Prisma with Neon adapter:', error);
    return new PrismaClient();
  }
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
