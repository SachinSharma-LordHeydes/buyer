# Enhanced Profile Management System

## Overview

The profile management system has been completely rewritten to be modular, scalable, and maintainable. The new architecture separates concerns into distinct layers and provides comprehensive validation, error handling, and type safety.

## Architecture Components

### 1. **Type Definitions** (`app/graphql/type_defs/profile.typeDefs.ts`)

**Enhanced Features:**
- Complete GraphQL schema for profile operations
- Support for both legacy and new input formats
- Comprehensive response types with structured error handling
- Profile completion tracking
- Address management with default address support
- Document verification status
- Store activation status

**Key Types:**
- `Profile` - Enhanced with completion tracking
- `Address` - Added `isDefault` field
- `Document` - Added verification status
- `StoreDetail` - Added activation status
- `ProfileResponse` - Structured error responses
- `ProfileCompletionStatus` - Progress tracking

### 2. **Validation Layer** (`app/graphql/resolvers/profile/validation.helpers.ts`)

**Features:**
- Modular validation functions for each profile section
- Comprehensive error reporting with error codes
- Input sanitization
- Profile completion calculation
- Phone number, PAN, and pincode validation

**Key Functions:**
- `validateProfileSetupInput()` - Main validation orchestrator
- `validatePersonalDetails()` - Personal info validation
- `validateAddress()` - Address validation
- `validateStoreDetails()` - Store information validation
- `validateDocumentation()` - Document validation
- `sanitizeInput()` - Input sanitization

### 3. **Database Service Layer** (`app/graphql/resolvers/profile/database.service.ts`)

**Features:**
- Encapsulated database operations
- Transaction management
- Address default handling
- Profile completion status calculation
- Soft delete support

**Key Methods:**
- `createProfile()` - Complete profile creation with transactions
- `updatePersonalDetails()` - Section-specific updates
- `addAddress()` - Address management
- `getProfileCompletionStatus()` - Progress tracking
- `setDefaultAddress()` - Default address management

### 4. **Enhanced Resolvers** (`app/graphql/resolvers/profile.resolvers.ts`)

**Features:**
- Comprehensive error handling
- Support for both legacy and new APIs
- Section-specific update operations
- Admin-only operations
- Validation before database operations

**Key Resolvers:**

#### Queries:
- `myProfile` - Get current user's profile
- `profileById` - Admin-only profile access
- `validateProfile` - Validate without saving
- `profileCompletionStatus` - Get completion progress

#### Mutations:
- `createProfile` - Enhanced profile creation
- `updateProfile` - Flexible profile updates
- `setupProfile` - Legacy compatibility
- `updatePersonalDetails` - Section updates
- `addAddress` - Address management
- `setDefaultAddress` - Default address management

## Database Schema Enhancements

### New Fields Added:

1. **Address Model:**
   - `isDefault: Boolean` - Default address flag per type

2. **Document Model:**
   - `isVerified: Boolean` - Verification status
   - `verificationDate: DateTime?` - When verified

3. **StoreDetail Model:**
   - `isActive: Boolean` - Store activation status

## API Usage Examples

### 1. Create Profile (New Enhanced API)

```graphql
mutation CreateProfile($input: CreateProfileInput!) {
  createProfile(input: $input) {
    success
    message
    profile {
      id
      fullName
      isComplete
      completionPercentage
    }
    errors {
      field
      message
      code
    }
  }
}
```

### 2. Update Specific Section

```graphql
mutation UpdatePersonalDetails($input: UpdatePersonalDetailsInput!) {
  updatePersonalDetails(input: $input) {
    success
    message
    profile {
      firstName
      lastName
      phoneNumber
    }
    errors {
      field
      message
      code
    }
  }
}
```

### 3. Address Management

```graphql
mutation AddAddress($input: CreateAddressInput!) {
  addAddress(input: $input) {
    success
    message
    address {
      id
      city
      addressType
      isDefault
    }
    errors {
      field
      message
      code
    }
  }
}
```

### 4. Profile Completion Status

```graphql
query GetProfileCompletion {
  profileCompletionStatus {
    isComplete
    completionPercentage
    missingSteps {
      step
      name
      description
      isRequired
    }
    nextStep {
      step
      name
      description
    }
  }
}
```

## Error Handling

### Structured Error Responses

All mutations return structured errors with:
- `field` - Which field has the error
- `message` - Human-readable error message
- `code` - Machine-readable error code

### Error Codes

- `REQUIRED_FIELD_MISSING` - Required field not provided
- `INVALID_PHONE_FORMAT` - Invalid phone number
- `INVALID_PAN_FORMAT` - Invalid PAN number
- `INVALID_PINCODE_FORMAT` - Invalid pincode
- `PROFILE_ALREADY_EXISTS` - Profile exists
- `PROFILE_NOT_FOUND` - Profile doesn't exist

## Backward Compatibility

The system maintains full backward compatibility:

1. **Legacy `setupProfile` mutation** - Still works with existing frontend
2. **Legacy input types** - `ProfileSetupInput` still supported
3. **Legacy response types** - `ProfileSetupResponse` maintained

## Migration from Old System

### Frontend Migration Steps:

1. **Immediate (No Changes Required):**
   - Existing `setupProfile` mutation continues to work
   - Current form validation remains functional

2. **Gradual Enhancement:**
   - Add error display for structured errors
   - Implement profile completion progress
   - Add section-specific update capabilities

3. **Future Enhancements:**
   - Migrate to new `createProfile` API
   - Implement address management features
   - Add profile completion tracking

## Benefits of New Architecture

### 1. **Modularity**
- Separated validation, database, and resolver logic
- Easy to test individual components
- Clear separation of concerns

### 2. **Scalability**
- Service layer can be reused across different resolvers
- Validation can be shared between client and server
- Database operations are optimized and transactional

### 3. **Maintainability**
- Clear error messages with codes
- Comprehensive logging
- Type-safe operations
- Consistent patterns across operations

### 4. **User Experience**
- Detailed validation errors
- Profile completion tracking
- Section-specific updates
- Progress indicators

### 5. **Developer Experience**
- Better error handling
- Comprehensive documentation
- Type safety
- Reusable components

## Future Enhancements

1. **Profile Picture Upload**
2. **Document Upload and Verification**
3. **Address Geocoding**
4. **Profile Analytics**
5. **Bulk Operations**
6. **Profile Templates**
7. **Audit Logging**

## Testing Strategy

1. **Unit Tests** - For validation functions
2. **Integration Tests** - For database operations
3. **E2E Tests** - For complete profile flows
4. **Validation Tests** - For all input scenarios
5. **Error Handling Tests** - For all error conditions

This enhanced architecture provides a solid foundation for future growth while maintaining backward compatibility and improving the overall developer and user experience.
