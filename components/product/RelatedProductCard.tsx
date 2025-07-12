"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  reviews?: number;
}

interface RelatedProductCardProps {
  product: RelatedProduct;
}

export default function RelatedProductCard({ product }: RelatedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:border-gray-300 dark:hover:border-border">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-gray-50 dark:bg-muted overflow-hidden relative">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          <Badge className="absolute top-2 left-2 bg-red-500 dark:bg-primary text-white dark:text-primary-foreground text-xs">
            {product.discount}% OFF
          </Badge>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleWishlist();
            }}
            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-background rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-border transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`h-3 w-3 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 dark:text-muted-foreground"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-3 space-y-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm text-gray-800 dark:text-foreground group-hover:text-blue-600 dark:group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-600 dark:text-muted-foreground">
            {product.rating}
          </span>
          {product.reviews && (
            <span className="text-xs text-gray-400 dark:text-muted-foreground">
              ({product.reviews})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-800 dark:text-foreground">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500 dark:text-muted-foreground line-through">
            ${product.originalPrice}
          </span>
        </div>

        {/* Save Amount */}
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          Save ${product.originalPrice - product.price}
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/80 text-white dark:text-primary-foreground text-xs py-1.5 h-auto"
            size="sm"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white dark:border-primary-foreground mr-1"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </div>
            )}
          </Button>
          <Link href={`/product/${product.id}`}>
            <Button
              variant="outline"
              className="text-xs py-1.5 h-auto px-3"
              size="sm"
            >
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
