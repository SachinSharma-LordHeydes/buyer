import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-background text-white dark:text-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800 dark:border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated with NepalMart
            </h3>
            <p className="text-gray-400 dark:text-muted-foreground mb-8">
              Get the latest deals, new arrivals, and exclusive offers delivered
              to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email address"
                className="bg-gray-800 dark:bg-background border-gray-700 dark:border-border text-white dark:text-foreground placeholder-gray-400 dark:placeholder-muted-foreground"
              />
              <Button className="bg-nepal-red hover:bg-nepal-crimson dark:bg-primary dark:hover:bg-primary/80 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">NepalMart</h3>
            <p className="text-gray-400 dark:text-muted-foreground leading-relaxed">
              Nepal's premier e-commerce platform, connecting you with authentic
              products and trusted sellers across the country.
            </p>
            <div className="flex space-x-4">
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-800 dark:hover:bg-border"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-800 dark:hover:bg-border"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-800 dark:hover:bg-border"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-800 dark:hover:bg-border"
              >
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Become a Seller
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Track Your Order
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
                >
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-nepal-red dark:text-primary" />
                <span className="text-gray-400 dark:text-muted-foreground">
                  Kathmandu, Nepal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-nepal-red dark:text-primary" />
                <span className="text-gray-400 dark:text-muted-foreground">
                  +977-1-XXXXXXX
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-nepal-red dark:text-primary" />
                <span className="text-gray-400 dark:text-muted-foreground">
                  support@nepalmart.com
                </span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                🇳🇵 Proudly serving Nepal since 2024
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 dark:border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 dark:text-muted-foreground text-sm">
              © 2024 NepalMart. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
