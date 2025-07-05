import { GraphQLContext } from '../context';
import { requireSeller, handleAsyncErrors } from './auth.helpers';

export const uploadResolvers = {
  Mutation: {
    generateUploadUrl: async (
      _: any,
      { folder, resourceType }: { folder: string; resourceType: string },
      context: GraphQLContext
    ) => {
      return handleAsyncErrors(async () => {
        requireSeller(context);
        
        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
        
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
          throw new Error('Cloudinary configuration missing');
        }

        // Validate inputs
        if (!folder || !resourceType) {
          throw new Error('Folder and resource type are required');
        }

        const allowedResourceTypes = ['image', 'video', 'auto'];
        if (!allowedResourceTypes.includes(resourceType)) {
          throw new Error('Invalid resource type. Must be image, video, or auto');
        }

        // Generate unique public ID
        const timestamp = Math.round(Date.now() / 1000);
        const randomString = Math.random().toString(36).substring(2, 15);
        const publicId = `${folder}/${timestamp}_${randomString}`;

        // Parameters for signature generation
        const paramsToSign: any = {
          timestamp: timestamp.toString(),
          folder,
          public_id: publicId,
        };

        // Note: resource_type is NOT included in signature for Cloudinary uploads
        // It's sent as a form parameter but not signed

        // Generate signature using Cloudinary's method
        const cloudinary = (await import('../utils/cloudinary')).default;
        const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);

        // Construct upload URL
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

        return {
          url: uploadUrl,
          signature,
          timestamp: timestamp.toString(),
          apiKey: CLOUDINARY_API_KEY,
          publicId,
          folder,
          resourceType: resourceType === 'video' ? 'video' : undefined
        };
      }, 'Failed to generate upload URL');
    },
  },
};
