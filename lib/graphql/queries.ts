import { gql } from '@apollo/client';

// Categories queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      slug
      parent {
        id
        name
      }
      children {
        id
        name
        slug
      }
      _count {
        products
      }
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      slug
      parent {
        id
        name
      }
      children {
        id
        name
        slug
      }
      products {
        id
        name
        price
        images {
          id
          url
          altText
          isPrimary
        }
        seller {
          id
          profile {
            storeName
          }
        }
      }
    }
  }
`;

// Products queries
export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($limit: Int = 5) {
    products(limit: $limit, featured: true) {
      id
      name
      description
      price
      sku
      stock
      status
      images {
        id
        url
        altText
        isPrimary
      }
      videos {
        id
        url
        publicId
      }
      features {
        id
        feature
        value
      }
      categories {
        id
        category {
          id
          name
          slug
        }
      }
      discount {
        id
        type
        value
        startDate
        endDate
      }
      seller {
        id
        email
        profile {
          id
          storeName
          storeDescription
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int = 20, $offset: Int = 0, $filter: ProductFilterInput) {
    products(limit: $limit, offset: $offset, filter: $filter) {
      id
      name
      description
      price
      sku
      stock
      status
      images {
        id
        url
        altText
        isPrimary
      }
      categories {
        id
        category {
          id
          name
          slug
        }
      }
      discount {
        id
        type
        value
        startDate
        endDate
      }
      seller {
        id
        profile {
          storeName
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      sku
      stock
      status
      images {
        id
        url
        altText
        isPrimary
      }
      videos {
        id
        url
        publicId
      }
      features {
        id
        feature
        value
      }
      categories {
        id
        category {
          id
          name
          slug
        }
      }
      discount {
        id
        type
        value
        startDate
        endDate
      }
      seller {
        id
        email
        profile {
          id
          storeName
          storeDescription
          contactEmail
          contactPhone
        }
      }
      reviews {
        id
        rating
        comment
        user {
          id
          profile {
            firstName
            lastName
          }
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int = 20) {
    searchProducts(query: $query, limit: $limit) {
      id
      name
      description
      price
      images {
        id
        url
        altText
        isPrimary
      }
      categories {
        id
        category {
          id
          name
          slug
        }
      }
      seller {
        id
        profile {
          storeName
        }
      }
    }
  }
`;

// User and Profile queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      role
      profile {
        id
        firstName
        lastName
        storeName
        storeDescription
        contactEmail
        contactPhone
        addresses {
          id
          type
          street
          city
          state
          zipCode
          country
          isDefault
        }
      }
    }
  }
`;

// Orders queries
export const GET_USER_ORDERS = gql`
  query GetUserOrders($limit: Int = 10, $offset: Int = 0) {
    orders(limit: $limit, offset: $offset) {
      id
      status
      total
      items {
        id
        quantity
        price
        product {
          id
          name
          images {
            id
            url
            altText
            isPrimary
          }
        }
      }
      user {
        id
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      total
      items {
        id
        quantity
        price
        product {
          id
          name
          description
          images {
            id
            url
            altText
            isPrimary
          }
          seller {
            id
            profile {
              storeName
              contactEmail
            }
          }
        }
      }
      user {
        id
        email
        profile {
          firstName
          lastName
          addresses {
            id
            type
            street
            city
            state
            zipCode
            country
            isDefault
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Analytics queries
export const GET_SALES_ANALYTICS = gql`
  query GetSalesAnalytics($startDate: DateTime, $endDate: DateTime) {
    salesAnalytics(startDate: $startDate, endDate: $endDate) {
      totalRevenue
      totalOrders
      averageOrderValue
      monthlyRevenue {
        month
        revenue
        orders
      }
      topProducts {
        product {
          id
          name
        }
        totalSold
        revenue
      }
    }
  }
`;

export const GET_INVENTORY_STATS = gql`
  query GetInventoryStats {
    inventoryStats {
      totalProducts
      lowStockProducts
      outOfStockProducts
      totalValue
    }
  }
`;

// Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      success
      message
      product {
        id
        name
        description
        price
        sku
        stock
        status
        images {
          id
          url
          altText
          isPrimary
        }
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      success
      message
      product {
        id
        name
        description
        price
        sku
        stock
        status
        images {
          id
          url
          altText
          isPrimary
        }
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($id: ID!, $status: ProductStatus!) {
    updateProductStatus(id: $id, status: $status) {
      success
      message
      product {
        id
        status
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;
