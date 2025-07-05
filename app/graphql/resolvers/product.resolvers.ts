import { ProductStatus } from "@prisma/client";
import { GraphQLContext } from "../context";
import {
  handleAsyncErrors,
  requireProductOwnership,
  requireSeller,
  validateInput,
} from "./auth.helpers";

const validateProductInput = (input: any) => {
  validateInput(input, ["name", "price", "stock"]);

  if (input.price <= 0) {
    throw new Error("Price must be greater than 0");
  }

  if (input.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  if (input.name.length > 255) {
    throw new Error("Product name must be less than 255 characters");
  }

  if (input.description && input.description.length > 2000) {
    throw new Error("Description must be less than 2000 characters");
  }
};

export const productResolvers = {
  Query: {
    products: async (
      _: any,
      {
        filter,
        limit = 50,
        offset = 0,
      }: { filter?: any; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);

        const where: any = {
          sellerId: user.id,
          deletedAt: null,
        };

        // Apply filters
        if (filter) {
          if (filter.status) {
            where.status = filter.status;
          }
          if (filter.search) {
            where.OR = [
              { name: { contains: filter.search, mode: "insensitive" } },
              { description: { contains: filter.search, mode: "insensitive" } },
              { sku: { contains: filter.search, mode: "insensitive" } },
            ];
          }
          if (filter.category) {
            where.categories = {
              some: {
                categoryId: filter.category,
              },
            };
          }
          if (filter.minPrice || filter.maxPrice) {
            where.price = {};
            if (filter.minPrice) where.price.gte = filter.minPrice;
            if (filter.maxPrice) where.price.lte = filter.maxPrice;
          }
          if (filter.inStock !== undefined) {
            if (filter.inStock) {
              where.stock = { gt: 0 };
            } else {
              where.stock = 0;
            }
          }
        }

        return await context.prisma.product.findMany({
          where,
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true,
              },
            },
            discount: true,
          },
          orderBy: { createdAt: "desc" },
          take: Math.min(limit, 100), // Max 100 items per query
          skip: offset,
        });
      }, "Failed to fetch products");
    },

    product: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);

        const product = await context.prisma.product.findFirst({
          where: {
            id,
            sellerId: user.id,
            deletedAt: null,
          },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true,
              },
            },
            discount: true,
            reviews: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        return product;
      }, "Failed to fetch product");
    },

    searchProducts: async (
      _: any,
      { query }: { query: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);

        return await context.prisma.product.findMany({
          where: {
            sellerId: user.id,
            deletedAt: null,
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
      }, "Failed to search products");
    },
  },

  Mutation: {
    createProduct: async (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);

        validateProductInput(input);

        const product = await context.prisma.$transaction(
          async (tx) => {
            // Create product
            const newProduct = await tx.product.create({
              data: {
                name: input.name.trim(),
                description: input.description?.trim() || null,
                price: input.price,
                sku: input.sku?.trim() || null,
                stock: input.stock,
                sellerId: user.id,
                status: ProductStatus.PENDING,
              },
            });

            // Batch all create operations for better performance
            const createPromises = [];

            // Create images
            if (input.images && input.images.length > 0) {
              createPromises.push(
                tx.productImage.createMany({
                  data: input.images.map((img: any, index: number) => ({
                    productId: newProduct.id,
                    url: img.url,
                    altText: img.altText || null,
                    isPrimary: img.isPrimary || index === 0,
                  })),
                })
              );
            }

            // Create videos
            if (input.videos && input.videos.length > 0) {
              createPromises.push(
                tx.productVideo.createMany({
                  data: input.videos.map((video: any) => ({
                    productId: newProduct.id,
                    url: video.url,
                    publicId: video.publicId,
                  })),
                })
              );
            }

            // Create features
            if (input.features && input.features.length > 0) {
              createPromises.push(
                tx.productFeature.createMany({
                  data: input.features.map((feature: any) => ({
                    productId: newProduct.id,
                    feature: feature.feature,
                    value: feature.value || null,
                  })),
                })
              );
            }

            // Create category associations
            if (input.categories && input.categories.length > 0) {
              createPromises.push(
                tx.productCategory.createMany({
                  data: input.categories.map((categoryId: string) => ({
                    productId: newProduct.id,
                    categoryId,
                  })),
                })
              );
            }

            // Execute all creates in parallel
            if (createPromises.length > 0) {
              await Promise.all(createPromises);
            }

            return newProduct;
          },
          {
            timeout: 30000, // 30 seconds timeout
            maxWait: 35000, // Maximum wait time
          }
        );

        // Fetch the complete product with relations
        const createdProduct = await context.prisma.product.findUnique({
          where: { id: product.id },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        return {
          success: true,
          message: "Product created successfully",
          product: createdProduct,
        };
      }, "Failed to create product");
    },

    updateProduct: async (
      _: any,
      { id, input }: { id: string; input: any },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        await requireProductOwnership(context, id);

        console.log("input for updateProduct:", input);

        if (Object.keys(input).length === 0) {
          return {
            success: false,
            message: "At least one field must be provided for update",
            product: null,
          };
        }

        // Validate only provided fields
        if (input.price !== undefined && input.price <= 0) {
          return {
            success: false,
            message: "Price must be greater than 0",
            product: null,
          };
        }
        if (input.stock !== undefined && input.stock < 0) {
          return {
            success: false,
            message: "Stock cannot be negative",
            product: null,
          };
        }

        // Clean and validate input data
        const cleanInput = {
          ...input,
          // Ensure images have required fields
          images:
            input.images
              ?.map((img: any, index: number) => ({
                url: img.url?.trim(),
                altText: img.altText?.trim() || null,
                isPrimary: Boolean(img.isPrimary) || index === 0,
              }))
              .filter((img: any) => img.url) || [],

          // Ensure videos have required fields
          videos:
            input.videos
              ?.map((video: any) => ({
                url: video.url?.trim(),
                publicId: video.publicId?.trim(),
              }))
              .filter((video: any) => video.url && video.publicId) || [],

          // Ensure features have required fields
          features:
            input.features
              ?.map((feature: any) => ({
                feature: feature.feature?.trim(),
                value: feature.value?.trim() || null,
              }))
              .filter((feature: any) => feature.feature) || [],
        };

        console.log("cleaned input:", cleanInput);

        const updatedProduct = await context.prisma.$transaction(
          async (tx) => {
          // Update basic product fields
          const updateData: any = {};
          if (cleanInput.name) updateData.name = cleanInput.name.trim();
          if (cleanInput.description !== undefined)
            updateData.description = cleanInput.description?.trim() || null;
          if (cleanInput.price !== undefined)
            updateData.price = cleanInput.price;
          if (cleanInput.sku !== undefined)
            updateData.sku = cleanInput.sku?.trim() || null;
          if (cleanInput.stock !== undefined)
            updateData.stock = cleanInput.stock;
          if (cleanInput.status) updateData.status = cleanInput.status;

          console.log("updating product with data:", updateData);

          const product = await tx.product.update({
            where: { id },
            data: updateData,
          });

          // Batch all delete operations first
          const deletePromises = [];
          
          if (cleanInput.images !== undefined) {
            console.log("updating images:", cleanInput.images);
            deletePromises.push(
              tx.productImage.deleteMany({ where: { productId: id } })
            );
          }
          
          if (cleanInput.videos !== undefined) {
            console.log("updating videos:", cleanInput.videos);
            deletePromises.push(
              tx.productVideo.deleteMany({ where: { productId: id } })
            );
          }
          
          if (cleanInput.features !== undefined) {
            console.log("updating features:", cleanInput.features);
            deletePromises.push(
              tx.productFeature.deleteMany({ where: { productId: id } })
            );
          }
          
          // Execute all deletes in parallel
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
          
          // Batch all create operations
          const createPromises = [];
          
          if (cleanInput.images !== undefined && cleanInput.images.length > 0) {
            createPromises.push(
              tx.productImage.createMany({
                data: cleanInput.images.map((img: any, index: number) => ({
                  productId: id,
                  url: img.url,
                  altText: img.altText,
                  isPrimary: img.isPrimary || index === 0,
                })),
              })
            );
          }
          
          if (cleanInput.videos !== undefined && cleanInput.videos.length > 0) {
            createPromises.push(
              tx.productVideo.createMany({
                data: cleanInput.videos.map((video: any) => ({
                  productId: id,
                  url: video.url,
                  publicId: video.publicId,
                })),
              })
            );
          }
          
          if (cleanInput.features !== undefined && cleanInput.features.length > 0) {
            createPromises.push(
              tx.productFeature.createMany({
                data: cleanInput.features.map((feature: any) => ({
                  productId: id,
                  feature: feature.feature,
                  value: feature.value,
                })),
              })
            );
          }
          
          // Execute all creates in parallel
          if (createPromises.length > 0) {
            await Promise.all(createPromises);
          }

          // Update categories if provided
          if (cleanInput.categories !== undefined) {
            console.log("updating categories:", cleanInput.categories);

            // Delete existing category associations
            await tx.productCategory.deleteMany({
              where: { productId: id },
            });

            // Create new category associations
            if (cleanInput.categories.length > 0) {
              await tx.productCategory.createMany({
                data: cleanInput.categories.map((categoryId: string) => ({
                  productId: id,
                  categoryId,
                })),
              });
            }
          }

          return product;
        },
        {
          timeout: 30000, // 30 seconds timeout
          maxWait: 35000, // Maximum wait time
        }
        );

        // Fetch the complete updated product
        const product = await context.prisma.product.findUnique({
          where: { id },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        return {
          success: true,
          message: "Product updated successfully",
          product,
        };
      }, "Failed to update product");
    },

    deleteProduct: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        await requireProductOwnership(context, id);

        console.log("deleteProduct called with id:", id);

        // Soft delete the product
        await context.prisma.product.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        return {
          success: true,
          message: "Product deleted successfully",
        };
      }, "Failed to delete product");
    },

    updateProductStatus: async (
      _: any,
      { id, status }: { id: string; status: ProductStatus },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        await requireProductOwnership(context, id);

        const product = await context.prisma.product.update({
          where: { id },
          data: { status },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
            videos: true,
            features: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        return {
          success: true,
          message: `Product status updated to ${status}`,
          product,
        };
      }, "Failed to update product status");
    },

    updateStock: async (
      _: any,
      { productId, quantity }: { productId: string; quantity: number },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        await requireProductOwnership(context, productId);

        if (quantity < 0) {
          throw new Error("Stock quantity cannot be negative");
        }

        const product = await context.prisma.product.update({
          where: { id: productId },
          data: { stock: quantity },
          include: {
            images: {
              orderBy: { isPrimary: "desc" },
            },
          },
        });

        return {
          success: true,
          message: "Stock updated successfully",
          product,
        };
      }, "Failed to update stock");
    },

    bulkUpdateStock: async (
      _: any,
      { updates }: { updates: Array<{ productId: string; quantity: number }> },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireSeller(context);

        if (updates.length === 0) {
          throw new Error("No updates provided");
        }

        if (updates.length > 100) {
          throw new Error("Maximum 100 products can be updated at once");
        }

        // Validate all products belong to user
        const productIds = updates.map((u) => u.productId);
        const products = await context.prisma.product.findMany({
          where: {
            id: { in: productIds },
            sellerId: user.id,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (products.length !== productIds.length) {
          throw new Error("Some products not found or access denied");
        }

        // Validate quantities
        for (const update of updates) {
          if (update.quantity < 0) {
            throw new Error(
              `Invalid quantity for product ${update.productId}: cannot be negative`
            );
          }
        }

        // Perform bulk update
        const results = await Promise.all(
          updates.map(async (update) => {
            const product = await context.prisma.product.update({
              where: { id: update.productId },
              data: { stock: update.quantity },
              include: {
                images: {
                  orderBy: { isPrimary: "desc" },
                },
              },
            });

            return {
              success: true,
              message: "Stock updated successfully",
              product,
            };
          })
        );

        return results;
      }, "Failed to bulk update stock");
    },
  },

  Product: {
    seller: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.user.findUnique({
        where: { id: parent.sellerId },
        include: {
          profile: true,
        },
      });
    },

    images: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.productImage.findMany({
        where: { productId: parent.id },
        orderBy: { isPrimary: "desc" },
      });
    },

    videos: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.productVideo.findMany({
        where: { productId: parent.id },
      });
    },

    features: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.productFeature.findMany({
        where: { productId: parent.id },
      });
    },

    categories: async (parent: any, _: any, context: GraphQLContext) => {
      const productCategories = await context.prisma.productCategory.findMany({
        where: { productId: parent.id },
        include: {
          category: true,
        },
      });
      return productCategories.map((pc) => pc.category);
    },

    discount: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.discount.findUnique({
        where: { productId: parent.id },
      });
    },

    reviews: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.ratingAndReview.findMany({
        where: { productId: parent.id },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    averageRating: async (parent: any, _: any, context: GraphQLContext) => {
      const result = await context.prisma.ratingAndReview.aggregate({
        where: { productId: parent.id },
        _avg: { rating: true },
      });
      return result._avg.rating || 0;
    },

    totalReviews: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.ratingAndReview.count({
        where: { productId: parent.id },
      });
    },
  },
};
