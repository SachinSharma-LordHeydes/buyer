import { GraphQLContext } from '../context';
import { requireSeller, requireAdmin, validateInput, handleAsyncErrors } from './auth.helpers';

export const categoryResolvers = {
  Query: {
    categories: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        return await context.prisma.category.findMany({
          include: {
            parent: true,
            children: true,
            _count: {
              select: {
                products: true
              }
            }
          },
          orderBy: { name: 'asc' }
        });
      }, 'Failed to fetch categories');
    },

    category: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const category = await context.prisma.category.findUnique({
          where: { id },
          include: {
            parent: true,
            children: true,
            products: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { isPrimary: 'desc' }
                    }
                  }
                }
              }
            }
          }
        });

        if (!category) {
          throw new Error('Category not found');
        }

        return category;
      }, 'Failed to fetch category');
    },
  },

  Mutation: {
    createCategory: async (
      _: any,
      { name, description, parentId }: { name: string; description?: string; parentId?: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        requireAdmin(context);
        
        validateInput({ name }, ['name']);

        // Check if category name already exists
        const existingCategory = await context.prisma.category.findUnique({
          where: { name: name.trim() }
        });

        if (existingCategory) {
          throw new Error('Category with this name already exists');
        }

        // If parentId provided, verify parent exists
        if (parentId) {
          const parent = await context.prisma.category.findUnique({
            where: { id: parentId }
          });

          if (!parent) {
            throw new Error('Parent category not found');
          }
        }

        // Generate slug from name
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check if slug already exists
        const existingSlug = await context.prisma.category.findUnique({
          where: { slug }
        });

        if (existingSlug) {
          throw new Error('Category slug already exists');
        }

        const category = await context.prisma.category.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            slug,
            parentId: parentId || null
          },
          include: {
            parent: true,
            children: true
          }
        });

        return category;
      }, 'Failed to create category');
    },

    updateCategory: async (
      _: any,
      { id, name, description }: { id: string; name?: string; description?: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        requireAdmin(context);
        
        const existingCategory = await context.prisma.category.findUnique({
          where: { id }
        });

        if (!existingCategory) {
          throw new Error('Category not found');
        }

        const updateData: any = {};

        if (name) {
          // Check if new name conflicts with existing categories
          const nameConflict = await context.prisma.category.findFirst({
            where: {
              name: name.trim(),
              id: { not: id }
            }
          });

          if (nameConflict) {
            throw new Error('Category with this name already exists');
          }

          updateData.name = name.trim();
          updateData.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }

        if (description !== undefined) {
          updateData.description = description?.trim() || null;
        }

        const category = await context.prisma.category.update({
          where: { id },
          data: updateData,
          include: {
            parent: true,
            children: true
          }
        });

        return category;
      }, 'Failed to update category');
    },

    deleteCategory: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        requireAdmin(context);
        
        const category = await context.prisma.category.findUnique({
          where: { id },
          include: {
            children: true,
            products: true
          }
        });

        if (!category) {
          throw new Error('Category not found');
        }

        // Check if category has children
        if (category.children.length > 0) {
          throw new Error('Cannot delete category with subcategories. Please delete or move subcategories first.');
        }

        // Check if category has products
        if (category.products.length > 0) {
          throw new Error('Cannot delete category with products. Please remove products from this category first.');
        }

        await context.prisma.category.delete({
          where: { id }
        });

        return {
          success: true,
          message: 'Category deleted successfully'
        };
      }, 'Failed to delete category');
    },
  },

  Category: {
    parent: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.parentId) return null;
      
      return context.prisma.category.findUnique({
        where: { id: parent.parentId }
      });
    },

    children: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.category.findMany({
        where: { parentId: parent.id },
        orderBy: { name: 'asc' }
      });
    },

    products: async (parent: any, _: any, context: GraphQLContext) => {
      const productCategories = await context.prisma.productCategory.findMany({
        where: { categoryId: parent.id },
        include: {
          product: {
            include: {
              images: {
                orderBy: { isPrimary: 'desc' }
              },
              seller: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
      
      return productCategories.map(pc => pc.product);
    },
  },
};
