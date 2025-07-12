import { Suspense } from 'react';
import CategoryGrid from "@/components/home/CategoryGrid";
import CategorySection from "@/components/home/CategorySection";
import ImageSwiperBanner from "@/components/home/ImageSwiperBanner";
import OfferSections from "@/components/OfferSections";
import { CategoryGridSkeleton } from "@/components/skeletons/CategoryGridSkeleton";
import { BannerSkeleton } from "@/components/skeletons/BannerSkeleton";

// Optimized banner images with better configuration
const BANNER_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    alt: "Fashion Apparel Collection - Discover the latest trends",
  },
  {
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
    alt: "Technology & Electronics - Laptops, gadgets and more",
  },
  {
    src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80",
    alt: "Home & Garden - Beautiful furniture and decor",
  },
  {
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    alt: "Sports & Fitness - Equipment for active lifestyle",
  },
  {
    src: "https://images.unsplash.com/photo-1574633636522-d89d7a12c069?auto=format&fit=crop&w=1200&q=80",
    alt: "Beauty & Personal Care - Premium cosmetics and skincare",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <main>
        {/* Category Navigation Section */}
        <Suspense fallback={<div className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />}>
          <CategorySection />
        </Suspense>

        {/* Hero Banner Section */}
        <section className="container mx-auto px-4">
          <Suspense fallback={<BannerSkeleton />}>
            <ImageSwiperBanner 
              images={BANNER_IMAGES}
              autoSlideInterval={5000}
              heightClass="h-48 sm:h-64 md:h-80 lg:h-96"
            />
          </Suspense>
        </section>

        {/* Offers and Promotions */}
        <section aria-label="Special offers and promotions">
          <OfferSections />
        </section>

        {/* Product Categories Grid */}
        <section className="my-8" aria-label="Product categories">
          <Suspense fallback={<CategoryGridSkeleton />}>
            <CategoryGrid />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
