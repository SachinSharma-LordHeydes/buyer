"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, ArrowLeft, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/image-upload"
import { VideoUpload } from "@/components/video-upload"
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect } from "@/components/form-field"
import { SelectItem } from "@/components/ui/select"

const steps = [
  { id: 1, title: "Basic Details", description: "Product information" },
  { id: 2, title: "Specifications", description: "Features and details" },
  { id: 3, title: "Pricing & Inventory", description: "Price and stock" },
  { id: 4, title: "Media Upload", description: "Images and videos" },
  { id: 5, title: "Shipping", description: "Delivery options" },
  { id: 6, title: "Policies", description: "Returns and warranty" },
]

export default function AddProductPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    category: "",
    subcategory: "",
    description: "",
    features: [],
    specifications: {},
    price: "",
    comparePrice: "",
    costPrice: "",
    sku: "",
    quantity: "",
    trackQuantity: true,
    images: [],
    videos: [],
    weight: "",
    dimensions: "",
    shippingClass: "",
    returnPolicy: "",
    warranty: "",
  })

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
                    <Badge variant="secondary">
                      Wireless Connectivity
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                    <Badge variant="secondary">
                      Long Battery Life
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                    <Badge variant="secondary">
                      Water Resistant
                      <X className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                  </div>
                </div>
              </FormField>
            </div>
            <Separator />
            <div className="space-y-4">
              <FormField label="Technical Specifications">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Color">
                    <ValidatedInput placeholder="e.g., Black, White, Blue" />
                  </FormField>
                  <FormField label="Material">
                    <ValidatedInput placeholder="e.g., Plastic, Metal, Fabric" />
                  </FormField>
                  <FormField label="Model Number">
                    <ValidatedInput placeholder="e.g., ABC-123" />
                  </FormField>
                  <FormField label="Warranty Period">
                    <ValidatedInput placeholder="e.g., 1 Year, 2 Years" />
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
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
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
            <Button variant="outline">Save Draft</Button>
            {currentStep === steps.length ? (
              <Button>Publish Product</Button>
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
