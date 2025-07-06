"use client";

import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import {
  FormField,
  ValidatedInput,
  ValidatedTextarea,
} from "@/components/form-field";
import { ProductFormSkeleton } from "@/components/skeletons/ProductFormSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  UploadProgressModal,
  useUploadProgress,
} from "@/components/UploadProgressModal";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Package,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const uploadProgress = useUploadProgress();

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
  if (loading || isLoading) {
    return <ProductFormSkeleton />;
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

    // Initialize upload steps
    const steps = [];

    const newImages = formData.images.filter((img) => img.file);
    const newVideos = formData.videos.filter((vid) => vid.file);

    if (newImages.length > 0) {
      steps.push({
        id: "images",
        label: `Uploading Images (${newImages.length})`,
        icon: <ImageIcon className="w-5 h-5" />,
      });
    }

    if (newVideos.length > 0) {
      steps.push({
        id: "videos",
        label: `Uploading Videos (${newVideos.length})`,
        icon: <Video className="w-5 h-5" />,
      });
    }

    steps.push({
      id: "product",
      label: "Updating Product",
      icon: <Package className="w-5 h-5" />,
    });

    uploadProgress.initializeSteps(steps);
    uploadProgress.openModal();

    try {
      // Upload new images
      const uploadedImages = [];
      if (newImages.length > 0) {
        uploadProgress.startStep(
          "images",
          `Starting upload of ${newImages.length} new images...`
        );

        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          if (image.file) {
            const imageIndex = newImages.findIndex(
              (img) => img.file === image.file
            );
            const progressPercent = Math.round(
              ((imageIndex + 0.5) / newImages.length) * 100
            );
            uploadProgress.updateStepProgress(
              "images",
              progressPercent,
              `Uploading image ${imageIndex + 1} of ${newImages.length}...`
            );

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

        uploadProgress.completeStep(
          "images",
          `Successfully uploaded ${newImages.length} new images`
        );
      } else {
        // No new images, just use existing ones
        formData.images.forEach((image) => {
          uploadedImages.push({
            url: image.url,
            altText: image.altText || "",
            isPrimary: image.isPrimary || false,
          });
        });
      }

      // Upload new videos
      const uploadedVideos = [];
      if (newVideos.length > 0) {
        uploadProgress.startStep(
          "videos",
          `Starting upload of ${newVideos.length} new videos...`
        );

        for (let i = 0; i < formData.videos.length; i++) {
          const video = formData.videos[i];
          if (video.file) {
            const videoIndex = newVideos.findIndex(
              (vid) => vid.file === video.file
            );
            const progressPercent = Math.round(
              ((videoIndex + 0.5) / newVideos.length) * 100
            );
            uploadProgress.updateStepProgress(
              "videos",
              progressPercent,
              `Uploading video ${videoIndex + 1} of ${newVideos.length}...`
            );

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

        uploadProgress.completeStep(
          "videos",
          `Successfully uploaded ${newVideos.length} new videos`
        );
      } else {
        // No new videos, just use existing ones
        formData.videos.forEach((video) => {
          uploadedVideos.push({
            url: video.url,
            publicId: video.publicId,
          });
        });
      }

      // Format features properly
      const formattedFeatures = formData.features.map((feature) => ({
        feature: feature.feature,
        value: feature.value || "", // Ensure value is always a string
      }));

      // Update product
      uploadProgress.startStep("product", "Updating product in database...");

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

      if (result.data?.updateProduct?.success) {
        uploadProgress.completeStep("product", "Product updated successfully!");

        // Wait a moment to show completion
        setTimeout(() => {
          uploadProgress.closeModal();
          toast.success("Product updated successfully!", {
            description: "Your product changes have been saved.",
          });
          router.push("/products");
        }, 1500);
      } else {
        uploadProgress.errorStep(
          "product",
          result.data?.updateProduct?.message || "Failed to update product"
        );
        toast.error("Failed to update product", {
          description:
            result.data?.updateProduct?.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      const currentStepId = uploadProgress.currentStep;
      uploadProgress.errorStep(
        currentStepId,
        error instanceof Error ? error.message : "An error occurred"
      );

      toast.error("Failed to update product", {
        description: "An error occurred while updating the product",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteProduct({ variables: { id: productId } });
      if (result.data?.deleteProduct?.success) {
        toast.success("Product deleted successfully!", {
          description: "The product has been removed from your store.",
        });
        router.push("/products");
      } else {
        toast.error("Failed to delete product", {
          description:
            result.data?.deleteProduct?.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product", {
        description: "An error occurred while deleting the product",
      });
    }
  };

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
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="w-full space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div className="w-full">
                <FormField label="Product Name" error={errors.name} required>
                  <ValidatedInput
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    error={errors.name}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
              <div className="w-full">
                <FormField label="SKU" error={errors.sku} required>
                  <ValidatedInput
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={(e) => updateFormData("sku", e.target.value)}
                    error={errors.sku}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
            </div>
            <div className="w-full space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div className="w-full">
                <FormField label="Price" error={errors.price} required>
                  <ValidatedInput
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    error={errors.price}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
              <div className="w-full">
                <FormField label="Stock" error={errors.stock} required>
                  <ValidatedInput
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => updateFormData("stock", e.target.value)}
                    error={errors.stock}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
            </div>
            <div className="w-full">
              <FormField
                label="Product Description"
                error={errors.description}
                required
              >
                <ValidatedTextarea
                  placeholder="Describe your product..."
                  className="min-h-[80px] sm:min-h-[100px] resize-none w-full"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  error={errors.description}
                />
              </FormField>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="w-full">
              <FormField label="Key Features">
                <div className="space-y-3 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <ValidatedInput
                      placeholder="Add a feature and press Enter"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addFeature()}
                      className="flex-1 h-10 w-full sm:w-auto"
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeature.trim()}
                      className="w-full sm:w-auto h-10 px-4 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Feature</span>
                    </Button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 overflow-y-auto w-full">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1 py-1 px-2 max-w-full">
                          <span className="truncate max-w-[100px] sm:max-w-[150px]">{feature.feature}</span>
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive flex-shrink-0"
                            onClick={() => removeFeature(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {formData.features.length === 0 && (
                    <div className="text-xs sm:text-sm text-muted-foreground text-center py-4 w-full">
                      No features added yet. Add features to highlight your product's key benefits.
                    </div>
                  )}
                </div>
              </FormField>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="w-full space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div className="w-full">
                <FormField label="Price" error={errors.price} required>
                  <ValidatedInput
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    error={errors.price}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
              <div className="w-full">
                <FormField label="Stock" error={errors.stock} required>
                  <ValidatedInput
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => updateFormData("stock", e.target.value)}
                    error={errors.stock}
                    className="h-10 w-full"
                  />
                </FormField>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4 w-full">
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p className="mb-1"><strong>Price:</strong> Set competitive pricing for your product</p>
                <p><strong>Stock:</strong> Current inventory count (can be updated later)</p>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="w-full">
              <FormField label="Product Images" error={errors.images} required>
                <div className="space-y-3 w-full">
                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group w-full">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 w-full">
                            <Image
                              src={image.url}
                              alt={image.altText || `Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {image.isPrimary && (
                              <div className="absolute top-1 left-1">
                                <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1 py-0">
                                  Primary
                                </Badge>
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors w-full">
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
                    <label htmlFor="image-upload" className="cursor-pointer block w-full">
                      <Plus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Add Images</p>
                      <p className="text-xs text-gray-500">
                        Click to select images
                      </p>
                    </label>
                  </div>
                </div>
              </FormField>
            </div>

            <Separator className="my-2" />

            <div className="w-full">
              <FormField label="Product Videos (Optional)">
                <div className="space-y-3 w-full">
                  {/* Existing Videos */}
                  {formData.videos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="relative group w-full">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 w-full">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              controls={false}
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <div className="text-white text-xs font-medium">
                                Video {index + 1}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors w-full">
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
                    <label htmlFor="video-upload" className="cursor-pointer block w-full">
                      <Plus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Add Videos</p>
                      <p className="text-xs text-gray-500">
                        Click to select videos
                      </p>
                    </label>
                  </div>
                </div>
              </FormField>
            </div>
          </div>
        );
      // Remove cases 5 and 6 since they're not being used and have missing fields
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 w-full max-w-full overflow-hidden">
      <div className="space-y-3 sm:space-y-4 p-2 sm:p-4 md:p-8 pt-3 sm:pt-6 w-full">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 flex-shrink-0">
              <Link href="/products">
                <ArrowLeft className="mr-1 h-3 w-3" />
                <span className="text-sm">Back</span>
              </Link>
            </Button>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">Edit Product</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className="h-8 px-3"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              <span className="text-sm">Delete</span>
            </Button>
          </div>
        </div>

        <div className="w-full space-y-3 sm:space-y-6">
          {/* Progress Header */}
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                    Step {currentStep} of {steps.length}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1 truncate">
                    {steps[currentStep - 1]?.title}
                  </CardDescription>
                </div>
                <div className="text-xs text-muted-foreground font-medium flex-shrink-0 ml-2">
                  {Math.round(progress)}%
                </div>
              </div>
              <Progress value={progress} className="w-full mt-3 h-2" />
            </CardHeader>
          </Card>

          {/* Step Navigation */}
          <div className="w-full overflow-hidden">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide pb-2 px-1">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0 min-w-0">
                  <div className="flex items-center space-x-1 min-w-0">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0 ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="text-xs min-w-0 max-w-[50px] sm:max-w-[80px]">
                      <div
                        className={`truncate ${
                          currentStep >= step.id
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="hidden sm:inline">{step.title.split(' ')[0]}</span>
                        <span className="sm:hidden">{step.title.charAt(0)}</span>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-2 sm:w-4 h-px bg-muted mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Form Content */}
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-6 pb-3">
              <CardTitle className="text-base sm:text-lg truncate">{steps[currentStep - 1]?.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 w-full overflow-hidden">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0 w-full">
            {/* Primary Actions - Top on mobile, Right on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 order-1 sm:order-2">
              <Button 
                variant="outline" 
                onClick={handleSave} 
                disabled={uploadProgress.isOpen} 
                className="w-full sm:w-auto h-10"
              >
                <Save className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </Button>
              {currentStep === steps.length ? (
                <Button onClick={handleSave} disabled={uploadProgress.isOpen} className="w-full sm:w-auto h-10">
                  <span className="hidden sm:inline">Update Product</span>
                  <span className="sm:hidden">Update</span>
                </Button>
              ) : (
                <Button onClick={nextStep} className="w-full sm:w-auto h-10">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Previous Button - Bottom on mobile, Left on desktop */}
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-full sm:w-auto h-10 order-2 sm:order-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </div>
        </div>
      </div>
      
      {/* Upload Progress Modal */}
      <UploadProgressModal
        open={uploadProgress.isOpen}
        onOpenChange={uploadProgress.closeModal}
        steps={uploadProgress.steps}
        currentStep={uploadProgress.currentStep}
        overallProgress={uploadProgress.overallProgress}
        title="Updating Product"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete"
        itemName={`"${formData.name}"`}
        isLoading={isLoading}
      />
    </div>
  );
}
