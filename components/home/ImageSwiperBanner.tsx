"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ImageSwiperBannerProps {
  images: { src: string; alt?: string }[];
  autoSlideInterval?: number;
  heightClass?: string;
}

const ImageSwiperBanner: React.FC<ImageSwiperBannerProps> = ({
  images,
  autoSlideInterval = 4000,
  heightClass = "h-48 sm:h-64 md:h-80",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [images.length, autoSlideInterval]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${heightClass} bg-white dark:bg-background`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full w-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0 relative">
            <img
              src={image.src}
              alt={image.alt || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 dark:bg-background/40 hover:bg-white/50 dark:hover:bg-background/60 backdrop-blur-sm rounded-full p-3 transition-all z-10"
      >
        <ChevronLeft className="h-6 w-6 text-white dark:text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 dark:bg-background/40 hover:bg-white/50 dark:hover:bg-background/60 backdrop-blur-sm rounded-full p-3 transition-all z-10"
      >
        <ChevronRight className="h-6 w-6 text-white dark:text-foreground" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index === currentSlide
                ? "bg-blue-500 dark:bg-primary"
                : "bg-white/50 dark:bg-background/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSwiperBanner;
