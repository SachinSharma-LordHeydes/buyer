import { PrismaClient, AddressType, Role } from '@prisma/client';
import { GraphQLContext } from '../../context';

export class ProfileDatabaseService {
  private prisma: PrismaClient;

  constructor(context: GraphQLContext) {
    this.prisma = context.prisma;
  }

  // Check if profile exists
  async profileExists(userId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true }
    });
    return !!profile;
  }

  // Get full profile with all relations
  async getFullProfile(userId: string) {
    return await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        addresses: {
          orderBy: { addressType: 'asc' }
        },
        document: true,
        storeDetail: {
          include: {
            storeAddress: true
          }
        }
      }
    });
  }

  // Get profile by ID (admin function)
  async getProfileById(profileId: string) {
    return await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        addresses: {
          orderBy: { addressType: 'asc' }
        },
        document: true,
        storeDetail: {
          include: {
            storeAddress: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });
  }

  // Create profile with all related data
  async createProfile(userId: string, input: any) {
    return await this.prisma.$transaction(async (tx) => {
      // Create the profile first
      const profile = await tx.profile.create({
        data: {
          userId,
          firstName: input.personalDetails.firstName.trim(),
          lastName: input.personalDetails.lastName.trim(),
          phoneNumber: input.personalDetails.phoneNumber?.trim() || null,
          avatar: input.personalDetails.avatar?.trim() || null,
        },
      });

      // Handle addresses based on input format
      let addresses: any[] = [];
      
      if (input.addresses && Array.isArray(input.addresses)) {
        // New format: array of addresses
        addresses = await Promise.all(
          input.addresses.map(async (address: any) => {
            return await tx.address.create({
              data: {
                ...this.sanitizeAddressData(address),
                profileId: profile.id,
                isDefault: address.isDefault || false,
              }
            });
          })
        );
      } else {
        // Legacy format: separate address fields
        const addressData = [
          {
            ...this.sanitizeAddressData(input.permanentAddress),
            profileId: profile.id,
            addressType: AddressType.PERMANENT,
            isDefault: true,
          },
          {
            ...this.sanitizeAddressData(input.temporaryAddress),
            profileId: profile.id,
            addressType: AddressType.TEMPORARY,
            isDefault: false,
          },
          {
            ...this.sanitizeAddressData(input.storeAddress),
            profileId: profile.id,
            addressType: AddressType.STORE,
            isDefault: false,
          },
        ];

        addresses = await Promise.all(
          addressData.map(address => tx.address.create({ data: address }))
        );
      }

      // Find store address
      let storeAddress = addresses.find(addr => addr.addressType === AddressType.STORE);
      
      if (!storeAddress && input.storeDetails.storeAddressIndex !== undefined) {
        // Use specified index for store address
        storeAddress = addresses[input.storeDetails.storeAddressIndex];
        if (storeAddress) {
          // Update the address type to STORE
          storeAddress = await tx.address.update({
            where: { id: storeAddress.id },
            data: { addressType: AddressType.STORE }
          });
        }
      }

      if (!storeAddress) {
        throw new Error('Store address is required');
      }

      // Create store details
      await tx.storeDetail.create({
        data: {
          storeName: input.storeDetails.storeName.trim(),
          storeType: input.storeDetails.storeType.trim(),
          description: input.storeDetails.description?.trim() || null,
          profileId: profile.id,
          addressId: storeAddress.id,
          isActive: true,
        },
      });

      // Create documentation
      await tx.document.create({
        data: {
          panNumber: input.documentation.panNumber.toUpperCase().trim(),
          profileId: profile.id,
          isVerified: false,
        },
      });

      // Update user role to SELLER
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.SELLER }
      });

      return profile;
    });
  }

  // Update profile sections
  async updatePersonalDetails(userId: string, input: any) {
    const updateData: any = {};
    
    if (input.firstName) updateData.firstName = input.firstName.trim();
    if (input.lastName) updateData.lastName = input.lastName.trim();
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber?.trim() || null;
    if (input.avatar !== undefined) updateData.avatar = input.avatar?.trim() || null;

    return await this.prisma.profile.update({
      where: { userId },
      data: updateData,
      include: {
        addresses: { orderBy: { addressType: 'asc' } },
        document: true,
        storeDetail: { include: { storeAddress: true } }
      }
    });
  }

  // Address management
  async addAddress(userId: string, addressInput: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // If this is set as default, unset other defaults of the same type
    if (addressInput.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          profileId: profile.id,
          addressType: addressInput.addressType
        },
        data: { isDefault: false }
      });
    }

    return await this.prisma.address.create({
      data: {
        ...this.sanitizeAddressData(addressInput),
        profileId: profile.id,
        isDefault: addressInput.isDefault || false,
      }
    });
  }

  async updateAddress(addressId: string, input: any) {
    const updateData = this.sanitizeAddressData(input);
    
    // If setting as default, unset other defaults of the same type
    if (input.isDefault) {
      const address = await this.prisma.address.findUnique({
        where: { id: addressId },
        select: { addressType: true, profileId: true }
      });

      if (address) {
        await this.prisma.address.updateMany({
          where: {
            profileId: address.profileId,
            addressType: address.addressType,
            id: { not: addressId }
          },
          data: { isDefault: false }
        });
      }
    }

    return await this.prisma.address.update({
      where: { id: addressId },
      data: updateData
    });
  }

  async deleteAddress(addressId: string) {
    // Check if this address is used by store details
    const storeDetail = await this.prisma.storeDetail.findFirst({
      where: { addressId }
    });

    if (storeDetail) {
      throw new Error('Cannot delete address that is being used as store address');
    }

    return await this.prisma.address.delete({
      where: { id: addressId }
    });
  }

  async setDefaultAddress(addressId: string, addressType: AddressType) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
      select: { profileId: true, addressType: true }
    });

    if (!address) {
      throw new Error('Address not found');
    }

    if (address.addressType !== addressType) {
      throw new Error('Address type mismatch');
    }

    await this.prisma.$transaction(async (tx) => {
      // Unset all defaults for this address type
      await tx.address.updateMany({
        where: {
          profileId: address.profileId,
          addressType: addressType
        },
        data: { isDefault: false }
      });

      // Set this address as default
      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      });
    });

    return await this.prisma.address.findUnique({
      where: { id: addressId }
    });
  }

  // Update store details
  async updateStoreDetails(userId: string, input: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updateData: any = {};
    if (input.storeName) updateData.storeName = input.storeName.trim();
    if (input.storeType) updateData.storeType = input.storeType.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.addressId) updateData.addressId = input.addressId;

    return await this.prisma.storeDetail.update({
      where: { profileId: profile.id },
      data: updateData,
      include: { storeAddress: true }
    });
  }

  // Update documentation
  async updateDocumentation(userId: string, input: any) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updateData: any = {};
    if (input.panNumber) {
      updateData.panNumber = input.panNumber.toUpperCase().trim();
      updateData.isVerified = false; // Reset verification if PAN is changed
    }

    return await this.prisma.document.update({
      where: { profileId: profile.id },
      data: updateData
    });
  }

  // Soft delete profile
  async deleteProfile(userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Mark user as deleted
      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
      });

      // You could also soft delete the profile if you add a deletedAt field
      // For now, we'll just mark the user as deleted
      return true;
    });
  }

  // Helper method to sanitize address data
  private sanitizeAddressData(address: any) {
    return {
      province: address.province?.trim(),
      addressLabel: address.addressLabel?.trim() || null,
      pinCode: address.pinCode?.trim(),
      locality: address.locality?.trim(),
      city: address.city?.trim(),
      landMark: address.landMark?.trim() || null,
      addressType: address.addressType,
    };
  }

  // Get profile completion status
  async getProfileCompletionStatus(userId: string) {
    const profile = await this.getFullProfile(userId);
    
    if (!profile) {
      return {
        isComplete: false,
        completionPercentage: 0,
        missingSteps: [
          { step: 'PERSONAL_DETAILS', name: 'Personal Details', description: 'Basic information', isComplete: false, isRequired: true },
          { step: 'ADDRESSES', name: 'Addresses', description: 'Address information', isComplete: false, isRequired: true },
          { step: 'STORE_DETAILS', name: 'Store Details', description: 'Store information', isComplete: false, isRequired: true },
          { step: 'DOCUMENTATION', name: 'Documentation', description: 'Required documents', isComplete: false, isRequired: true },
        ],
        nextStep: { step: 'PERSONAL_DETAILS', name: 'Personal Details', description: 'Basic information', isComplete: false, isRequired: true }
      };
    }

    const steps = [
      {
        step: 'PERSONAL_DETAILS',
        name: 'Personal Details',
        description: 'Basic information',
        isComplete: !!(profile.firstName && profile.lastName),
        isRequired: true
      },
      {
        step: 'ADDRESSES',
        name: 'Addresses',
        description: 'Address information',
        isComplete: profile.addresses.length >= 3,
        isRequired: true
      },
      {
        step: 'STORE_DETAILS',
        name: 'Store Details',
        description: 'Store information',
        isComplete: !!profile.storeDetail,
        isRequired: true
      },
      {
        step: 'DOCUMENTATION',
        name: 'Documentation',
        description: 'Required documents',
        isComplete: !!profile.document,
        isRequired: true
      }
    ];

    const completedSteps = steps.filter(step => step.isComplete).length;
    const completionPercentage = Math.round((completedSteps / steps.length) * 100);
    const missingSteps = steps.filter(step => !step.isComplete);
    const nextStep = missingSteps.length > 0 ? missingSteps[0] : null;

    return {
      isComplete: missingSteps.length === 0,
      completionPercentage,
      missingSteps,
      nextStep
    };
  }
}
