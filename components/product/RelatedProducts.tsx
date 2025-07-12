"use client";

import RelatedProductCard from "./RelatedProductCard";

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

interface RelatedProductsProps {
  products: RelatedProduct[];
  title?: string;
}

export default function RelatedProducts({ 
  products, 
  title = "Related Products" 
}: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white dark:bg-muted rounded-lg shadow-sm border border-gray-200 dark:border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-foreground">
          {title}
        </h2>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">
          {products.length} item{products.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <RelatedProductCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>
      
      {/* Show More Button for large product lists */}
      {products.length > 8 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 border border-blue-600 dark:border-primary rounded-lg hover:bg-blue-50 dark:hover:bg-primary/10 transition-colors">
            View More Related Products
          </button>
        </div>
      )}
    </div>
  );
}
