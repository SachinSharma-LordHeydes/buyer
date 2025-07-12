"use client";

import Header from "@/components/common/Header";
import ProductFilters from "@/components/ProductFilters";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Mock product data
const product = {
  id: 1,
  name: "iPhone 15 Pro Max",
  originalPrice: 1199,
  discountedPrice: 999,
  discount: 17,
  rating: 4.8,
  reviews: 2847,
  images: [
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
  ],
  description:
    "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x telephoto zoom.",
  features: [
    "A17 Pro chip with 6-core GPU",
    "6.7-inch Super Retina XDR display",
    "Pro camera system with 48MP main camera",
    "5x telephoto zoom",
    "Titanium design",
    "USB-C connector",
  ],
  specifications: {
    Display: "6.7-inch Super Retina XDR",
    Chip: "A17 Pro",
    Storage: "128GB, 256GB, 512GB, 1TB",
    Camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
    Battery: "Up to 29 hours video playback",
    "Operating System": "iOS 17",
  },
  colors: [
    "Natural Titanium",
    "Blue Titanium",
    "White Titanium",
    "Black Titanium",
  ],
  storage: ["128GB", "256GB", "512GB", "1TB"],
};

const relatedProducts = [
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 899,
    originalPrice: 999,
    discount: 10,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    reviews: 1847,
  },
  {
    id: 3,
    name: "iPhone 15",
    price: 699,
    originalPrice: 799,
    discount: 13,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    reviews: 1234,
  },
  {
    id: 4,
    name: "iPhone 14 Pro",
    price: 799,
    originalPrice: 999,
    discount: 20,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.5,
    reviews: 987,
  },
  {
    id: 5,
    name: "Samsung Galaxy S24",
    price: 649,
    originalPrice: 799,
    discount: 19,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.4,
    reviews: 756,
  },
];

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(product.storage[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Filters Sidebar */}
          {/* <div className="lg:col-span-1">
            <ProductFilters />
          </div> */}

          {/* Product Details */}
          <div className="w-full">
            <div className="bg-white dark:bg-muted rounded-lg shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 dark:bg-background rounded-lg overflow-hidden">
                    <Image
                      src={product.images[selectedImage] || "/placeholder.svg"}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index
                            ? "border-blue-500 dark:border-primary"
                            : "border-gray-200 dark:border-border"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium text-gray-800 dark:text-foreground">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-muted-foreground">
                        ({product.reviews} reviews)
                      </span>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        In Stock
                      </Badge>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-gray-800 dark:text-foreground">
                        ${product.discountedPrice}
                      </span>
                      <span className="text-xl text-gray-500 dark:text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                      <Badge className="bg-red-500 dark:bg-primary text-white dark:text-primary-foreground">
                        {product.discount}% OFF
                      </Badge>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      You save $
                      {product.originalPrice - product.discountedPrice}
                    </p>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-foreground mb-3">Color: {selectedColor}</h3>
                    <div className="flex space-x-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-2 text-sm border rounded-lg ${
                            selectedColor === color
                              ? "border-blue-500 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary"
                              : "border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border text-gray-700 dark:text-foreground"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Storage Selection */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-foreground mb-3">
                      Storage: {selectedStorage}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {product.storage.map((storage) => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-3 py-2 text-sm border rounded-lg ${
                            selectedStorage === storage
                              ? "border-blue-500 dark:border-primary bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary"
                              : "border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border text-gray-700 dark:text-foreground"
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-foreground mb-3">Quantity</h3>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium text-gray-800 dark:text-foreground">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/80 text-white dark:text-primary-foreground py-3">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={
                          isWishlisted ? "border-red-500 dark:border-red-400 text-red-500 dark:text-red-400" : ""
                        }
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${
                            isWishlisted ? "fill-current" : ""
                          }`}
                        />
                        Wishlist
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Product Details Tabs */}
              <div className="p-6">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specifications">
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-6">
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-muted-foreground">{product.description}</p>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-foreground mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-muted-foreground">
                          {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="mt-6">
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b border-gray-100 dark:border-border"
                          >
                            <span className="font-medium text-gray-700 dark:text-foreground">
                              {key}
                            </span>
                            <span className="text-gray-600 dark:text-muted-foreground">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-6">
                    <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
                      Reviews section would be implemented here with user
                      reviews and ratings.
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}
