import gql from "graphql-tag";

export const profileTypeDefs = gql`
  enum AddressType {
    STORE
    PERMANENT
    TEMPORARY
  }

  # inputs.graphql
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

  input ProfileSetupInput {
    personalDetails: PersonalDetailsInput!
    temporaryAddress: AddressInput!
    permanentAddress: AddressInput!
    storeDetails: StoreDetailsInput!
    storeAddress: AddressInput!
    documentation: DocumentationInput!
  }

  # types.graphql
  type Profile {
    id: ID!
    userId: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String
    addresses: [Address!]!
    document: Document
    avatar: String
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
    addressId: ID
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    profile(userId: ID): Profile
  }

  extend type Mutation {
    completeProfileSetup(input: ProfileSetupInput!): ProfileSetupPayload!
    updateProfile(input: ProfileSetupInput!): ProfileSetupPayload!
  }

  type ProfileSetupPayload {
    success: Boolean!
    message: String!
    profileId: ID
  }
`;
