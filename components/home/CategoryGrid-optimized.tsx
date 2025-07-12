"use client";

import { categoryData } from "@/data/catagoryGridData";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Memoized category item component for better performance
const CategoryItem = memo(({ item, index }: { item: any; index: number }) => (
  <Link href={item.link} className="cursor-pointer group">
    <div className="aspect-square bg-white dark:bg-background rounded-lg overflow-hidden mb-0.5 sm:mb-1">
      <Image
        src={item.image}
        alt={item.title}
        width={300}
        height={300}
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
        loading={index === 0 ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kgkcc/9k="
      />
    </div>
    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-foreground line-clamp-2">
      {item.title}
    </p>
  </Link>
));

CategoryItem.displayName = "CategoryItem";

// Memoized category section component
const CategorySection = memo(({ section }: { section: any }) => (
  <div
    className={cn(
      `${section.bgColor} rounded-lg p-3 sm:p-4 dark:bg-muted`,
      "flex-shrink-0 w-64 sm:w-auto"
    )}
  >
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-foreground mb-2 sm:mb-4">
      {section.title}
    </h3>

    <div className="space-y-2 sm:space-y-3">
      {section.items.length === 1 ? (
        // Single large item layout (for gaming section)
        <Link href={section.items[0].link} className="cursor-pointer group">
          <div className="aspect-video bg-white dark:bg-background rounded-lg overflow-hidden mb-1 sm:mb-2">
            <Image
              src={section.items[0].image}
              alt={section.items[0].title}
              width={600}
              height={400}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kgkcc/9k="
            />
          </div>
        </Link>
      ) : (
        // Grid layout for multiple items
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {section.items.map((item: any, index: number) => (
            <CategoryItem key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>

    <Link
      href={`/category/${section.id}`}
      className="inline-block text-xs sm:text-sm text-blue-600 dark:text-primary hover:text-blue-800 dark:hover:text-primary/80 font-medium mt-2 sm:mt-4 hover:underline transition-colors"
    >
      {section.linkText}
    </Link>
  </div>
));

CategorySection.displayName = "CategorySection";

const CategoryGrid = memo(() => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition, { passive: true });
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, [checkScrollPosition]);

  const getScrollAmount = useCallback(() => {
    return window.innerWidth < 640 ? 200 : 280; // Smaller scroll for mobile
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = getScrollAmount();
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  }, [getScrollAmount]);

  // Handle touch swipe
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) scroll("right");
    if (isRightSwipe) scroll("left");
  }, [touchStart, touchEnd, scroll]);

  return (
    <div className="mt-6 sm:mt-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-background shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-border transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-foreground" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-background shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-border transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-foreground" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className={cn(
              "sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4",
              "flex flex-row sm:flex-none overflow-x-auto sm:overflow-visible scrollbar-hide"
            )}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {categoryData.map((section) => (
              <CategorySection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CategoryGrid.displayName = "CategoryGrid";

export default CategoryGrid;
