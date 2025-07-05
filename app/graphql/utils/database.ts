import { PrismaClient } from '@prisma/client';

// Enhanced transaction wrapper with retry logic
export async function executeTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: any) => Promise<T>,
  options: {
    timeout?: number;
    maxWait?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    timeout = 30000, // 30 seconds
    maxWait = 35000, // 35 seconds
    retries = 3,
    retryDelay = 1000, // 1 second
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        timeout,
        maxWait,
      });
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a timeout or connection error that might be retryable
      const isRetryableError = 
        error.code === 'P2028' || // Transaction timeout
        error.code === 'P1001' || // Connection refused
        error.code === 'P1008' || // Timeout
        error.message?.includes('timeout') ||
        error.message?.includes('connection') ||
        error.message?.includes('network');

      if (!isRetryableError || attempt === retries) {
        console.error(`Transaction failed after ${attempt} attempts:`, error);
        throw error;
      }

      console.warn(`Transaction attempt ${attempt} failed, retrying in ${retryDelay}ms...`, {
        error: error.message,
        code: error.code,
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Exponential backoff
      retryDelay *= 2;
    }
  }

  throw lastError;
}

// Utility for batch operations with chunking
export async function executeBatchOperation<T, R>(
  items: T[],
  operation: (chunk: T[]) => Promise<R>,
  chunkSize: number = 50
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    try {
      const result = await operation(chunk);
      results.push(result);
    } catch (error) {
      console.error(`Batch operation failed for chunk ${i / chunkSize + 1}:`, error);
      throw error;
    }
  }
  
  return results;
}

// Connection health check
export async function checkDatabaseConnection(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Database performance metrics
export async function getDatabaseMetrics(prisma: PrismaClient) {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const queryTime = Date.now() - startTime;
    
    return {
      isConnected: true,
      queryLatency: queryTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
