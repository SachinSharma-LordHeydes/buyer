import { GraphQLContext } from '../context';
import { requireAuth, validateInput, handleAsyncErrors } from './auth.helpers';
import { AddressType, Role } from '@prisma/client';

/**
 * Validation helpers
 */
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
  const cleanPhone = phone.replace(/[()\s-]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
};

const validatePanNumber = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

const validateProfileSetupInput = (input: any) => {
  const { personalDetails, storeDetails, documentation, permanentAddress, temporaryAddress, storeAddress } = input;

  // Validate personal details
  validateInput(personalDetails, ['firstName', 'lastName']);
  if (personalDetails.phoneNumber && !validatePhoneNumber(personalDetails.phoneNumber)) {
    throw new Error('Invalid phone number format');
  }

  // Validate store details
  validateInput(storeDetails, ['storeName', 'storeType']);

  // Validate documentation
  validateInput(documentation, ['panNumber']);
  if (!validatePanNumber(documentation.panNumber)) {
    throw new Error('Invalid PAN number format');
  }

  // Validate addresses
  const addresses = [permanentAddress, temporaryAddress, storeAddress];
  const addressTypes = ['permanent', 'temporary', 'store'];
  
  addresses.forEach((address, index) => {
    const type = addressTypes[index];
    validateInput(address, ['province', 'city', 'pinCode', 'locality']);
    if (!validatePincode(address.pinCode)) {
      throw new Error(`Invalid ${type} address pincode format`);
    }
  });
};

export const profileResolvers = {
  Query: {
    profile: async (_: any, __: any, context: GraphQLContext) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        
        const profile = await context.prisma.profile.findUnique({
          where: { userId: user.id },
          include: {
            addresses: true,
            document: true,
            storeDetail: {
              include: {
                storeAddress: true
              }
            }
          }
        });

        return profile;
      }, 'Failed to fetch profile');
    },
  },

  Mutation: {
    setupProfile: async (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        
        // Validate input
        validateProfileSetupInput(input);

        // Check if profile already exists
        const existingProfile = await context.prisma.profile.findUnique({
          where: { userId: user.id }
        });

        if (existingProfile) {
          throw new Error('Profile already exists. Use updateProfile to modify existing profile.');
        }

        // Create profile with transaction
        const profile = await context.prisma.$transaction(async (tx) => {
          // Create profile
          const newProfile = await tx.profile.create({
            data: {
              userId: user.id,
              firstName: input.personalDetails.firstName.trim(),
              lastName: input.personalDetails.lastName.trim(),
              phoneNumber: input.personalDetails.phoneNumber?.trim() || null,
            },
          });

          // Create addresses
          const addressData = [
            {
              ...input.permanentAddress,
              profileId: newProfile.id,
              addressType: AddressType.PERMANENT,
              province: input.permanentAddress.province.trim(),
              city: input.permanentAddress.city.trim(),
              pinCode: input.permanentAddress.pinCode.trim(),
              locality: input.permanentAddress.locality.trim(),
              landMark: input.permanentAddress.landMark?.trim() || null,
              addressLabel: input.permanentAddress.addressLabel?.trim() || null,
            },
            {
              ...input.temporaryAddress,
              profileId: newProfile.id,
              addressType: AddressType.TEMPORARY,
              province: input.temporaryAddress.province.trim(),
              city: input.temporaryAddress.city.trim(),
              pinCode: input.temporaryAddress.pinCode.trim(),
              locality: input.temporaryAddress.locality.trim(),
              landMark: input.temporaryAddress.landMark?.trim() || null,
              addressLabel: input.temporaryAddress.addressLabel?.trim() || null,
            },
            {
              ...input.storeAddress,
              profileId: newProfile.id,
              addressType: AddressType.STORE,
              province: input.storeAddress.province.trim(),
              city: input.storeAddress.city.trim(),
              pinCode: input.storeAddress.pinCode.trim(),
              locality: input.storeAddress.locality.trim(),
              landMark: input.storeAddress.landMark?.trim() || null,
              addressLabel: input.storeAddress.addressLabel?.trim() || null,
            },
          ];

          const addresses = await Promise.all(
            addressData.map((address) => tx.address.create({ data: address }))
          );

          const storeAddress = addresses[2];

          // Create store details
          await tx.storeDetail.create({
            data: {
              storeName: input.storeDetails.storeName.trim(),
              storeType: input.storeDetails.storeType.trim(),
              description: input.storeDetails.description?.trim() || null,
              profileId: newProfile.id,
              addressId: storeAddress.id,
            },
          });

          // Create documentation
          await tx.document.create({
            data: {
              panNumber: input.documentation.panNumber.toUpperCase().trim(),
              profileId: newProfile.id,
            },
          });

          // Update user role to SELLER
          await tx.user.update({
            where: { id: user.id },
            data: { role: Role.SELLER }
          });

          return newProfile;
        });

        return {
          success: true,
          message: 'Profile setup completed successfully. You are now a verified seller!',
          profile: await context.prisma.profile.findUnique({
            where: { id: profile.id },
            include: {
              addresses: true,
              document: true,
              storeDetail: {
                include: {
                  storeAddress: true
                }
              }
            }
          })
        };
      }, 'Failed to setup profile');
    },

    updateProfile: async (
      _: any,
      { input }: { input: any },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        const user = requireAuth(context);
        
        const existingProfile = await context.prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        if (!existingProfile) {
          throw new Error('Profile not found. Please setup your profile first.');
        }

        // Validate input if provided
        if (input.personalDetails?.phoneNumber && 
            !validatePhoneNumber(input.personalDetails.phoneNumber)) {
          throw new Error('Invalid phone number format');
        }

        const updateData: any = {};
        if (input.personalDetails) {
          if (input.personalDetails.firstName) {
            updateData.firstName = input.personalDetails.firstName.trim();
          }
          if (input.personalDetails.lastName) {
            updateData.lastName = input.personalDetails.lastName.trim();
          }
          if (input.personalDetails.phoneNumber) {
            updateData.phoneNumber = input.personalDetails.phoneNumber.trim();
          }
        }

        const updatedProfile = await context.prisma.profile.update({
          where: { userId: user.id },
          data: updateData,
          include: {
            addresses: true,
            document: true,
            storeDetail: {
              include: {
                storeAddress: true,
              },
            },
          },
        });

        return {
          success: true,
          message: 'Profile updated successfully',
          profile: updatedProfile
        };
      }, 'Failed to update profile');
    },
  },

  Profile: {
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
};
