import { GraphQLContext } from '../context';
import { requireAuth, handleAsyncErrors } from './auth.helpers';

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        
        return await context.prisma.user.findUnique({
          where: { id: user.id },
          include: {
            profile: {
              include: {
                addresses: true,
                document: true,
                storeDetail: {
                  include: {
                    storeAddress: true
                  }
                }
              }
            }
          }
        });
      }, 'Failed to fetch user information');
    },
  },

  User: {
    products: async (parent: any, _: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        return await context.prisma.product.findMany({
          where: {
            sellerId: parent.id,
            deletedAt: null
          },
          include: {
            images: {
              orderBy: { isPrimary: 'desc' }
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }, 'Failed to fetch user products');
    },

    orders: async (parent: any, _: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        // For sellers, get orders that contain their products
        const orderItems = await context.prisma.orderItem.findMany({
          where: {
            product: {
              sellerId: parent.id
            }
          },
          include: {
            order: {
              include: {
                user: true,
                items: {
                  include: {
                    product: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        // Extract unique orders
        const uniqueOrders = orderItems.reduce((acc, item) => {
          if (!acc.find(order => order.id === item.order.id)) {
            acc.push(item.order);
          }
          return acc;
        }, [] as any[]);

        return uniqueOrders;
      }, 'Failed to fetch orders');
    },
  },
};
