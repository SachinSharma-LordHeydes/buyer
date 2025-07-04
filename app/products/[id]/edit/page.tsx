"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, ArrowLeft, ArrowRight, Save, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/image-upload"
import { VideoUpload } from "@/components/video-upload"
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect } from "@/components/form-field"
import { SelectItem } from "@/components/ui/select"
import Link from "next/link"

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Policies", description: "Returns and warranty" },
]

// Mock product data - in real app, this would come from API/database
const getProduct = (id: string) => {
  const products = {
    "PROD-001": {
      id: "PROD-001",
      title: "Wireless Headphones",
      brand: "TechSound",
      category: "electronics",
      subcategory: "headphones",
      description:
        "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
      features: ["Wireless Connectivity", "Long Battery Life", "Water Resistant"],
      specifications: {
        color: "Black",
        material: "Premium Plastic",
        modelNumber: "WH-001",
        warranty: "2 Years",
      },
      price: "199.99",
      comparePrice: "249.99",
      costPrice: "120.00",
      sku: "WH-001",
      quantity: "45",
      trackQuantity: true,
      images: [
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
      ],
      videos: [],
      weight: "0.3",
      dimensions: "20x15x8",
      shippingClass: "standard",
      returnPolicy: "30-day return policy. Items must be in original condition.",
      warranty: "2-year manufacturer warranty covering defects and malfunctions.",
    },
    "PROD-002": {
      id: "PROD-002",
      title: "Smart Watch",
      brand: "FitTech",
      category: "electronics",
      subcategory: "accessories",
      description: "Advanced smartwatch with health monitoring and fitness tracking capabilities.",
      features: ["Health Monitoring", "GPS Tracking", "Water Resistant"],
      specifications: {
        color: "Silver",
        material: "Aluminum",
        modelNumber: "SW-002",
        warranty: "1 Year",
      },
      price: "299.99",
      comparePrice: "349.99",
      costPrice: "180.00",
      sku: "SW-002",
      quantity: "23",
      trackQuantity: true,
      images: [
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
      ],
      videos: [],
      weight: "0.05",
      dimensions: "4x4x1",
      shippingClass: "express",
      returnPolicy: "14-day return policy for electronics.",
      warranty: "1-year limited warranty.",
    },
    "PROD-003": {
      id: "PROD-003",
      title: "Laptop Stand",
      brand: "ErgoDesk",
      category: "home",
      subcategory: "accessories",
      description: "Ergonomic laptop stand for better posture and workspace organization.",
      features: ["Adjustable Height", "Portable Design", "Heat Dissipation"],
      specifications: {
        color: "Space Gray",
        material: "Aluminum Alloy",
        modelNumber: "LS-003",
        warranty: "1 Year",
      },
      price: "49.99",
      comparePrice: "69.99",
      costPrice: "25.00",
      sku: "LS-003",
      quantity: "0",
      trackQuantity: true,
      images: [
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
      ],
      videos: [],
      weight: "1.2",
      dimensions: "30x25x5",
      shippingClass: "standard",
      returnPolicy: "30-day return policy.",
      warranty: "1-year warranty against manufacturing defects.",
    },
  }
  return products[id as keyof typeof products]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const product = getProduct(params.id)

  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: product?.title || "",
    brand: product?.brand || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    description: product?.description || "",
    features: product?.features || [],
    specifications: product?.specifications || {},
    price: product?.price || "",
    comparePrice: product?.comparePrice || "",
    costPrice: product?.costPrice || "",
    sku: product?.sku || "",
    quantity: product?.quantity || "",
    trackQuantity: product?.trackQuantity ?? true,
    images: product?.images || [],
    videos: product?.videos || [],
    weight: product?.weight || "",
    dimensions: product?.dimensions || "",
    shippingClass: product?.shippingClass || "",
    returnPolicy: product?.returnPolicy || "",
    warranty: product?.warranty || "",
  })

  if (!product) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Product not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = (currentStep / steps.length) * 100

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Product title is required"
        if (formData.title.length > 100) newErrors.title = "Title must be less than 100 characters"
        if (!formData.category) newErrors.category = "Category is required"
        if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters"
        break
      case 3:
        if (!formData.price) {
          newErrors.price = "Price is required"
        } else {
          const price = Number.parseFloat(formData.price)
          if (isNaN(price) || price <= 0) newErrors.price = "Price must be a valid positive number"
        }
        if (!formData.sku.trim()) newErrors.sku = "SKU is required"
        if (!formData.quantity) {
          newErrors.quantity = "Quantity is required"
        } else {
          const quantity = Number.parseInt(formData.quantity)
          if (isNaN(quantity) || quantity < 0) newErrors.quantity = "Quantity must be a valid non-negative number"
        }
        break
      case 4:
        if (formData.images.length < 5) newErrors.images = "At least 5 images are required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Updated product:", formData)
    setIsLoading(false)
    router.push("/products")
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Deleted product:", product.id)
      setIsLoading(false)
      router.push("/products")
    }
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    updateFormData("features", newFeatures)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Product Title" error={errors.title} required>
                <ValidatedInput
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  error={errors.title}
                />
              </FormField>
              <FormField label="Brand" error={errors.brand}>
                <ValidatedInput
                  placeholder="Enter brand name"
                  value={formData.brand}
                  onChange={(e) => updateFormData("brand", e.target.value)}
                  error={errors.brand}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Category" error={errors.category} required>
                <ValidatedSelect
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
                  placeholder="Select category"
                  error={errors.category}
                >
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </ValidatedSelect>
              </FormField>
              <FormField label="Subcategory" error={errors.subcategory}>
                <ValidatedSelect
                  value={formData.subcategory}
                  onValueChange={(value) => updateFormData("subcategory", value)}
                  placeholder="Select subcategory"
                  error={errors.subcategory}
                >
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="headphones">Headphones</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </ValidatedSelect>
              </FormField>
            </div>
            <FormField label="Product Description" error={errors.description} required>
              <ValidatedTextarea
                placeholder="Describe your product..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                error={errors.description}
              />
            </FormField>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField label="Key Features">
                <div className="space-y-2">
                  <ValidatedInput placeholder="Add a feature and press Enter" />
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                        <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFeature(index)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
            <Separator />
            <div className="space-y-4">
              <FormField label="Technical Specifications">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Color">
                    <ValidatedInput
                      placeholder="e.g., Black, White, Blue"
                      value={formData.specifications.color || ""}
                      onChange={(e) =>
                        updateFormData("specifications", { ...formData.specifications, color: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Material">
                    <ValidatedInput
                      placeholder="e.g., Plastic, Metal, Fabric"
                      value={formData.specifications.material || ""}
                      onChange={(e) =>
                        updateFormData("specifications", { ...formData.specifications, material: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Model Number">
                    <ValidatedInput
                      placeholder="e.g., ABC-123"
                      value={formData.specifications.modelNumber || ""}
                      onChange={(e) =>
                        updateFormData("specifications", { ...formData.specifications, modelNumber: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Warranty Period">
                    <ValidatedInput
                      placeholder="e.g., 1 Year, 2 Years"
                      value={formData.specifications.warranty || ""}
                      onChange={(e) =>
                        updateFormData("specifications", { ...formData.specifications, warranty: e.target.value })
                      }
                    />
                  </FormField>
                </div>
              </FormField>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Selling Price" error={errors.price} required>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  error={errors.price}
                />
              </FormField>
              <FormField label="Compare at Price" error={errors.comparePrice}>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.comparePrice}
                  onChange={(e) => updateFormData("comparePrice", e.target.value)}
                  error={errors.comparePrice}
                />
              </FormField>
              <FormField label="Cost per Item" error={errors.costPrice}>
                <ValidatedInput
                  type="number"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) => updateFormData("costPrice", e.target.value)}
                  error={errors.costPrice}
                />
              </FormField>
            </div>
            <Separator />
            <div className="space-y-4">
              <FormField label="Inventory">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="SKU (Stock Keeping Unit)" error={errors.sku} required>
                    <ValidatedInput
                      placeholder="e.g., ABC-123-XYZ"
                      value={formData.sku}
                      onChange={(e) => updateFormData("sku", e.target.value)}
                      error={errors.sku}
                    />
                  </FormField>
                  <FormField label="Quantity" error={errors.quantity} required>
                    <ValidatedInput
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => updateFormData("quantity", e.target.value)}
                      error={errors.quantity}
                    />
                  </FormField>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trackQuantity"
                    checked={formData.trackQuantity}
                    onCheckedChange={(checked) => updateFormData("trackQuantity", checked)}
                  />
                  <FormField label="Track quantity" />
                </div>
              </FormField>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <FormField label="Product Images (Minimum 5 required)" error={errors.images} required>
              <ImageUpload
                value={formData.images}
                onChange={(images) => updateFormData("images", images)}
                maxFiles={10}
              />
            </FormField>
            <Separator />
            <FormField label="Product Videos (Optional)">
              <VideoUpload
                value={formData.videos}
                onChange={(videos) => updateFormData("videos", videos)}
                maxFiles={5}
              />
            </FormField>
          </div>
        )
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
                onValueChange={(value) => updateFormData("shippingClass", value)}
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
        )
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
        )
      default:
        return null
    }
  }

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
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={isLoading}>
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
                <CardDescription>{steps[currentStep - 1]?.title}</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</div>
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
                    currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-2 text-sm">
                  <div className={currentStep >= step.id ? "font-medium" : "text-muted-foreground"}>{step.title}</div>
                </div>
                {index < steps.length - 1 && <div className="w-8 h-px bg-muted mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
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
  )
}
