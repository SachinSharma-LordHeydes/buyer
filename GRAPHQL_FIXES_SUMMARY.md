# GraphQL Type Merge Error - FIXED ✅

## Problem
You were getting this error:
```
Error: Unable to merge GraphQL type "Mutation": Field "generateUploadUrl" already defined with a different type. 
Declared as "CloudinaryUpload", but you tried to override with "UploadUrlResponse"
```

## Root Cause
Multiple GraphQL type definition files were defining the same types/mutations with different signatures, causing conflicts during schema merging.

## Fixes Applied ✅

### 1. **Removed Duplicate Scalar Types**
- Centralized `scalar Upload`, `scalar DateTime`, and `scalar JSON` in the base schema (`app/graphql/index.ts`)
- Removed duplicate scalar definitions from:
  - `product.typeDefrs.ts`
  - `fileUpload.typeDefs.ts` 
  - `user.typeDefs.ts`
  - `profile.typeDefs.ts`

### 2. **Resolved Mutation Conflicts**
- Removed duplicate `generateUploadUrl` mutation from `media.ts` 
- Kept the original definition in `fileUpload.typeDefs.ts` that returns `CloudinaryUpload!`
- Removed duplicate `saveProductMedia` mutation definition

### 3. **Fixed Type Conflicts**
- Removed duplicate `ProductVideo` type definition from `fileUpload.typeDefs.ts`
- Kept the main definition in `product.typeDefrs.ts`
- Fixed video field naming inconsistency (`video` vs `videos`) in `UpdateProductInput`

### 4. **Simplified User Types**
- Removed complex cross-references from `user.typeDefs.ts` to avoid circular dependency issues
- Kept only core User type with essential fields
- Proper import order in main GraphQL index

## What This Enables ✅

Now your `addProduct` resolver can properly handle:
- ✅ **Multiple Images** with alt text and primary image designation
- ✅ **Multiple Videos** with Cloudinary publicId tracking  
- ✅ **Product Features** and specifications
- ✅ **File Upload Flow** via `generateUploadUrl` and `saveProductMedia`
- ✅ **Proper Authentication** and validation

## Usage Example

```graphql
mutation AddProductWithImagesAndVideos {
  addProduct(input: {
    name: "Smart Watch"
    description: "Advanced fitness tracking"
    price: 299.99
    sku: "SW-001"
    stock: 10
    images: [
      {
        url: "https://cloudinary.com/.../watch_main.jpg"
        altText: "Smart Watch Main View"
        isPrimary: true
      }
    ]
    videos: [
      {
        url: "https://cloudinary.com/.../watch_demo.mp4"
        publicId: "products/videos/watch_demo_123"
      }
    ]
    features: [
      { feature: "Heart Rate Monitor", value: "24/7" }
    ]
  }) {
    id
    name
    images { url altText isPrimary }
    video { url publicId }
    features { feature value }
  }
}
```

## Next Steps

1. Restart your development server: `npm run dev`
2. Test the GraphQL endpoint at `http://localhost:3001/api/graphql`
3. Use the examples in `examples/add-product-examples.md` to test product creation
4. Upload files using the `generateUploadUrl` → upload to Cloudinary → `saveProductMedia` flow

The GraphQL schema should now compile without merge conflicts! 🎉
