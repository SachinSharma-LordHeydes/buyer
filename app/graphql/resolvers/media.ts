// graphql/resolvers/media.ts
import { ReadStream } from "fs-capacitor";
import cloudinary from "../utils/cloudinary";
import { requireAuth, requireProductOwnership } from "./auth.helpers";
import { GraphQLContext } from "../context";

interface UploadFile {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

export const mediaResolvers = {

 Mutation: {
    generateUploadUrl: async (
      _: any,
      { productId, isImage }: { productId: string; isImage: boolean },
      context: GraphQLContext
    ) => {
      const startTime = performance.now();

      try {
        requireAuth(context);
        await requireProductOwnership(
          context.prisma,
          productId,
          context.user!.id
        );

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

        const resourceType = isImage ? "image" : "video";
        const folder = `products/${resourceType}s`;
        const publicId = `${folder}/${productId}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const timestamp = Math.round(Date.now() / 1000).toString();

        // Parameters to sign, sorted alphabetically
        const paramsToSign = {
          folder,
          public_id: publicId,
          timestamp,
        };

        console.log("Params to sign:", paramsToSign);
        console.log(
          "API Secret (first 10 chars):",
          CLOUDINARY_API_SECRET.substring(0, 10)
        );

        // Generate signature using Cloudinary's utility
        const signature = cloudinary.utils.api_sign_request(
          paramsToSign,
          CLOUDINARY_API_SECRET
        );

        console.log("Generated signature:", signature);

        // Debug: Show what string is being signed
        const sortedParams = Object.entries(paramsToSign)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        console.log("String to sign:", sortedParams);

        return {
          url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          signature,
          timestamp,
          apiKey: CLOUDINARY_API_KEY,
          publicId,
          folder,
          resourceType: !isImage ? "video" : undefined, // Include resource_type for videos
        };
      } catch (error) {
        console.error("generateUploadUrl error:", error);
        throw error;
      } finally {
        console.log("generateUploadUrl", startTime);
      }
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
      const startTime = performance.now();

      try {
        // Validate input
        const validatedData = {
          productId,
          url,
          publicId,
          altText,
          isPrimary,
          isImage,
        };

        // Require authentication
        requireAuth(context);

        // Verify product ownership
        await requireProductOwnership(
          context.prisma,
          productId,
          context.user!.id
        );

        let mediaId: string;

        await context.prisma.$transaction(
          async (tx) => {
            if (isImage) {
              // Handle primary image logic
              if (isPrimary) {
                await tx.productImage.updateMany({
                  where: { productId },
                  data: { isPrimary: false },
                });
              }

              const image = await tx.productImage.create({
                data: {
                  url: validatedData.url,
                  altText: validatedData.altText || null,
                  isPrimary: validatedData.isPrimary || false,
                  productId: validatedData.productId,
                },
              });
              mediaId = image.id;
            } else {
              if (!validatedData.publicId) {
                throw new Error(
                  "publicId is required for video uploads"
                );
              }

              // For videos, replace existing video (one video per product)
              const existingVideo = await tx.productVideo.findFirst({
                where: { productId: validatedData.productId },
              });

              if (existingVideo) {
                await tx.productVideo.delete({
                  where: { id: existingVideo.id },
                });
              }

              const video = await tx.productVideo.create({
                data: {
                  url: validatedData.url,
                  publicId: validatedData.publicId,
                  productId: validatedData.productId,
                },
              });
              mediaId = video.id;
            }
          },
          {
            timeout: 30000, // 30 second timeout
            maxWait: 35000,
          }
        );

        console.log("saveProductMedia", startTime);
        return mediaId!;
      } catch (error) {
        console.error("saveProductMedia error:", error);
        throw new Error(
          `Failed to save media: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
};
