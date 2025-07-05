import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sku: string;
  stock: string;
  features: { feature: string; value: string }[];
  images: { url: string; altText?: string; isPrimary?: boolean; file?: File }[];
  videos: { url: string; publicId?: string; file?: File }[];
}

export function useProductForm(createProductMutation: any, generateUploadUrlMutation: any) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    sku: "",
    stock: "",
    features: [],
    images: [],
    videos: [],
  });

  const [createProduct] = useMutation(createProductMutation);
  const [generateUploadUrl] = useMutation(generateUploadUrlMutation);

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (formData.name.length > 100) newErrors.name = "Name must be less than 100 characters";
        if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
        break;
      case 3:
        if (!formData.price) {
          newErrors.price = "Price is required";
        } else {
          const price = Number.parseFloat(formData.price);
          if (isNaN(price) || price <= 0) newErrors.price = "Price must be a valid positive number";
        }
        if (!formData.sku.trim()) newErrors.sku = "SKU is required";
        if (!formData.stock) {
          newErrors.stock = "Stock is required";
        } else {
          const stock = Number.parseInt(formData.stock);
          if (isNaN(stock) || stock < 0) newErrors.stock = "Stock must be a valid non-negative number";
        }
        break;
      case 4:
        if (formData.images.length < 1) newErrors.images = "At least 1 image is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    // State
    currentStep,
    setCurrentStep,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    newFeature,
    setNewFeature,
    formData,
    setFormData,
    
    // Mutations
    createProduct,
    generateUploadUrl,
    
    // Functions
    updateFormData,
    validateStep,
    
    // Router
    router,
  };
}
