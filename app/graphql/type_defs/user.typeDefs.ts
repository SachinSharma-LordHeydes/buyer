import gql from "graphql-tag";

export const userTypeDefs = gql`
  enum Role {
    USER
    SELLER
    ADMIN
  }

  type User {
    id: ID!
    clerkId: String!
    email: String!
    role: Role!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
  }

  type CartItem {
    id: ID!
    quantity: Int!
    userId: ID!
    productId: ID!
    product: Product!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WishlistItem {
    id: ID!
    userId: ID!
    productId: ID!
    product: Product!
    createdAt: DateTime!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    addToCart(productId: ID!, quantity: Int!): CartItem
    addToWishlist(productId: ID!): WishlistItem
  }
`;
