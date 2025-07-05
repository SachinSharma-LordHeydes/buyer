import gql from "graphql-tag";

export const fileUploadTypeDefs = gql`
  type CloudinaryUpload {
    url: String!
    signature: String!
    timestamp: String!
    apiKey: String!
    publicId: String!
    folder: String!
    resourceType: String # Optional field for videos
  }

  extend type Mutation {
    generateUploadUrl(productId: ID!, isImage: Boolean!): CloudinaryUpload!
    saveProductMedia(
      productId: ID!
      url: String!
      publicId: String
      altText: String
      isPrimary: Boolean
      isImage: Boolean!
    ): ID!
  }
`;
