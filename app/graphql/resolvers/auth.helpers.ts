import { GraphQLContext } from '../context';
import { Role } from '@prisma/client';

/**
 * Authentication helper functions for GraphQL resolvers
 */

export const requireAuth = (context: GraphQLContext) => {
  if (!context.user) {
    throw new Error('Authentication required. Please sign in to continue.');
  }
  return context.user;
};

export const requireSeller = (context: GraphQLContext) => {
  const user = requireAuth(context);
  if (user.role !== Role.SELLER && user.role !== Role.ADMIN) {
    throw new Error('Seller access required. Please complete your seller profile setup.');
  }
  return user;
};

export const requireAdmin = (context: GraphQLContext) => {
  const user = requireAuth(context);
  if (user.role !== Role.ADMIN) {
    throw new Error('Admin access required.');
  }
  return user;
};

export const requireResourceOwnership = async (
  context: GraphQLContext,
  resourceOwnerId: string,
  resourceType: string = 'resource'
) => {
  const user = requireAuth(context);
  
  if (user.id !== resourceOwnerId && user.role !== Role.ADMIN) {
    throw new Error(`Access denied. You can only access your own ${resourceType}.`);
  }
  
  return user;
};

export const requireProductOwnership = async (
  context: GraphQLContext,
  productId: string
) => {
  const user = requireSeller(context);
  
  const product = await context.prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true }
  });
  
  if (!product) {
    throw new Error('Product not found.');
  }
  
  if (product.sellerId !== user.id && user.role !== Role.ADMIN) {
    throw new Error('Access denied. You can only manage your own products.');
  }
  
  return { user, product };
};

export const validateInput = (input: any, requiredFields: string[]) => {
  const missing = requiredFields.filter(field => {
    const value = input[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

export const handleAsyncErrors = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(errorMessage);
  }
};
