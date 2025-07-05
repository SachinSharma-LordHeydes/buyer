import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar Upload
  scalar JSON
  scalar Decimal

  # Enums
  enum Role {
    USER
    SELLER
    ADMIN
  }

  enum ProductStatus {
    PENDING
    APPROVED
    REJECTED
    SUSPENDED
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum AddressType {
    STORE
    PERMANENT
    TEMPORARY
  }

  # User Types
  type User {
    id: ID!
    clerkId: String!
    email: String!
    role: Role!
    profile: Profile
    products: [Product!]!
    orders: [Order!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Profile Types
  type Profile {
    id: ID!
    userId: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String
    avatar: String
    addresses: [Address!]!
    document: Document
    storeDetail: StoreDetail
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    id: ID!
    province: String!
    addressLabel: String
    pinCode: String!
    locality: String!
    city: String!
    landMark: String
    addressType: AddressType!
    profileId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Document {
    id: ID!
    panNumber: String!
    profileId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StoreDetail {
    id: ID!
    storeName: String!
    storeType: String!
    description: String
    addressId: ID!
    profileId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Product Types
  type Product {
    id: ID!
    name: String!
    description: String
    price: Decimal!
    sku: String
    stock: Int!
    sellerId: ID!
    seller: User!
    images: [ProductImage!]!
    videos: [ProductVideo!]!
    features: [ProductFeature!]!
    categories: [Category!]!
    status: ProductStatus!
    discount: Discount
    reviews: [Review!]!
    averageRating: Float
    totalReviews: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImage {
    id: ID!
    url: String!
    altText: String
    isPrimary: Boolean!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductVideo {
    id: ID!
    url: String!
    publicId: String!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductFeature {
    id: ID!
    feature: String!
    value: String
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    slug: String!
    parentId: ID
    parent: Category
    children: [Category!]!
    products: [Product!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Discount {
    id: ID!
    productId: ID!
    discountPercent: Decimal!
    startDate: DateTime!
    endDate: DateTime!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Order Types
  type Order {
    id: ID!
    orderNumber: String!
    status: OrderStatus!
    totalAmount: Decimal!
    userId: ID!
    user: User!
    shippingAddress: JSON!
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    quantity: Int!
    price: Decimal!
    orderId: ID!
    productId: ID!
    product: Product!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Review Types
  type Review {
    id: ID!
    review: String!
    rating: Int!
    userId: ID!
    user: User!
    productId: ID!
    product: Product!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Upload Types
  type CloudinaryUploadResponse {
    url: String!
    signature: String!
    timestamp: String!
    apiKey: String!
    publicId: String!
    folder: String!
    resourceType: String
  }

  # Analytics Types
  type SalesAnalytics {
    totalRevenue: Decimal!
    totalOrders: Int!
    totalProducts: Int!
    averageOrderValue: Decimal!
    revenueGrowth: Float!
    ordersGrowth: Float!
    topProducts: [ProductSalesData!]!
    revenueByMonth: [MonthlyRevenue!]!
  }

  type ProductSalesData {
    product: Product!
    totalSold: Int!
    revenue: Decimal!
  }

  type MonthlyRevenue {
    month: String!
    revenue: Decimal!
    orders: Int!
  }

  type InventoryStats {
    totalProducts: Int!
    activeProducts: Int!
    lowStockProducts: Int!
    outOfStockProducts: Int!
    totalValue: Decimal!
  }

  # Input Types
  input ProfileSetupInput {
    personalDetails: PersonalDetailsInput!
    permanentAddress: AddressInput!
    temporaryAddress: AddressInput!
    storeDetails: StoreDetailsInput!
    storeAddress: AddressInput!
    documentation: DocumentationInput!
  }

  input PersonalDetailsInput {
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  input AddressInput {
    province: String!
    addressLabel: String
    pinCode: String!
    locality: String!
    city: String!
    landMark: String
    addressType: AddressType!
  }

  input StoreDetailsInput {
    storeName: String!
    storeType: String!
    description: String
  }

  input DocumentationInput {
    panNumber: String!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Decimal!
    sku: String
    stock: Int!
    images: [ProductImageInput!]
    videos: [ProductVideoInput!]
    features: [ProductFeatureInput!]
    categories: [ID!]
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Decimal
    sku: String
    stock: Int
    images: [ProductImageInput!]
    videos: [ProductVideoInput!]
    features: [ProductFeatureInput!]
    categories: [ID!]
    status: ProductStatus
  }

  input ProductImageInput {
    url: String!
    altText: String
    isPrimary: Boolean
  }

  input ProductVideoInput {
    url: String!
    publicId: String!
  }

  input ProductFeatureInput {
    feature: String!
    value: String
  }

  input ProductFilterInput {
    status: ProductStatus
    category: ID
    search: String
    minPrice: Decimal
    maxPrice: Decimal
    inStock: Boolean
  }

  input OrderFilterInput {
    status: OrderStatus
    dateFrom: DateTime
    dateTo: DateTime
    search: String
  }

  # Response Types
  type ProfileSetupResponse {
    success: Boolean!
    message: String!
    profile: Profile
  }

  type ProductResponse {
    success: Boolean!
    message: String!
    product: Product
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  # Queries
  type Query {
    # User & Profile
    me: User
    profile: Profile

    # Products
    products(filter: ProductFilterInput, limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    productsByCategory(categoryId: ID!): [Product!]!
    searchProducts(query: String!): [Product!]!

    # Categories
    categories: [Category!]!
    category(id: ID!): Category

    # Orders
    orders(filter: OrderFilterInput, limit: Int, offset: Int): [Order!]!
    order(id: ID!): Order
    ordersByProduct(productId: ID!): [Order!]!

    # Analytics
    salesAnalytics(dateFrom: DateTime, dateTo: DateTime): SalesAnalytics!
    inventoryStats: InventoryStats!

    # Reviews
    productReviews(productId: ID!): [Review!]!
  }

  # Mutations
  type Mutation {
    # Profile Management
    setupProfile(input: ProfileSetupInput!): ProfileSetupResponse!
    updateProfile(input: ProfileSetupInput!): ProfileSetupResponse!

    # Product Management
    createProduct(input: CreateProductInput!): ProductResponse!
    updateProduct(id: ID!, input: UpdateProductInput!): ProductResponse!
    deleteProduct(id: ID!): DeleteResponse!
    updateProductStatus(id: ID!, status: ProductStatus!): ProductResponse!

    # Inventory Management
    updateStock(productId: ID!, quantity: Int!): ProductResponse!
    bulkUpdateStock(updates: [StockUpdateInput!]!): [ProductResponse!]!

    # Order Management
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!

    # File Upload
    generateUploadUrl(folder: String!, resourceType: String!): CloudinaryUploadResponse!
    
    # Category Management
    createCategory(name: String!, description: String, parentId: ID): Category!
    updateCategory(id: ID!, name: String, description: String): Category!
    deleteCategory(id: ID!): DeleteResponse!
  }

  input StockUpdateInput {
    productId: ID!
    quantity: Int!
  }
`;
