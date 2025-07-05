import { GraphQLContext } from '../context';
import { requireSeller, handleAsyncErrors } from './auth.helpers';

export const analyticsResolvers = {
  Query: {
    salesAnalytics: async (
      _: any,
      { dateFrom, dateTo }: { dateFrom?: Date; dateTo?: Date },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        // Set default date range if not provided (last 30 days)
        const endDate = dateTo || new Date();
        const startDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get orders with seller's products
        const orderItems = await context.prisma.orderItem.findMany({
          where: {
            product: {
              sellerId: user.id
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            product: true,
            order: true
          }
        });

        // Calculate metrics
        const totalRevenue = orderItems.reduce((sum, item) => 
          sum + (Number(item.price) * item.quantity), 0
        );

        const uniqueOrderIds = new Set(orderItems.map(item => item.orderId));
        const totalOrders = uniqueOrderIds.size;

        const totalProducts = await context.prisma.product.count({
          where: {
            sellerId: user.id,
            deletedAt: null
          }
        });

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate growth (compare with previous period)
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        
        const previousOrderItems = await context.prisma.orderItem.findMany({
          where: {
            product: {
              sellerId: user.id
            },
            createdAt: {
              gte: previousStartDate,
              lt: startDate
            }
          }
        });

        const previousRevenue = previousOrderItems.reduce((sum, item) => 
          sum + (Number(item.price) * item.quantity), 0
        );
        const previousOrdersCount = new Set(previousOrderItems.map(item => item.orderId)).size;

        const revenueGrowth = previousRevenue > 0 
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
          : 0;
        
        const ordersGrowth = previousOrdersCount > 0 
          ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 
          : 0;

        // Top products by sales
        const productSales = new Map();
        orderItems.forEach(item => {
          const productId = item.productId;
          if (!productSales.has(productId)) {
            productSales.set(productId, {
              product: item.product,
              totalSold: 0,
              revenue: 0
            });
          }
          const sales = productSales.get(productId);
          sales.totalSold += item.quantity;
          sales.revenue += Number(item.price) * item.quantity;
        });

        const topProducts = Array.from(productSales.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        // Revenue by month (last 12 months)
        const monthlyRevenue = [];
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setTime(monthEnd.getTime() - 1);

          const monthItems = await context.prisma.orderItem.findMany({
            where: {
              product: {
                sellerId: user.id
              },
              createdAt: {
                gte: monthStart,
                lte: monthEnd
              }
            }
          });

          const monthRevenue = monthItems.reduce((sum, item) => 
            sum + (Number(item.price) * item.quantity), 0
          );
          
          const monthOrders = new Set(monthItems.map(item => item.orderId)).size;

          monthlyRevenue.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue,
            orders: monthOrders
          });
        }

        return {
          totalRevenue,
          totalOrders,
          totalProducts,
          averageOrderValue,
          revenueGrowth,
          ordersGrowth,
          topProducts,
          revenueByMonth: monthlyRevenue
        };
      }, 'Failed to fetch sales analytics');
    },

    inventoryStats: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);
        
        const products = await context.prisma.product.findMany({
          where: {
            sellerId: user.id,
            deletedAt: null
          },
          select: {
            id: true,
            stock: true,
            status: true,
            price: true
          }
        });

        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'APPROVED').length;
        const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0).length;
        const outOfStockProducts = products.filter(p => p.stock === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);

        return {
          totalProducts,
          activeProducts,
          lowStockProducts,
          outOfStockProducts,
          totalValue
        };
      }, 'Failed to fetch inventory stats');
    },

    productReviews: async (
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

        return await context.prisma.ratingAndReview.findMany({
          where: { productId },
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }, 'Failed to fetch product reviews');
    },
  },
};
