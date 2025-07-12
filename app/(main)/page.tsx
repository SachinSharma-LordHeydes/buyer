import CategoryGrid from "@/components/home/CategoryGrid";
import CategorySection from "@/components/home/CategorySection";
import ImageSwiperBanner from "@/components/home/ImageSwiperBanner";
import OfferSections from "@/components/OfferSections";
export default function HomePage() {
  const bannerImages = [
    {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      alt: "Fashion Apparel Banner",
    },
    {
      src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
      alt: "Laptop & Tech Sale",
    },
    {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      alt: "Modern Home Decor Banner",
    },
    {
      src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
      alt: "Laptop & Tech Sale",
    },
    {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      alt: "Modern Home Decor Banner",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <main>
        <CategorySection />
        <div className="container mx-auto px-4">
          <ImageSwiperBanner images={bannerImages} />
        </div>
        {/* <PromoSwiper /> */}
        <OfferSections />

        <div className="my-5">
          <CategoryGrid />
        </div>
      </main>
    </div>
  );
}
