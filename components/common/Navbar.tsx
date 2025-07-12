"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 dark:bg-background backdrop-blur-sm border-b border-gray-200 dark:border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-nepal-gradient bg-clip-text text-transparent dark:text-foreground">
              NepalMart
            </h1>
            <span className="ml-2 text-xs bg-nepal-red text-white dark:bg-primary dark:text-primary-foreground px-2 py-1 rounded-full">
              नेपाल
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                // placeholder={t("search_placeholder")}
                placeholder="Search for products, brands, categories..."
                className="pl-4 pr-12 py-3 rounded-md border-2 border-gray-200 dark:border-border bg-white dark:bg-background text-black dark:text-foreground focus:border-nepal-red transition-colors focus:outline-none outline-none"
              />
              <Button
                size="sm"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-md bg-gray-500 hover:bg-nepal-crimson dark:bg-border dark:hover:bg-primary"
              >
                <Search className="h-4 w-4 text-white dark:text-foreground" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* <LanguageSwitcher /> */}

            <Link href="/account">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                {/* <span className="hidden lg:inline">{t("account")}</span> */}
                <span className="hidden lg:inline">Account</span>
              </Button>
            </Link>

            {/* theme toggle */}
            <ThemeToggle className="h-8 w-8 bg-transparent shrink-0" />

            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-nepal-red text-white dark:bg-primary dark:text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-4">
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-start gap-2"
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Button>
              </Link>
              <ThemeToggle 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-start gap-2" 
                showLabel={true}
              />
            </div>
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Input
              // placeholder={t("search_placeholder")}
              placeholder="Search for products, brands, categories..."
              className="pl-4 pr-12 py-3 rounded-full border-2 border-gray-200 dark:border-border bg-white dark:bg-background text-black dark:text-foreground"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-nepal-red hover:bg-nepal-crimson dark:bg-primary dark:hover:bg-primary/80"
            >
              <Search className="h-4 w-4 text-white dark:text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
