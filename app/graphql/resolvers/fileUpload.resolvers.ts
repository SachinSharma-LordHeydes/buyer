import { GraphQLContext } from "../context";
import cloudinary from "../utils/cloudinary";
import { requireAuth, requireProductOwnership } from "./auth.helpers";

// Simple validation helpers
const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const fileUploadResolvers = {
  Mutation: {
    generateUploadUrl: async (
      _: any,
      { productId, isImage }: { productId: string; isImage: boolean },
      context: GraphQLContext
    ) => {
      // Validate inputs
      if (!productId || !isValidUUID(productId)) {
        throw new Error("Invalid product ID");
      }
      if (typeof isImage !== "boolean") {
        throw new Error("isImage must be a boolean");
      }

      // Check auth and ownership
      requireAuth(context);
      await requireProductOwnership(
        context.prisma,
        productId,
        context.user!.id
      );

      // Check Cloudinary config
      const {
        CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET,
      } = process.env;
      if (
        !CLOUDINARY_CLOUD_NAME ||
        !CLOUDINARY_API_KEY ||
        !CLOUDINARY_API_SECRET
      ) {
        throw new Error("Cloudinary configuration missing");
      }

      // Generate upload parameters
      const resourceType = isImage ? "image" : "video";
      const folder = `products/${resourceType}s`;
      const publicId = `${folder}/${productId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const timestamp = Math.round(Date.now() / 1000).toString();

      // Create signature parameters
      const paramsToSign = {
        folder,
        public_id: publicId,
        timestamp,
      };

      // Generate signature
      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        CLOUDINARY_API_SECRET
      );

      return {
        url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        signature,
        timestamp,
        apiKey: CLOUDINARY_API_KEY,
        publicId,
        folder,
        resourceType: !isImage ? "video" : undefined,
      };
    },

    saveProductMedia: async (
      _: any,
      {
        productId,
        url,
        isImage,
        publicId,
        altText,
        isPrimary,
      }: {
        productId: string;
        url: string;
        isImage: boolean;
        publicId?: string;
        altText?: string;
        isPrimary?: boolean;
      },
      context: GraphQLContext
    ) => {
      // Validate inputs
      if (!productId || !isValidUUID(productId)) {
        throw new Error("Invalid product ID");
      }
      if (!url || !isValidURL(url)) {
        throw new Error("Invalid URL");
      }
      if (typeof isImage !== "boolean") {
        throw new Error("isImage must be a boolean");
      }
      if (altText && altText.length > 255) {
        throw new Error("Alt text too long");
      }
      if (!isImage && !publicId) {
        throw new Error("publicId is required for video uploads");
      }

      // Check auth and ownership
      requireAuth(context);
      await requireProductOwnership(
        context.prisma,
        productId,
        context.user!.id
      );

      let mediaId: string;

      // Save media to database
      if (isImage) {
        // Handle image upload
        if (isPrimary) {
          // Remove primary flag from other images
          await context.prisma.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });
        }

        const image = await context.prisma.productImage.create({
          data: {
            url,
            altText: altText || null,
            isPrimary: isPrimary || false,
            productId,
          },
        });
        mediaId = image.id;
      } else {
        // Handle video upload (replace existing video)
        const existingVideo = await context.prisma.productVideo.findFirst({
          where: { productId },
        });

        if (existingVideo) {
          await context.prisma.productVideo.delete({
            where: { id: existingVideo.id },
          });
        }

        const video = await context.prisma.productVideo.create({
          data: {
            url,
            publicId: publicId!,
            productId,
          },
        });
        mediaId = video.id;
      }

      return mediaId;
    },
  },
};
