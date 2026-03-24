/**
 * Unit of Work Pattern Implementation
 * Manages database transactions and coordinates repository operations
 */

import { PrismaClient } from '@prisma/client';

export interface IUnitOfWork {
  /**
   * Execute operations within a transaction
   */
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Get the Prisma client
   */
  getClient(): PrismaClient;
}

/**
 * Unit of Work implementation using Prisma
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  private client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.client.$transaction(work);
  }

  getClient(): PrismaClient {
    return this.client;
  }
}

// Singleton instance
let unitOfWorkInstance: PrismaUnitOfWork | null = null;

export function getUnitOfWork(prisma: PrismaClient): PrismaUnitOfWork {
  if (!unitOfWorkInstance) {
    unitOfWorkInstance = new PrismaUnitOfWork(prisma);
  }
  return unitOfWorkInstance;
}
