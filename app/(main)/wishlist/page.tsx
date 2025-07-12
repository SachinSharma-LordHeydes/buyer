"use client";

import Header from "@/components/common/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const initialWishlistItems = [
  {
    id: 1,
    name: 'iPad Pro 12.9"',
    price: 899,
    originalPrice: 1099,
    discount: 18,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    inStock: true,
  },
  {
    id: 2,
    name: "AirPods Pro 2",
    price: 199,
    originalPrice: 249,
    discount: 20,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    inStock: true,
  },
  {
    id: 3,
    name: "Apple Watch Series 9",
    price: 329,
    originalPrice: 399,
    discount: 18,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    inStock: false,
  },
  {
    id: 4,
    name: 'MacBook Pro 14"',
    price: 1599,
    originalPrice: 1999,
    discount: 20,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    inStock: true,
  },
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);

  const removeFromWishlist = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
  };

  const moveToCart = (id: number) => {
    // In a real app, this would add to cart and remove from wishlist
    console.log(`Moving item ${id} to cart`);
    removeFromWishlist(id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Your wishlist is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Save items you love by clicking the heart icon.
          </p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            My Wishlist ({wishlistItems.length} items)
          </h1>
          <Button
            variant="outline"
            onClick={() => setWishlistItems([])}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {item.discount}% OFF
                </Badge>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <Link href={`/product/${item.id}`}>
                  <h3 className="font-medium text-gray-800 mb-2 hover:text-blue-600 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-gray-800">
                    ${item.price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${item.originalPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.floor(item.rating))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      ({item.rating})
                    </span>
                  </div>
                  <Badge variant={item.inStock ? "default" : "secondary"}>
                    {item.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => moveToCart(item.id)}
                    disabled={!item.inStock}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.inStock ? "Add to Cart" : "Notify When Available"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
