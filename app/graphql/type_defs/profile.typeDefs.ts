import { gql } from 'graphql-tag';

export const profileTypeDefs = gql`
  # Enums
  enum AddressType {
    STORE
    PERMANENT
    TEMPORARY
  }

  enum ProfileSection {
    PERSONAL_DETAILS
    ADDRESSES
    STORE_DETAILS
    DOCUMENTATION
  }

  enum ProfileStatus {
    INCOMPLETE
    PENDING_VERIFICATION
    VERIFIED
    SUSPENDED
  }

  # Core Profile Types
  type Profile {
    id: ID!
    userId: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    phoneNumber: String
    avatar: String
    addresses: [Address!]!
    document: Document
    storeDetail: StoreDetail
    isComplete: Boolean!
    completionPercentage: Float!
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
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Document {
    id: ID!
    panNumber: String!
    profileId: ID!
    isVerified: Boolean!
    verificationDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StoreDetail {
    id: ID!
    storeName: String!
    storeType: String!
    description: String
    addressId: ID!
    storeAddress: Address!
    profileId: ID!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Input Types for Creating Profile
  input CreateProfileInput {
    personalDetails: PersonalDetailsInput!
    addresses: [CreateAddressInput!]!
    storeDetails: CreateStoreDetailsInput!
    documentation: CreateDocumentationInput!
  }

  input PersonalDetailsInput {
    firstName: String!
    lastName: String!
    phoneNumber: String
    avatar: String
  }

  input CreateAddressInput {
    province: String!
    addressLabel: String
    pinCode: String!
    locality: String!
    city: String!
    landMark: String
    addressType: AddressType!
    isDefault: Boolean
  }

  input CreateStoreDetailsInput {
    storeName: String!
    storeType: String!
    description: String
    storeAddressIndex: Int! # Index in addresses array for store address
  }

  input CreateDocumentationInput {
    panNumber: String!
  }

  # Input Types for Updating Profile
  input UpdateProfileInput {
    personalDetails: UpdatePersonalDetailsInput
    addresses: UpdateAddressesInput
    storeDetails: UpdateStoreDetailsInput
    documentation: UpdateDocumentationInput
  }

  input UpdatePersonalDetailsInput {
    firstName: String
    lastName: String
    phoneNumber: String
    avatar: String
  }

  input UpdateAddressesInput {
    create: [CreateAddressInput!]
    update: [UpdateAddressInput!]
    delete: [ID!]
  }

  input UpdateAddressInput {
    id: ID!
    province: String
    addressLabel: String
    pinCode: String
    locality: String
    city: String
    landMark: String
    isDefault: Boolean
  }

  input UpdateStoreDetailsInput {
    storeName: String
    storeType: String
    description: String
    addressId: ID
  }

  input UpdateDocumentationInput {
    panNumber: String
  }

  # Legacy Input (for backward compatibility)
  input ProfileSetupInput {
    personalDetails: PersonalDetailsInput!
    permanentAddress: AddressInput!
    temporaryAddress: AddressInput!
    storeDetails: StoreDetailsInput!
    storeAddress: AddressInput!
    documentation: DocumentationInput!
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

  # Response Types
  type ProfileResponse {
    success: Boolean!
    message: String!
    profile: Profile
    errors: [ProfileError!]
  }

  type ProfileSetupResponse {
    success: Boolean!
    message: String!
    profile: Profile
  }

  type ProfileSetupPayload {
    success: Boolean!
    message: String!
    profileId: ID
  }

  type ProfileError {
    field: String!
    message: String!
    code: String!
  }

  type ProfileValidationResult {
    isValid: Boolean!
    errors: [ProfileError!]!
    completionPercentage: Float!
    missingFields: [String!]!
  }

  type AddressResponse {
    success: Boolean!
    message: String!
    address: Address
    errors: [ProfileError!]
  }

  type ProfileCompletionStatus {
    isComplete: Boolean!
    completionPercentage: Float!
    missingSteps: [ProfileStep!]!
    nextStep: ProfileStep
  }

  type ProfileStep {
    step: String!
    name: String!
    description: String!
    isComplete: Boolean!
    isRequired: Boolean!
  }

  # Queries
  extend type Query {
    # Get current user's profile
    myProfile: Profile
    profile: Profile # Legacy support
    
    # Get profile by ID (admin only)
    profileById(id: ID!): Profile
    
    # Validate profile data without saving
    validateProfile(input: CreateProfileInput!): ProfileValidationResult!
    
    # Get profile completion status
    profileCompletionStatus: ProfileCompletionStatus!
  }

  # Mutations
  extend type Mutation {
    # Create new profile (enhanced)
    createProfile(input: CreateProfileInput!): ProfileResponse!
    
    # Update existing profile (enhanced)
    updateProfile(input: UpdateProfileInput!): ProfileResponse!
    
    # Legacy mutations (for backward compatibility)
    setupProfile(input: ProfileSetupInput!): ProfileSetupResponse!
    completeProfileSetup(input: ProfileSetupInput!): ProfileSetupPayload!
    
    # Update specific sections
    updatePersonalDetails(input: UpdatePersonalDetailsInput!): ProfileResponse!
    updateProfileAddresses(input: UpdateAddressesInput!): ProfileResponse!
    updateStoreDetails(input: UpdateStoreDetailsInput!): ProfileResponse!
    updateDocumentation(input: UpdateDocumentationInput!): ProfileResponse!
    
    # Address management
    addAddress(input: CreateAddressInput!): AddressResponse!
    updateAddress(id: ID!, input: UpdateAddressInput!): AddressResponse!
    deleteAddress(id: ID!): DeleteResponse!
    setDefaultAddress(id: ID!, addressType: AddressType!): AddressResponse!
    
    # Upload avatar
    uploadAvatar(file: Upload!): ProfileResponse!
    
    # Delete profile (soft delete)
    deleteProfile: DeleteResponse!
  }
`;
