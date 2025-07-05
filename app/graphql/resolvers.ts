import { userResolvers } from './resolvers/user.resolvers';
import { profileResolvers } from './resolvers/profile.resolvers';
import { productResolvers } from './resolvers/product.resolvers';
import { orderResolvers } from './resolvers/order.resolvers';
import { categoryResolvers } from './resolvers/category.resolvers';
import { uploadResolvers } from './resolvers/upload.resolvers';
import { analyticsResolvers } from './resolvers/analytics.resolvers';
import { scalarResolvers } from './resolvers/scalar.resolvers';

export const resolvers = {
  ...scalarResolvers,
  Query: {
    ...userResolvers.Query,
    ...profileResolvers.Query,
    ...productResolvers.Query,
    ...orderResolvers.Query,
    ...categoryResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...profileResolvers.Mutation,
    ...productResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...uploadResolvers.Mutation,
  },
  User: userResolvers.User,
  Profile: profileResolvers.Profile,
  Product: productResolvers.Product,
  Order: orderResolvers.Order,
  Category: categoryResolvers.Category,
};
