import { GraphQLContext } from '../context';
import { requireSeller, handleAsyncErrors } from './auth.helpers';
import { OrderStatus } from '@prisma/client';

export const orderResolvers = {
  Query: {
    orders: async (
      _: any,
      { filter, limit = 50, offset = 0 }: { filter?: any; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        // Get orders that contain the seller's products
        const orderItems = await context.prisma.orderItem.findMany({
          where: {
            product: {
              sellerId: user.id
            },
            ...(filter?.status && { order: { status: filter.status } }),
            ...(filter?.dateFrom && { createdAt: { gte: filter.dateFrom } }),
            ...(filter?.dateTo && { createdAt: { lte: filter.dateTo } }),
          },
          include: {
            order: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                items: {
                  include: {
                    product: true
                  }
                }
              }
            },
            product: true
          },
          orderBy: { createdAt: 'desc' },
          take: Math.min(limit, 100),
          skip: offset
        });

        // Extract unique orders and calculate seller-specific totals
        const orderMap = new Map();
        orderItems.forEach(item => {
          const orderId = item.order.id;
          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
              ...item.order,
              sellerItems: [],
              sellerTotal: 0
            });
          }
          
          const order = orderMap.get(orderId);
          order.sellerItems.push(item);
          order.sellerTotal += Number(item.price) * item.quantity;
        });

        return Array.from(orderMap.values());
      }, 'Failed to fetch orders');
    },

    order: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        const order = await context.prisma.order.findFirst({
          where: {
            id,
            items: {
              some: {
                product: {
                  sellerId: user.id
                }
              }
            }
          },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        });

        if (!order) {
          throw new Error('Order not found or access denied');
        }

        // Filter items to only show seller's products
        order.items = order.items.filter(item => item.product.sellerId === user.id);

        return order;
      }, 'Failed to fetch order');
    },

    ordersByProduct: async (
      _: any,
      { productId }: { productId: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        // Verify product ownership
        const product = await context.prisma.product.findFirst({
          where: {
            id: productId,
            sellerId: user.id
          }
        });

        if (!product) {
          throw new Error('Product not found or access denied');
        }

        const orderItems = await context.prisma.orderItem.findMany({
          where: {
            productId
          },
          include: {
            order: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        return orderItems.map(item => item.order);
      }, 'Failed to fetch orders for product');
    },
  },

  Mutation: {
    updateOrderStatus: async (
      _: any,
      { orderId, status }: { orderId: string; status: OrderStatus },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        // Verify the seller has items in this order
        const orderItem = await context.prisma.orderItem.findFirst({
          where: {
            orderId,
            product: {
              sellerId: user.id
            }
          }
        });

        if (!orderItem) {
          throw new Error('Order not found or access denied');
        }

        // Only allow certain status transitions for sellers
        const allowedStatuses = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED];
        if (!allowedStatuses.includes(status)) {
          throw new Error('Invalid status transition. Sellers can only update to CONFIRMED, PROCESSING, or SHIPPED');
        }

        const updatedOrder = await context.prisma.order.update({
          where: { id: orderId },
          data: { status },
          include: {
            user: {
              include: {
                profile: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        });

        return updatedOrder;
      }, 'Failed to update order status');
    },
  },

  Order: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          profile: true
        }
      });
    },

    items: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.orderItem.findMany({
        where: { orderId: parent.id },
        include: {
          product: {
            include: {
              images: {
                orderBy: { isPrimary: 'desc' }
              }
            }
          }
        }
      });
    },
  },
};
