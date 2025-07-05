"use client";

import {
  FormField,
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// GraphQL Queries and Mutations
const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
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
      videos {
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
`;

// const UPDATE_PRODUCT = gql`
//   mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
//     updateProduct(id: $id, input: $input) {
//       success
//       message
//       product {
//         id
//         name
//         description
//         price
//         sku
//         stock
//         status
//       }
//     }
//   }
// `;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      success
      message
      product {
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
        videos {
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
  }
`;

const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($folder: String!, $resourceType: String!) {
    generateUploadUrl(folder: $folder, resourceType: $resourceType) {
      url
      signature
      timestamp
      apiKey
      publicId
      folder
      resourceType
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`;

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  // Fetch product data
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId },
    skip: !productId,
  });

  // Mutations
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    stock: "",
    features: [] as { feature: string; value: string }[],
    images: [] as {
      id?: string;
      url: string;
      altText?: string;
      isPrimary?: boolean;
      file?: File;
    }[],
    videos: [] as {
      id?: string;
      url: string;
      publicId?: string;
      file?: File;
    }[],
  });

  // Initialize form data when product loads
  useEffect(() => {
    if (data?.product) {
      const product = data.product;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        sku: product.sku || "",
        stock: product.stock?.toString() || "",
        features: product.features || [],
        images:
          product.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })) || [],
        videos:
          product.videos?.map((video: any) => ({
            id: video.id,
            url: video.url,
            publicId: video.publicId,
          })) || [],
      });
    }
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading product...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Product
              </h3>
              <p>{error.message}</p>
              <Button onClick={() => router.push("/products")} className="mt-4">
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Product not found
  if (!data?.product) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
              <Button onClick={() => router.push("/products")} className="mt-4">
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (formData.name.length > 100)
          newErrors.name = "Name must be less than 100 characters";
        if (formData.description.length < 10)
          newErrors.description = "Description must be at least 10 characters";
        break;
      case 3:
        if (!formData.price) {
          newErrors.price = "Price is required";
        } else {
          const price = Number.parseFloat(formData.price);
          if (isNaN(price) || price <= 0)
            newErrors.price = "Price must be a valid positive number";
        }
        if (!formData.sku.trim()) newErrors.sku = "SKU is required";
        if (!formData.stock) {
          newErrors.stock = "Stock is required";
        } else {
          const stock = Number.parseInt(formData.stock);
          if (isNaN(stock) || stock < 0)
            newErrors.stock = "Stock must be a valid non-negative number";
        }
        break;
      case 4:
        if (formData.images.length < 1)
          newErrors.images = "At least 1 image is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File, resourceType: string) => {
    try {
      const { data: uploadData } = await generateUploadUrl({
        variables: {
          folder:
            resourceType === "image" ? "products/images" : "products/videos",
          resourceType: resourceType,
        },
      });

      if (!uploadData?.generateUploadUrl) {
        throw new Error("Failed to generate upload URL");
      }

      const uploadInfo = uploadData.generateUploadUrl;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", uploadInfo.apiKey);
      formData.append("timestamp", uploadInfo.timestamp);
      formData.append("signature", uploadInfo.signature);
      formData.append("folder", uploadInfo.folder);
      formData.append("public_id", uploadInfo.publicId);

      if (resourceType === "video") {
        formData.append("resource_type", "video");
      }

      const response = await fetch(uploadInfo.url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const result = await response.json();
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // const handleSave = async () => {
  //   if (!validateStep(currentStep)) return;

  //   setIsLoading(true);
  //   try {
  //     // Upload new images
  //     console.log("uploading images", formData.images);
  //     const uploadedImages = [];
  //     for (const image of formData.images) {
  //       if (image.file) {
  //         // New image to upload
  //         const result = await uploadToCloudinary(image.file, "image");
  //         uploadedImages.push({
  //           url: result.url,
  //           altText: image.altText || "",
  //           isPrimary: image.isPrimary || false,
  //         });
  //       } else {
  //         // Existing image
  //         uploadedImages.push({
  //           url: image.url,
  //           altText: image.altText || "",
  //           isPrimary: image.isPrimary || false,
  //         });
  //       }
  //     }
  //     console.log("uploaded images", uploadedImages);

  //     console.log("uploading videos", formData.videos);
  //     // Upload new videos
  //     const uploadedVideos = [];
  //     for (const video of formData.videos) {
  //       if (video.file) {
  //         // New video to upload
  //         const result = await uploadToCloudinary(video.file, "video");
  //         uploadedVideos.push({
  //           url: result.url,
  //           publicId: result.publicId,
  //         });
  //       } else {
  //         // Existing video
  //         uploadedVideos.push({
  //           url: video.url,
  //           publicId: video.publicId,
  //         });
  //       }
  //     }
  //     console.log("uploaded videos", uploadedVideos);

  //     console.log("updating product");
  //     // Update product
  //     const result = await updateProduct({
  //       variables: {
  //         id: productId,
  //         input: {
  //           name: formData.name,
  //           description: formData.description,
  //           price: parseFloat(formData.price),
  //           sku: formData.sku,
  //           stock: parseInt(formData.stock),
  //           images: uploadedImages,
  //           videos: uploadedVideos,
  //           features: formData.features,
  //         },
  //       },
  //     });

  //     console.log("update result", result);

  //     if (result.data?.updateProduct?.success) {
  //       router.push("/products");
  //     } else {
  //       alert(
  //         "Failed to update product: " + result.data?.updateProduct?.message
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Update error:", error);
  //     alert("Failed to update product");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fix the features handling in the frontend
  const addFeature = () => {
    if (newFeature.trim()) {
      const newFeatures = [
        ...formData.features,
        { feature: newFeature.trim(), value: "" }, // Ensure value is a string
      ];
      updateFormData("features", newFeatures);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    updateFormData("features", newFeatures);
  };

  // Fix the handleSave function to properly format features
  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Upload new images
      console.log("uploading images", formData.images);
      const uploadedImages = [];
      for (const image of formData.images) {
        if (image.file) {
          // New image to upload
          const result = await uploadToCloudinary(image.file, "image");
          uploadedImages.push({
            url: result.url,
            altText: image.altText || "",
            isPrimary: image.isPrimary || false,
          });
        } else {
          // Existing image
          uploadedImages.push({
            url: image.url,
            altText: image.altText || "",
            isPrimary: image.isPrimary || false,
          });
        }
      }
      console.log("uploaded images", uploadedImages);

      console.log("uploading videos", formData.videos);
      // Upload new videos
      const uploadedVideos = [];
      for (const video of formData.videos) {
        if (video.file) {
          // New video to upload
          const result = await uploadToCloudinary(video.file, "video");
          uploadedVideos.push({
            url: result.url,
            publicId: result.publicId,
          });
        } else {
          // Existing video
          uploadedVideos.push({
            url: video.url,
            publicId: video.publicId,
          });
        }
      }
      console.log("uploaded videos", uploadedVideos);

      // Format features properly
      const formattedFeatures = formData.features.map((feature) => ({
        feature: feature.feature,
        value: feature.value || "", // Ensure value is always a string
      }));

      console.log("updating product");
      // Update product
      const result = await updateProduct({
        variables: {
          id: productId,
          input: {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            sku: formData.sku,
            stock: parseInt(formData.stock),
            images: uploadedImages,
            videos: uploadedVideos,
            features: formattedFeatures, // Use formatted features
          },
        },
      });

      console.log("update result", result);

      if (result.data?.updateProduct?.success) {
        router.push("/products");
      } else {
        alert(
          "Failed to update product: " +
            (result.data?.updateProduct?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        const result = await deleteProduct({ variables: { id: productId } });
        if (result.data?.deleteProduct?.success) {
          router.push("/products");
        } else {
          alert("Failed to delete product");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete product");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // const addFeature = () => {
  //   if (newFeature.trim()) {
  //     const newFeatures = [
  //       ...formData.features,
  //       { feature: newFeature.trim(), value: "" },
  //     ];
  //     updateFormData("features", newFeatures);
  //     setNewFeature("");
  //   }
  // };

  // const removeFeature = (index: number) => {
  //   const newFeatures = formData.features.filter((_, i) => i !== index);
  //   updateFormData("features", newFeatures);
  // };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData("images", newImages);
  };

  const removeVideo = (index: number) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    updateFormData("videos", newVideos);
  };

  const addImages = (files: FileList) => {
    const newImages = Array.from(files).map((file, index) => ({
      url: URL.createObjectURL(file),
      altText: `${formData.name} image`,
      isPrimary: formData.images.length === 0 && index === 0,
      file,
    }));
    updateFormData("images", [...formData.images, ...newImages]);
  };

  const addVideos = (files: FileList) => {
    const newVideos = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      publicId: `temp_${Date.now()}`,
      file,
    }));
    updateFormData("videos", [...formData.videos, ...newVideos]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product Name" error={errors.name} required>
                <ValidatedInput
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  error={errors.name}
                />
              </FormField>
              <FormField label="SKU" error={errors.sku} required>
                <ValidatedInput
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={(e) => updateFormData("sku", e.target.value)}
                  error={errors.sku}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Price" error={errors.price} required>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  error={errors.price}
                />
              </FormField>
              <FormField label="Stock" error={errors.stock} required>
                <ValidatedInput
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                  error={errors.stock}
                />
              </FormField>
            </div>
            <FormField
              label="Product Description"
              error={errors.description}
              required
            >
              <ValidatedTextarea
                placeholder="Describe your product..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                error={errors.description}
              />
            </FormField>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField label="Key Features">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <ValidatedInput
                      placeholder="Add a feature and press Enter"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addFeature()}
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature.feature}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeFeature(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Price" error={errors.price} required>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  error={errors.price}
                />
              </FormField>
              <FormField label="Stock" error={errors.stock} required>
                <ValidatedInput
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                  error={errors.stock}
                />
              </FormField>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <FormField label="Product Images" error={errors.images} required>
              <div className="space-y-4">
                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={image.url}
                            alt={image.altText || `Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                Primary
                              </Badge>
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      e.target.files && addImages(e.target.files)
                    }
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Add Images</p>
                    <p className="text-sm text-gray-500">
                      Click to select images or drag and drop
                    </p>
                  </label>
                </div>
              </div>
            </FormField>

            <Separator />

            <FormField label="Product Videos (Optional)">
              <div className="space-y-4">
                {/* Existing Videos */}
                {formData.videos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.videos.map((video, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            controls={false}
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="text-white text-sm font-medium">
                              Video {index + 1}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeVideo(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Videos */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) =>
                      e.target.files && addVideos(e.target.files)
                    }
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Add Videos</p>
                    <p className="text-sm text-gray-500">
                      Click to select videos or drag and drop
                    </p>
                  </label>
                </div>
              </div>
            </FormField>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Weight (kg)" error={errors.weight}>
                <ValidatedInput
                  type="number"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                  error={errors.weight}
                />
              </FormField>
              <FormField label="Length (cm)">
                <ValidatedInput type="number" placeholder="0" />
              </FormField>
              <FormField label="Width (cm)">
                <ValidatedInput type="number" placeholder="0" />
              </FormField>
            </div>
            <FormField label="Shipping Class">
              <ValidatedSelect
                value={formData.shippingClass}
                onValueChange={(value) =>
                  updateFormData("shippingClass", value)
                }
                placeholder="Select shipping class"
              >
                <SelectItem value="standard">Standard Shipping</SelectItem>
                <SelectItem value="express">Express Shipping</SelectItem>
                <SelectItem value="overnight">Overnight Shipping</SelectItem>
                <SelectItem value="free">Free Shipping</SelectItem>
              </ValidatedSelect>
            </FormField>
            <FormField label="Delivery Options">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="standard-delivery" />
                  <FormField label="Standard Delivery (5-7 days)" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="express-delivery" />
                  <FormField label="Express Delivery (2-3 days)" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="same-day" />
                  <FormField label="Same Day Delivery" />
                </div>
              </div>
            </FormField>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <FormField label="Return Policy">
              <ValidatedTextarea
                placeholder="Describe your return policy..."
                className="min-h-[120px]"
                value={formData.returnPolicy}
                onChange={(e) => updateFormData("returnPolicy", e.target.value)}
              />
            </FormField>
            <FormField label="Warranty Information">
              <ValidatedTextarea
                placeholder="Describe warranty terms..."
                className="min-h-[120px]"
                value={formData.warranty}
                onChange={(e) => updateFormData("warranty", e.target.value)}
              />
            </FormField>
            <FormField label="Additional Policies">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="exchange-allowed" />
                  <FormField label="Allow exchanges" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="refund-allowed" />
                  <FormField label="Allow refunds" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="international-shipping" />
                  <FormField label="International shipping available" />
                </div>
              </div>
            </FormField>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Progress Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Step {currentStep} of {steps.length}
                </CardTitle>
                <CardDescription>
                  {steps[currentStep - 1]?.title}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
        </Card>

        {/* Step Navigation */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-2 text-sm">
                  <div
                    className={
                      currentStep >= step.id
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-muted mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            {currentStep === steps.length ? (
              <Button onClick={handleSave} disabled={isLoading}>
                Update Product
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
