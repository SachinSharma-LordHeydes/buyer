# Add Product Examples

## Basic Product with Images Only

```graphql
mutation AddProductWithImages {
  addProduct(
    input: {
      name: "Wireless Bluetooth Headphones"
      description: "High-quality wireless headphones with noise cancellation"
      price: 199.99
      sku: "WBH-001"
      stock: 50
      status: PENDING
      features: [
        { feature: "Battery Life", value: "30 hours" }
        { feature: "Noise Cancellation", value: "Active" }
        { feature: "Connectivity", value: "Bluetooth 5.0" }
      ]
      images: [
        {
          url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/headphones_main.jpg"
          altText: "Wireless Bluetooth Headphones - Main View"
          isPrimary: true
        }
        {
          url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/headphones_side.jpg"
          altText: "Wireless Bluetooth Headphones - Side View"
          isPrimary: false
        }
      ]
      specifications: [
        { key: "Weight", value: "250g" }
        { key: "Dimensions", value: "18cm x 15cm x 8cm" }
        { key: "Warranty", value: "2 years" }
      ]
    }
  ) {
    id
    name
    description
    price
    sku
    stock
    status
    images {
      id
      url
      altText
      isPrimary
    }
    video {
      id
      url
      publicId
    }
    features {
      id
      feature
      value
    }
    createdAt
    updatedAt
  }
}
```

## Product with Both Images and Videos

```graphql
mutation AddProductWithImagesAndVideos {
  addProduct(
    input: {
      name: "Smart Fitness Watch"
      description: "Advanced fitness tracking with heart rate monitor and GPS"
      price: 299.99
      sku: "SFW-001"
      stock: 25
      status: PENDING
      features: [
        { feature: "Heart Rate Monitor", value: "24/7 tracking" }
        { feature: "GPS", value: "Built-in" }
        { feature: "Water Resistance", value: "5ATM" }
      ]
      images: [
        {
          url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/watch_main.jpg"
          altText: "Smart Fitness Watch - Main View"
          isPrimary: true
        }
        {
          url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/watch_screen.jpg"
          altText: "Smart Fitness Watch - Screen Display"
          isPrimary: false
        }
      ]
      videos: [
        {
          url: "https://res.cloudinary.com/your-cloud/video/upload/v1234567890/products/videos/watch_demo.mp4"
          publicId: "products/videos/watch_demo_1234567890"
        }
      ]
      specifications: [
        { key: "Display", value: "1.4 inch AMOLED" }
        { key: "Battery", value: "7 days" }
        { key: "Compatibility", value: "iOS & Android" }
      ]
    }
  ) {
    id
    name
    description
    price
    sku
    stock
    status
    images {
      id
      url
      altText
      isPrimary
    }
    video {
      id
      url
      publicId
    }
    features {
      id
      feature
      value
    }
    createdAt
    updatedAt
  }
}
```

## Upload Flow Example

### Step 1: Generate Upload URL for Images
```graphql
mutation GenerateImageUploadUrl {
  generateUploadUrl(productId: "product-id-here", isImage: true) {
    url
    signature
    timestamp
    apiKey
    publicId
    folder
    resourceType
  }
}
```

### Step 2: Generate Upload URL for Videos
```graphql
mutation GenerateVideoUploadUrl {
  generateUploadUrl(productId: "product-id-here", isImage: false) {
    url
    signature
    timestamp
    apiKey
    publicId
    folder
    resourceType
  }
}
```

### Step 3: After uploading to Cloudinary, save the media references
```graphql
mutation SaveImageMedia {
  saveProductMedia(
    productId: "product-id-here"
    url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/uploaded_image.jpg"
    isImage: true
    altText: "Product image"
    isPrimary: true
  )
}

mutation SaveVideoMedia {
  saveProductMedia(
    productId: "product-id-here"
    url: "https://res.cloudinary.com/your-cloud/video/upload/v1234567890/products/videos/uploaded_video.mp4"
    isImage: false
    publicId: "products/videos/uploaded_video_1234567890"
  )
}
```

## Product Status Options

The `status` field accepts these values:
- `PENDING` - Awaiting approval (default)
- `APPROVED` - Ready for sale
- `REJECTED` - Rejected by admin
- `INACTIVE` - Temporarily disabled
- `SUSPENDED` - Suspended by admin

## Important Notes

1. **Images**: 
   - Only one image can be marked as `isPrimary: true`
   - If no image is marked as primary, the first image will be set as primary
   - `altText` is optional but recommended for accessibility

2. **Videos**:
   - `publicId` is required for videos (used for Cloudinary management)
   - Currently supports one video per product
   - Videos are stored in the `products/videos` folder

3. **Features vs Specifications**:
   - Features are product highlights (e.g., "Battery Life: 30 hours")
   - Specifications are technical details (e.g., "Weight: 250g")
   - Both are stored in the same `ProductFeature` table but specifications are prefixed with `spec_`

4. **Authentication**:
   - User must be authenticated
   - User must have `SELLER` role
   - Products are automatically assigned to the authenticated user as seller
