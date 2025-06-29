import { z } from "zod"

// Product validation schema
export const productSchema = z.object({
  title: z.string().min(1, "Product title is required").max(100, "Title must be less than 100 characters"),
  brand: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Price must be a valid positive number"),
  comparePrice: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Compare price must be a valid positive number"),
  costPrice: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Cost price must be a valid positive number"),
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
  quantity: z.string().refine((val) => {
    const num = Number.parseInt(val)
    return !isNaN(num) && num >= 0
  }, "Quantity must be a valid non-negative number"),
  weight: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Weight must be a valid positive number"),
  images: z.array(z.string()).min(5, "At least 5 images are required"),
})

// Customer message validation
export const messageSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
  priority: z.enum(["low", "normal", "high"]),
})

// Discount validation
export const discountSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code must be less than 20 characters"),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Value must be a valid positive number"),
  limit: z.string().refine((val) => {
    const num = Number.parseInt(val)
    return !isNaN(num) && num > 0
  }, "Limit must be a valid positive number"),
  expiryDate: z.string().min(1, "Expiry date is required"),
})

// Campaign validation
export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(["discount", "promotion", "advertisement"]),
  budget: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Budget must be a valid positive number"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

// Profile validation
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s\-$$$$]+$/, "Invalid phone number format"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type DiscountFormData = z.infer<typeof discountSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
