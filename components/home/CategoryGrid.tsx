"use client";

import { categoryData } from "@/data/catagoryGridData";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CategoryGrid = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  const getScrollAmount = () => {
    return window.innerWidth < 640 ? 200 : 280; // Smaller scroll for mobile
  };

  const scroll = (direction: "left" | "right") => {
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
  };

  // Handle touch swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) scroll("right");
    if (isRightSwipe) scroll("left");
  };

  return (
    <div className="mt-6 sm:mt-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-background shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-border transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-foreground" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-background shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-border transition-colors"
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
              <div
                key={section.id}
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
                    <div className="cursor-pointer group">
                      <div className="aspect-video bg-white dark:bg-background rounded-lg overflow-hidden mb-1 sm:mb-2">
                        <img
                          src={section.items[0].image}
                          alt={section.items[0].title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 touch-pinch-zoom"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    // Grid layout for multiple items
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      {section.items.map((item, index) => (
                        <div key={item.id} className="cursor-pointer group">
                          <div className="aspect-square bg-white dark:bg-background rounded-lg overflow-hidden mb-0.5 sm:mb-1">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 touch-pinch-zoom"
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-foreground line-clamp-2">
                            {item.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button className="text-xs sm:text-sm text-blue-600 dark:text-primary hover:text-blue-800 dark:hover:text-primary/80 font-medium mt-2 sm:mt-4 hover:underline">
                  {section.linkText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
