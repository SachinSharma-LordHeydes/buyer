import { GraphQLContext } from '../context';
import { requireAuth, handleAsyncErrors } from './auth.helpers';
import { AddressType, Role } from '@prisma/client';
import { ProfileDatabaseService } from './profile/database.service';
import {
  validateProfileSetupInput,
  validatePersonalDetails,
  validateAddress,
  validateStoreDetails,
  validateDocumentation,
  sanitizeInput,
  ValidationError
} from './profile/validation.helpers';

// Helper function to format validation errors
const formatValidationErrors = (errors: ValidationError[]) => {
  return errors.map(error => ({
    field: error.field,
    message: error.message,
    code: error.code
  }));
};

export const profileResolvers = {
  Query: {
    // Legacy profile query
    profile: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        return await dbService.getFullProfile(user.id);
      }, 'Failed to fetch profile');
    },

    // Enhanced profile query
    myProfile: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        return await dbService.getFullProfile(user.id);
      }, 'Failed to fetch profile');
    },

    // Admin-only profile query
    profileById: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        
        // Check if user is admin
        if (user.role !== Role.ADMIN) {
          throw new Error('Access denied. Admin privileges required.');
        }

        const dbService = new ProfileDatabaseService(context);
        return await dbService.getProfileById(id);
      }, 'Failed to fetch profile');
    },

    // Validate profile without saving
    validateProfile: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        requireAuth(context); // Ensure user is authenticated
        
        const sanitizedInput = sanitizeInput(input);
        const validationResult = validateProfileSetupInput(sanitizedInput);
        
        return {
          isValid: validationResult.isValid,
          errors: formatValidationErrors(validationResult.errors),
          completionPercentage: validationResult.isValid ? 100 : 0,
          missingFields: validationResult.errors.map(e => e.field)
        };
      }, 'Failed to validate profile');
    },

    // Get profile completion status
    profileCompletionStatus: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        return await dbService.getProfileCompletionStatus(user.id);
      }, 'Failed to get profile completion status');
    },
  },

  Mutation: {
    // Enhanced create profile
    createProfile: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        // Check if profile already exists
        const exists = await dbService.profileExists(user.id);
        if (exists) {
          return {
            success: false,
            message: 'Profile already exists. Use updateProfile to modify existing profile.',
            profile: null,
            errors: [{
              field: 'general',
              message: 'Profile already exists',
              code: 'PROFILE_ALREADY_EXISTS'
            }]
          };
        }

        // Sanitize and validate input
        const sanitizedInput = sanitizeInput(input);
        const validationResult = validateProfileSetupInput(sanitizedInput);
        
        if (!validationResult.isValid) {
          return {
            success: false,
            message: 'Validation failed',
            profile: null,
            errors: formatValidationErrors(validationResult.errors)
          };
        }

        // Create profile
        const profileId = await dbService.createProfile(user.id, sanitizedInput);
        const profile = await dbService.getFullProfile(user.id);

        return {
          success: true,
          message: 'Profile created successfully. You are now a verified seller!',
          profile,
          errors: []
        };
      }, 'Failed to create profile');
    },

    // Enhanced update profile
    updateProfile: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        // Check if profile exists
        const exists = await dbService.profileExists(user.id);
        if (!exists) {
          return {
            success: false,
            message: 'Profile not found. Please create your profile first.',
            profile: null,
            errors: [{
              field: 'general',
              message: 'Profile not found',
              code: 'PROFILE_NOT_FOUND'
            }]
          };
        }

        // Sanitize input
        const sanitizedInput = sanitizeInput(input);
        const errors: ValidationError[] = [];

        // Validate each section if provided
        if (sanitizedInput.personalDetails) {
          errors.push(...validatePersonalDetails(sanitizedInput.personalDetails));
        }
        if (sanitizedInput.storeDetails) {
          errors.push(...validateStoreDetails(sanitizedInput.storeDetails));
        }
        if (sanitizedInput.documentation) {
          errors.push(...validateDocumentation(sanitizedInput.documentation));
        }

        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            profile: null,
            errors: formatValidationErrors(errors)
          };
        }

        // Update sections
        if (sanitizedInput.personalDetails) {
          await dbService.updatePersonalDetails(user.id, sanitizedInput.personalDetails);
        }
        if (sanitizedInput.storeDetails) {
          await dbService.updateStoreDetails(user.id, sanitizedInput.storeDetails);
        }
        if (sanitizedInput.documentation) {
          await dbService.updateDocumentation(user.id, sanitizedInput.documentation);
        }
        // Address updates would need special handling

        const profile = await dbService.getFullProfile(user.id);

        return {
          success: true,
          message: 'Profile updated successfully',
          profile,
          errors: []
        };
      }, 'Failed to update profile');
    },

    // Legacy setupProfile (for backward compatibility)
    setupProfile: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        // Check if profile already exists
        const exists = await dbService.profileExists(user.id);
        if (exists) {
          throw new Error('Profile already exists. Use updateProfile to modify existing profile.');
        }

        // Validate input
        const sanitizedInput = sanitizeInput(input);
        const validationResult = validateProfileSetupInput(sanitizedInput);
        
        if (!validationResult.isValid) {
          throw new Error(validationResult.errors[0]?.message || 'Validation failed');
        }

        // Create profile
        await dbService.createProfile(user.id, sanitizedInput);
        const profile = await dbService.getFullProfile(user.id);

        return {
          success: true,
          message: 'Profile setup completed successfully. You are now a verified seller!',
          profile
        };
      }, 'Failed to setup profile');
    },

    // Section-specific updates
    updatePersonalDetails: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const sanitizedInput = sanitizeInput(input);
        const errors = validatePersonalDetails(sanitizedInput);
        
        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            profile: null,
            errors: formatValidationErrors(errors)
          };
        }

        const profile = await dbService.updatePersonalDetails(user.id, sanitizedInput);

        return {
          success: true,
          message: 'Personal details updated successfully',
          profile,
          errors: []
        };
      }, 'Failed to update personal details');
    },

    updateStoreDetails: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const sanitizedInput = sanitizeInput(input);
        const errors = validateStoreDetails(sanitizedInput);
        
        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            profile: null,
            errors: formatValidationErrors(errors)
          };
        }

        await dbService.updateStoreDetails(user.id, sanitizedInput);
        const profile = await dbService.getFullProfile(user.id);

        return {
          success: true,
          message: 'Store details updated successfully',
          profile,
          errors: []
        };
      }, 'Failed to update store details');
    },

    updateDocumentation: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const sanitizedInput = sanitizeInput(input);
        const errors = validateDocumentation(sanitizedInput);
        
        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            profile: null,
            errors: formatValidationErrors(errors)
          };
        }

        await dbService.updateDocumentation(user.id, sanitizedInput);
        const profile = await dbService.getFullProfile(user.id);

        return {
          success: true,
          message: 'Documentation updated successfully',
          profile,
          errors: []
        };
      }, 'Failed to update documentation');
    },

    // Address management
    addAddress: async (_: any, { input }: { input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const sanitizedInput = sanitizeInput(input);
        const errors = validateAddress(sanitizedInput, 'address');
        
        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            address: null,
            errors: formatValidationErrors(errors)
          };
        }

        const address = await dbService.addAddress(user.id, sanitizedInput);

        return {
          success: true,
          message: 'Address added successfully',
          address,
          errors: []
        };
      }, 'Failed to add address');
    },

    updateAddress: async (_: any, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const sanitizedInput = sanitizeInput(input);
        const address = await dbService.updateAddress(id, sanitizedInput);

        return {
          success: true,
          message: 'Address updated successfully',
          address,
          errors: []
        };
      }, 'Failed to update address');
    },

    deleteAddress: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        await dbService.deleteAddress(id);

        return {
          success: true,
          message: 'Address deleted successfully'
        };
      }, 'Failed to delete address');
    },

    setDefaultAddress: async (_: any, { id, addressType }: { id: string, addressType: AddressType }, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        const address = await dbService.setDefaultAddress(id, addressType);

        return {
          success: true,
          message: 'Default address updated successfully',
          address,
          errors: []
        };
      }, 'Failed to set default address');
    },

    deleteProfile: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        const dbService = new ProfileDatabaseService(context);
        
        await dbService.deleteProfile(user.id);

        return {
          success: true,
          message: 'Profile deleted successfully'
        };
      }, 'Failed to delete profile');
    },
  },

  // Field resolvers
  Profile: {
    fullName: (parent: any) => {
      return `${parent.firstName} ${parent.lastName}`.trim();
    },

    isComplete: async (parent: any, _: any, context: GraphQLContext) => {
      const dbService = new ProfileDatabaseService(context);
      const status = await dbService.getProfileCompletionStatus(parent.userId);
      return status.isComplete;
    },

    completionPercentage: async (parent: any, _: any, context: GraphQLContext) => {
      const dbService = new ProfileDatabaseService(context);
      const status = await dbService.getProfileCompletionStatus(parent.userId);
      return status.completionPercentage;
    },

    storeDetail: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.storeDetail.findUnique({
        where: { profileId: parent.id },
        include: {
          storeAddress: true
        }
      });
    },

    document: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.document.findUnique({
        where: { profileId: parent.id }
      });
    },

    addresses: async (parent: any, _: any, context: GraphQLContext) => {
      return context.prisma.address.findMany({
        where: { profileId: parent.id },
        orderBy: { addressType: 'asc' }
      });
    },
  },

  Address: {
    isDefault: (parent: any) => {
      return parent.isDefault || false;
    },
  },

  Document: {
    isVerified: (parent: any) => {
      return parent.isVerified || false;
    },
  },

  StoreDetail: {
    isActive: (parent: any) => {
      return parent.isActive !== false; // Default to true if not set
    },
  },
};
