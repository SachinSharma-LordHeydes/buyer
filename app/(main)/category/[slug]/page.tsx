import ProductCard from "@/components/common/ProductCard";
import ProductFilters from "@/components/ProductFilters";

// Mock data for category products
const categoryProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    originalPrice: 999,
    discountedPrice: 849,
    discount: 15,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviews: 1250,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    originalPrice: 899,
    discountedPrice: 699,
    discount: 22,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    reviews: 890,
  },
  {
    id: 3,
    name: "Google Pixel 8 Pro",
    originalPrice: 799,
    discountedPrice: 649,
    discount: 19,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    reviews: 567,
  },
  {
    id: 4,
    name: "OnePlus 12",
    originalPrice: 699,
    discountedPrice: 599,
    discount: 14,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.5,
    reviews: 423,
  },
  {
    id: 5,
    name: "Xiaomi 14 Ultra",
    originalPrice: 899,
    discountedPrice: 749,
    discount: 17,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    reviews: 334,
  },
  {
    id: 6,
    name: "Sony Xperia 1 V",
    originalPrice: 1199,
    discountedPrice: 999,
    discount: 17,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.4,
    reviews: 234,
  },
];

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = params.slug
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  console.log("category name-->", categoryName);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Showing {categoryProducts.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
