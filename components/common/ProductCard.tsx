"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  originalPrice: number;
  discountedPrice?: number;
  discount?: number;
  image: string;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuthStatus();
  console.log(isLoggedIn);
  const handleWishlist = (e: React.MouseEvent) => {
    console.log("clicked wishlist", isWishlisted);
    if (!isLoggedIn) {
      router.push('/sign-in');
    }

    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAddingToCart(false);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white dark:bg-background rounded-lg border border-gray-200 dark:border-border overflow-hidden hover:shadow-lg transition-shadow duration-200 group relative">
        {/* Discount badge */}
        <Badge className="absolute top-2 left-2 z-10 bg-red-500 text-white dark:bg-primary dark:text-primary-foreground">
          {product.discount}% OFF
        </Badge>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white dark:bg-background rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-border transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-400 dark:text-muted-foreground"
            }`}
          />
        </button>

        {/* Product image */}
        <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Product details */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-800 dark:text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-primary">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 dark:text-muted-foreground ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-muted-foreground ml-1">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-800 dark:text-foreground">
              ${product.discountedPrice}
            </span>
            <span className="text-sm text-gray-500 dark:text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          </div>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/80 text-white dark:text-primary-foreground text-sm py-2"
            size="sm"
          >
            {isAddingToCart ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white dark:border-primary-foreground mr-2"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </div>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
