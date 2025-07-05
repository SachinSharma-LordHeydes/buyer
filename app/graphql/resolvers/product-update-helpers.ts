import { PrismaTransactionClient } from "@/types/prisma";

/**
 * Helper function to update product images
 * Handles adding, removing, and updating product images
 */
export const updateProductImages = async (
  tx: PrismaTransactionClient,
  productId: string,
  inputImages: any[]
) => {
  const startTime = Date.now();
  console.log(`🖼️  [IMAGE UPDATE START] Product: ${productId} | Time: ${new Date().toISOString()}`);
  
  try {
    // Get current images from database
    console.log(`📊 [IMAGE FETCH] Retrieving current images for product ${productId}...`);
    const currentImages = await tx.productImage.findMany({
      where: { productId },
      select: { id: true, url: true, isPrimary: true, altText: true },
    });
    console.log(`📊 [IMAGE FETCH SUCCESS] Found ${currentImages.length} existing images`);

    // Filter valid input images (must have URL)
    const validInputImages = (inputImages || []).filter(
      (img: any) => img.url && img.url.trim()
    );
    const invalidImages = (inputImages || []).filter(
      (img: any) => !img.url || !img.url.trim()
    );

    if (invalidImages.length > 0) {
      console.log(`⚠️  [IMAGE VALIDATION] Found ${invalidImages.length} invalid images (missing URL)`);
    }

    console.log(`📈 [IMAGE SUMMARY] Current: ${currentImages.length} | Valid Input: ${validInputImages.length} | Invalid: ${invalidImages.length}`);

    // Determine which images to remove (current images not in input)
    const inputUrls = new Set(validInputImages.map((img: any) => img.url.trim()));
    const imagesToRemove = currentImages.filter(
      (img) => !inputUrls.has(img.url)
    );

    console.log(`🔍 [IMAGE ANALYSIS] Images to remove: ${imagesToRemove.length}`);
    if (imagesToRemove.length > 0) {
      imagesToRemove.forEach((img, index) => {
        console.log(`   ${index + 1}. [REMOVE] ${img.url} (Primary: ${img.isPrimary})`);
      });
    }

    // Remove obsolete images
    if (imagesToRemove.length > 0) {
      console.log(`🗑️  [IMAGE DELETE] Removing ${imagesToRemove.length} obsolete images...`);
      try {
        await tx.productImage.deleteMany({
          where: { id: { in: imagesToRemove.map((i) => i.id) } },
        });
        console.log(`✅ [IMAGE DELETE SUCCESS] Removed ${imagesToRemove.length} images`);
      } catch (error) {
        console.error(`❌ [IMAGE DELETE ERROR] Failed to remove images:`, error);
        throw new Error(`Failed to remove obsolete images: ${error}`);
      }
    }

    // Determine which images are new
    const currentUrls = new Set(currentImages.map((i) => i.url));
    const newImages = validInputImages.filter(
      (img: any) => !currentUrls.has(img.url)
    );

    console.log(`🆕 [IMAGE ANALYSIS] New images to add: ${newImages.length}`);
    if (newImages.length > 0) {
      newImages.forEach((img, index) => {
        console.log(`   ${index + 1}. [ADD] ${img.url} (Primary: ${img.isPrimary || false})`);
      });
    }

    // Add new images
    if (newImages.length > 0) {
      console.log(`📤 [IMAGE UPLOAD] Adding ${newImages.length} new images...`);
      
      // Ensure only one primary image exists
      let hasPrimary = currentImages.some(
        img => !imagesToRemove.find(r => r.id === img.id) && img.isPrimary
      );
      
      const imageData = newImages.map((img: any, index: number) => {
        const isPrimary = img.isPrimary === true && !hasPrimary;
        if (isPrimary) {
          hasPrimary = true;
          console.log(`👑 [IMAGE PRIMARY] Setting image ${index + 1} as primary: ${img.url}`);
        }
        
        return {
          productId,
          url: img.url.trim(),
          altText: img.altText?.trim() || null,
          isPrimary: isPrimary || (index === 0 && !hasPrimary), // First image is primary if none specified
        };
      });

      try {
        await tx.productImage.createMany({ data: imageData });
        console.log(`✅ [IMAGE UPLOAD SUCCESS] Added ${newImages.length} new images`);
        imageData.forEach((img, index) => {
          console.log(`   ${index + 1}. ✅ ${img.url} (Primary: ${img.isPrimary}, Alt: ${img.altText || 'None'})`);
        });
      } catch (error) {
        console.error(`❌ [IMAGE UPLOAD ERROR] Failed to add new images:`, error);
        throw new Error(`Failed to add new images: ${error}`);
      }
    }

    // Update existing images (isPrimary, altText)
    const existingImages = validInputImages.filter(
      (img: any) => currentUrls.has(img.url)
    );
    
    console.log(`🔄 [IMAGE UPDATE] Checking ${existingImages.length} existing images for updates...`);
    
    let updatedCount = 0;
    for (const img of existingImages) {
      const currentImg = currentImages.find(ci => ci.url === img.url);
      if (currentImg) {
        const needsUpdate = 
          currentImg.isPrimary !== (img.isPrimary || false) ||
          currentImg.altText !== (img.altText?.trim() || null);
          
        if (needsUpdate) {
          console.log(`🔄 [IMAGE UPDATE] Updating metadata for: ${img.url}`);
          console.log(`   - Primary: ${currentImg.isPrimary} → ${img.isPrimary || false}`);
          console.log(`   - Alt Text: "${currentImg.altText}" → "${img.altText?.trim() || null}"`);
          
          try {
            await tx.productImage.updateMany({
              where: { productId, url: img.url },
              data: {
                isPrimary: img.isPrimary || false,
                altText: img.altText?.trim() || null,
              },
            });
            updatedCount++;
            console.log(`✅ [IMAGE UPDATE SUCCESS] Updated: ${img.url}`);
          } catch (error) {
            console.error(`❌ [IMAGE UPDATE ERROR] Failed to update ${img.url}:`, error);
            throw new Error(`Failed to update image metadata: ${error}`);
          }
        } else {
          console.log(`ℹ️  [IMAGE SKIP] No changes needed for: ${img.url}`);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [IMAGE UPDATE COMPLETE] Product: ${productId} | Duration: ${duration}ms`);
    console.log(`📊 [IMAGE SUMMARY] Removed: ${imagesToRemove.length} | Added: ${newImages.length} | Updated: ${updatedCount}`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [IMAGE UPDATE FAILED] Product: ${productId} | Duration: ${duration}ms | Error:`, error);
    throw error;
  }
};

/**
 * Helper function to update product videos
 * Handles adding, removing, and updating product videos
 */
export const updateProductVideos = async (
  tx: PrismaTransactionClient,
  productId: string,
  inputVideos: any[]
) => {
  const startTime = Date.now();
  console.log(`🎥 [VIDEO UPDATE START] Product: ${productId} | Time: ${new Date().toISOString()}`);
  
  try {
    // Get current videos from database
    console.log(`📊 [VIDEO FETCH] Retrieving current videos for product ${productId}...`);
    const currentVideos = await tx.productVideo.findMany({
      where: { productId },
      select: { id: true, url: true, publicId: true },
    });
    console.log(`📊 [VIDEO FETCH SUCCESS] Found ${currentVideos.length} existing videos`);

    // Filter valid input videos (must have URL and publicId)
    const validInputVideos = (inputVideos || []).filter(
      (vid: any) => vid.url && vid.url.trim() && vid.publicId && vid.publicId.trim()
    );
    const invalidVideos = (inputVideos || []).filter(
      (vid: any) => !vid.url || !vid.url.trim() || !vid.publicId || !vid.publicId.trim()
    );

    if (invalidVideos.length > 0) {
      console.log(`⚠️  [VIDEO VALIDATION] Found ${invalidVideos.length} invalid videos (missing URL or publicId)`);
      invalidVideos.forEach((vid, index) => {
        console.log(`   ${index + 1}. [INVALID] URL: ${vid.url || 'Missing'} | PublicId: ${vid.publicId || 'Missing'}`);
      });
    }

    console.log(`📈 [VIDEO SUMMARY] Current: ${currentVideos.length} | Valid Input: ${validInputVideos.length} | Invalid: ${invalidVideos.length}`);

    // Determine which videos to remove
    const inputUrls = new Set(validInputVideos.map((vid: any) => vid.url.trim()));
    const videosToRemove = currentVideos.filter(
      (vid) => !inputUrls.has(vid.url)
    );

    console.log(`🔍 [VIDEO ANALYSIS] Videos to remove: ${videosToRemove.length}`);
    if (videosToRemove.length > 0) {
      videosToRemove.forEach((vid, index) => {
        console.log(`   ${index + 1}. [REMOVE] ${vid.url} | PublicId: ${vid.publicId}`);
      });
    }

    // Remove obsolete videos
    if (videosToRemove.length > 0) {
      console.log(`🗑️  [VIDEO DELETE] Removing ${videosToRemove.length} obsolete videos...`);
      try {
        await tx.productVideo.deleteMany({
          where: { id: { in: videosToRemove.map((v) => v.id) } },
        });
        console.log(`✅ [VIDEO DELETE SUCCESS] Removed ${videosToRemove.length} videos`);
        videosToRemove.forEach((vid, index) => {
          console.log(`   ${index + 1}. ✅ Deleted: ${vid.url}`);
        });
      } catch (error) {
        console.error(`❌ [VIDEO DELETE ERROR] Failed to remove videos:`, error);
        throw new Error(`Failed to remove obsolete videos: ${error}`);
      }
    }

    // Determine which videos are new
    const currentUrls = new Set(currentVideos.map((v) => v.url));
    const newVideos = validInputVideos.filter(
      (vid: any) => !currentUrls.has(vid.url)
    );

    console.log(`🆕 [VIDEO ANALYSIS] New videos to add: ${newVideos.length}`);
    if (newVideos.length > 0) {
      newVideos.forEach((vid, index) => {
        console.log(`   ${index + 1}. [ADD] ${vid.url} | PublicId: ${vid.publicId}`);
      });
    }

    // Add new videos
    if (newVideos.length > 0) {
      console.log(`📤 [VIDEO UPLOAD] Adding ${newVideos.length} new videos...`);
      
      const videoData = newVideos.map((vid: any, index: number) => {
        console.log(`📹 [VIDEO PREPARE] ${index + 1}. URL: ${vid.url} | PublicId: ${vid.publicId}`);
        return {
          productId,
          url: vid.url.trim(),
          publicId: vid.publicId.trim(),
        };
      });

      try {
        await tx.productVideo.createMany({ data: videoData });
        console.log(`✅ [VIDEO UPLOAD SUCCESS] Added ${newVideos.length} new videos`);
        videoData.forEach((vid, index) => {
          console.log(`   ${index + 1}. ✅ ${vid.url} | PublicId: ${vid.publicId}`);
        });
      } catch (error) {
        console.error(`❌ [VIDEO UPLOAD ERROR] Failed to add new videos:`, error);
        throw new Error(`Failed to add new videos: ${error}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [VIDEO UPDATE COMPLETE] Product: ${productId} | Duration: ${duration}ms`);
    console.log(`📊 [VIDEO SUMMARY] Removed: ${videosToRemove.length} | Added: ${newVideos.length}`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [VIDEO UPDATE FAILED] Product: ${productId} | Duration: ${duration}ms | Error:`, error);
    throw error;
  }
};

/**
 * Helper function to update product features
 * Handles replacing all features with new ones
 */
export const updateProductFeatures = async (
  tx: PrismaTransactionClient,
  productId: string,
  inputFeatures: any[],
  inputSpecifications: any[] = []
) => {
  const startTime = Date.now();
  console.log(`⚙️  [FEATURE UPDATE START] Product: ${productId} | Time: ${new Date().toISOString()}`);
  
  try {
    // Get current features count for comparison
    console.log(`📊 [FEATURE FETCH] Retrieving current features for product ${productId}...`);
    const currentFeaturesCount = await tx.productFeature.count({
      where: { productId },
    });
    console.log(`📊 [FEATURE FETCH SUCCESS] Found ${currentFeaturesCount} existing features`);

    // Remove all existing features
    console.log(`🗑️  [FEATURE DELETE] Removing all existing features...`);
    try {
      const deletedFeatures = await tx.productFeature.deleteMany({
        where: { productId },
      });
      console.log(`✅ [FEATURE DELETE SUCCESS] Deleted ${deletedFeatures.count} existing features`);
    } catch (error) {
      console.error(`❌ [FEATURE DELETE ERROR] Failed to delete existing features:`, error);
      throw new Error(`Failed to delete existing features: ${error}`);
    }

    // Validate and process input features
    console.log(`🔍 [FEATURE VALIDATION] Processing input features...`);
    const validFeatures = (inputFeatures || []).filter(
      (f: any) => f.feature && f.feature.trim()
    );
    const invalidFeatures = (inputFeatures || []).filter(
      (f: any) => !f.feature || !f.feature.trim()
    );

    if (invalidFeatures.length > 0) {
      console.log(`⚠️  [FEATURE VALIDATION] Found ${invalidFeatures.length} invalid features (missing feature name)`);
    }

    // Validate and process input specifications
    console.log(`🔍 [SPEC VALIDATION] Processing input specifications...`);
    const validSpecifications = (inputSpecifications || []).filter(
      (s: any) => s.name && s.name.trim()
    ).map((s: any) => ({
      feature: `spec_${s.name.trim()}`,
      value: s.value?.trim() || null,
    }));
    const invalidSpecifications = (inputSpecifications || []).filter(
      (s: any) => !s.name || !s.name.trim()
    );

    if (invalidSpecifications.length > 0) {
      console.log(`⚠️  [SPEC VALIDATION] Found ${invalidSpecifications.length} invalid specifications (missing name)`);
    }

    // Combine all features
    const processedFeatures = validFeatures.map((f: any) => ({
      feature: f.feature.trim(),
      value: f.value?.trim() || null,
    }));

    const allFeatures = [...processedFeatures, ...validSpecifications];

    console.log(`📈 [FEATURE SUMMARY] Valid Features: ${validFeatures.length} | Valid Specs: ${validSpecifications.length} | Total: ${allFeatures.length}`);
    console.log(`📈 [FEATURE SUMMARY] Invalid Features: ${invalidFeatures.length} | Invalid Specs: ${invalidSpecifications.length}`);

    // Log each feature being added
    if (allFeatures.length > 0) {
      console.log(`📝 [FEATURE LIST] Features to be added:`);
      allFeatures.forEach((feature, index) => {
        const isSpec = feature.feature.startsWith('spec_');
        const type = isSpec ? '[SPEC]' : '[FEATURE]';
        console.log(`   ${index + 1}. ${type} ${feature.feature}: ${feature.value || 'No value'}`);
      });
    }

    // Add new features
    if (allFeatures.length > 0) {
      console.log(`📤 [FEATURE CREATE] Adding ${allFeatures.length} new features...`);
      
      const featureData = allFeatures.map((f: any) => ({
        productId,
        feature: f.feature,
        value: f.value,
      }));

      try {
        await tx.productFeature.createMany({ data: featureData });
        console.log(`✅ [FEATURE CREATE SUCCESS] Created ${allFeatures.length} new features`);
        
        // Log success for each feature
        featureData.forEach((feature, index) => {
          const isSpec = feature.feature.startsWith('spec_');
          const type = isSpec ? '[SPEC]' : '[FEATURE]';
          console.log(`   ${index + 1}. ✅ ${type} ${feature.feature}: ${feature.value || 'No value'}`);
        });
      } catch (error) {
        console.error(`❌ [FEATURE CREATE ERROR] Failed to create new features:`, error);
        throw new Error(`Failed to create new features: ${error}`);
      }
    } else {
      console.log(`ℹ️  [FEATURE CREATE] No valid features to add`);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [FEATURE UPDATE COMPLETE] Product: ${productId} | Duration: ${duration}ms`);
    console.log(`📊 [FEATURE SUMMARY] Removed: ${currentFeaturesCount} | Added: ${allFeatures.length}`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [FEATURE UPDATE FAILED] Product: ${productId} | Duration: ${duration}ms | Error:`, error);
    throw error;
  }
};

/**
 * Helper function to validate product update input
 * Enhanced validation for product updates
 */
export const validateProductUpdateInput = (input: any) => {
  const errors: string[] = [];

  // Basic validations
  if (input.name !== undefined) {
    if (!input.name || !input.name.trim()) {
      errors.push("Product name is required");
    } else if (input.name.length > 100) {
      errors.push("Product name must be less than 100 characters");
    }
  }

  if (input.description !== undefined) {
    if (input.description && input.description.length < 10) {
      errors.push("Description must be at least 10 characters");
    }
  }

  if (input.price !== undefined) {
    if (typeof input.price !== "number" || input.price <= 0) {
      errors.push("Price must be a positive number");
    }
    if (input.price >= 100000000) {
      errors.push("Price cannot exceed 99,999,999.99");
    }
  }

  if (input.sku !== undefined) {
    if (!input.sku || !input.sku.trim()) {
      errors.push("SKU is required");
    }
  }

  if (input.stock !== undefined) {
    if (typeof input.stock !== "number" || input.stock < 0) {
      errors.push("Stock must be a non-negative number");
    }
  }

  // Image validations
  if (input.images !== undefined) {
    if (!Array.isArray(input.images)) {
      errors.push("Images must be an array");
    } else if (input.images.length === 0) {
      errors.push("At least one image is required");
    } else {
      input.images.forEach((img: any, index: number) => {
        if (!img.url || !img.url.trim()) {
          errors.push(`Image ${index + 1} must have a valid URL`);
        }
      });
    }
  }

  // Video validations
  if (input.video !== undefined && Array.isArray(input.video)) {
    input.video.forEach((vid: any, index: number) => {
      if (vid.url && !vid.publicId) {
        errors.push(`Video ${index + 1} must have a publicId`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
};

/**
 * Main function to handle comprehensive product update
 * Orchestrates all update operations within a transaction
 */
export const executeProductUpdate = async (
  tx: PrismaTransactionClient,
  productId: string,
  input: any,
  userId: string
) => {
  const startTime = Date.now();
  console.log(`🚀 [PRODUCT UPDATE START] =====================================`);
  console.log(`📋 [UPDATE INFO] Product ID: ${productId}`);
  console.log(`👤 [UPDATE INFO] User ID: ${userId}`);
  console.log(`⏰ [UPDATE INFO] Started at: ${new Date().toISOString()}`);
  console.log(`📝 [UPDATE INFO] Input data:`, JSON.stringify(input, null, 2));
  
  try {
    // Verify product exists and user has permission
    console.log(`🔍 [AUTH CHECK] Verifying product exists and user has permission...`);
    const existingProduct = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, name: true, price: true, stock: true },
    });

    if (!existingProduct) {
      console.error(`❌ [AUTH ERROR] Product not found: ${productId}`);
      throw new Error("Product not found");
    }

    if (existingProduct.sellerId !== userId) {
      console.error(`❌ [AUTH ERROR] User ${userId} doesn't own product ${productId} (owner: ${existingProduct.sellerId})`);
      throw new Error("You don't have permission to update this product");
    }

    console.log(`✅ [AUTH SUCCESS] Product found: "${existingProduct.name}"`);
    console.log(`📊 [CURRENT DATA] Price: ${existingProduct.price} | Stock: ${existingProduct.stock}`);

    // Validate input
    console.log(`🔍 [VALIDATION] Validating input data...`);
    try {
      validateProductUpdateInput(input);
      console.log(`✅ [VALIDATION SUCCESS] Input validation passed`);
    } catch (error) {
      console.error(`❌ [VALIDATION ERROR] Input validation failed:`, error);
      throw error;
    }

    // Prepare update data
    const updateData: any = {};
    const fieldsToUpdate: string[] = [];

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
      fieldsToUpdate.push(`name: "${existingProduct.name}" → "${updateData.name}"`);
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
      fieldsToUpdate.push(`description: Updated`);
    }
    if (input.price !== undefined) {
      updateData.price = input.price;
      fieldsToUpdate.push(`price: ${existingProduct.price} → ${updateData.price}`);
    }
    if (input.sku !== undefined) {
      updateData.sku = input.sku.trim();
      fieldsToUpdate.push(`sku: Updated to "${updateData.sku}"`);
    }
    if (input.stock !== undefined) {
      updateData.stock = input.stock;
      fieldsToUpdate.push(`stock: ${existingProduct.stock} → ${updateData.stock}`);
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
      fieldsToUpdate.push(`status: Updated to "${updateData.status}"`);
    }
    updateData.updatedAt = new Date();

    console.log(`📝 [UPDATE PLAN] Fields to update: ${fieldsToUpdate.length}`);
    fieldsToUpdate.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });

    // Update main product data
    if (Object.keys(updateData).length > 1) { // More than just updatedAt
      console.log(`💾 [PRODUCT UPDATE] Updating main product data...`);
      try {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: updateData,
        });
        console.log(`✅ [PRODUCT UPDATE SUCCESS] Main product data updated`);
      } catch (error) {
        console.error(`❌ [PRODUCT UPDATE ERROR] Failed to update main product data:`, error);
        throw new Error(`Failed to update product data: ${error}`);
      }
    } else {
      console.log(`ℹ️  [PRODUCT UPDATE] No main product fields to update`);
    }

    // Update features if provided
    if (input.features !== undefined || input.specifications !== undefined) {
      console.log(`🔧 [FEATURES] Starting features update...`);
      console.log(`📊 [FEATURES] Features: ${(input.features || []).length} | Specifications: ${(input.specifications || []).length}`);
      try {
        await updateProductFeatures(
          tx,
          productId,
          input.features,
          input.specifications
        );
      } catch (error) {
        console.error(`❌ [FEATURES ERROR] Features update failed:`, error);
        throw error;
      }
    } else {
      console.log(`ℹ️  [FEATURES] No features to update`);
    }

    // Update images if provided
    if (input.images !== undefined) {
      console.log(`🖼️  [IMAGES] Starting images update...`);
      console.log(`📊 [IMAGES] Input images count: ${(input.images || []).length}`);
      try {
        const validImages = input.images.filter(
          img => img.url && !img.url.startsWith("blob:")
        );
        const currentImages = await tx.productImage.findMany({ where: { productId } });
        const inputImageUrls = new Set(validImages.map(img => img.url));
        const imagesToRemove = currentImages.filter(ci => !inputImageUrls.has(ci.url));
        if (imagesToRemove.length > 0) {
          await tx.productImage.deleteMany({ where: { id: { in: imagesToRemove.map(i => i.id) } } });
        }
        const currentImageUrls = new Set(currentImages.map(i => i.url));
        const newImages = validImages.filter(img => !currentImageUrls.has(img.url));
        if (newImages.length > 0) {
          await tx.productImage.createMany({
            data: newImages.map(img => ({
              productId,
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary || false,
            })),
          });
        }
      } catch (error) {
        console.error(`❌ [IMAGES ERROR] Images update failed:`, error);
        throw error;
      }
    } else {
      console.log(`ℹ️  [IMAGES] No images to update`);
    }

    // Update videos if provided
    if (input.video !== undefined) {
      console.log(`🎥 [VIDEOS] Starting videos update...`);
      console.log(`📊 [VIDEOS] Input videos count: ${(input.video || []).length}`);
      try {
        const validVideos = input.video.filter(
          vid => vid.url && !vid.url.startsWith("blob:") && vid.publicId
        );
        const currentVideos = await tx.productVideo.findMany({ where: { productId } });
        const inputVideoUrls = new Set(validVideos.map(vid => vid.url));
        const videosToRemove = currentVideos.filter(cv => !inputVideoUrls.has(cv.url));
        if (videosToRemove.length > 0) {
          await tx.productVideo.deleteMany({ where: { id: { in: videosToRemove.map(v => v.id) } } });
        }
        const currentVideoUrls = new Set(currentVideos.map(v => v.url));
        const newVideos = validVideos.filter(vid => !currentVideoUrls.has(vid.url));
        if (newVideos.length > 0) {
          await tx.productVideo.createMany({
            data: newVideos.map(vid => ({
              productId,
              url: vid.url,
              publicId: vid.publicId,
            })),
          });
        }
      } catch (error) {
        console.error(`❌ [VIDEOS ERROR] Videos update failed:`, error);
        throw error;
      }
    } else {
      console.log(`ℹ️  [VIDEOS] No videos to update`);
    }

    const duration = Date.now() - startTime;
    console.log(`🎉 [PRODUCT UPDATE COMPLETE] ============================`);
    console.log(`✅ [SUCCESS] Product ${productId} updated successfully`);
    console.log(`⏱️  [PERFORMANCE] Total duration: ${duration}ms`);
    console.log(`📊 [SUMMARY] Updated at: ${new Date().toISOString()}`);
    console.log(`======================================================`);
    return existingProduct;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [PRODUCT UPDATE FAILED] ==============================`);
    console.error(`💥 [ERROR] Product update failed for ${productId}`);
    console.error(`⏱️  [PERFORMANCE] Failed after: ${duration}ms`);
    console.error(`🔍 [ERROR DETAILS]`, error);
    console.error(`====================================================`);
    throw error;
  }
};
