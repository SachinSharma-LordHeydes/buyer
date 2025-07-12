"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);

  return (
    <header className="bg-white dark:bg-background shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-600 dark:bg-primary text-white dark:text-primary-foreground py-1 px-4 text-sm text-center">
        Free shipping on orders above $50 | 24/7 Customer Support
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 dark:text-primary"
          >
            ShopMart
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full pl-4 pr-12 py-2 border-2 border-gray-200 dark:border-border rounded-lg focus:border-blue-500 dark:focus:border-primary bg-white dark:bg-background text-black dark:text-foreground"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/80"
              >
                <Search className="h-4 w-4 text-white dark:text-primary-foreground" />
              </Button>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            {/* Theme toggle button */}
            <ThemeToggle className="h-8 w-8 bg-transparent shrink-0" />

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/profile"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-primary"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-primary relative"
              >
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white dark:bg-primary dark:text-primary-foreground text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>

              <Link
                href="/cart"
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-primary relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white dark:bg-primary dark:text-primary-foreground text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
