import ProductCard from "./common/ProductCard";

const offerSections = [
  {
    title: "Electronics Deals",
    subtitle: "Up to 60% off on smartphones, laptops & more",
    products: [
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
        name: "MacBook Air M3",
        originalPrice: 1299,
        discountedPrice: 1099,
        discount: 15,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.9,
        reviews: 567,
      },
      {
        id: 4,
        name: 'iPad Pro 12.9"',
        originalPrice: 1099,
        discountedPrice: 899,
        discount: 18,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.7,
        reviews: 423,
      },
    ],
  },
  {
    title: "Fashion Favorites",
    subtitle: "Trending styles at unbeatable prices",
    products: [
      {
        id: 5,
        name: "Designer Jacket",
        originalPrice: 199,
        discountedPrice: 129,
        discount: 35,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.5,
        reviews: 234,
      },
      {
        id: 6,
        name: "Premium Sneakers",
        originalPrice: 149,
        discountedPrice: 99,
        discount: 34,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.4,
        reviews: 567,
      },
      {
        id: 7,
        name: "Casual Dress",
        originalPrice: 89,
        discountedPrice: 59,
        discount: 34,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.6,
        reviews: 189,
      },
      {
        id: 8,
        name: "Leather Handbag",
        originalPrice: 299,
        discountedPrice: 199,
        discount: 33,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.8,
        reviews: 345,
      },
    ],
  },
  {
    title: "Home & Kitchen",
    subtitle: "Essential items for your home",
    products: [
      {
        id: 9,
        name: "Coffee Maker",
        originalPrice: 159,
        discountedPrice: 119,
        discount: 25,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.3,
        reviews: 678,
      },
      {
        id: 10,
        name: "Air Fryer",
        originalPrice: 199,
        discountedPrice: 149,
        discount: 25,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.7,
        reviews: 892,
      },
      {
        id: 11,
        name: "Vacuum Cleaner",
        originalPrice: 299,
        discountedPrice: 219,
        discount: 27,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.5,
        reviews: 456,
      },
      {
        id: 12,
        name: "Smart Thermostat",
        originalPrice: 249,
        discountedPrice: 179,
        discount: 28,
        image: "/placeholder.svg?height=200&width=200",
        rating: 4.6,
        reviews: 234,
      },
    ],
  },
];

export default function OfferSections() {
  return (
    <div className="bg-gray-50 dark:bg-background py-8">
      <div className="container mx-auto px-4 space-y-12">
        {offerSections.map((section, index) => (
          <section
            key={index}
            className="bg-white dark:bg-muted rounded-lg p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-muted-foreground">
                {section.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
