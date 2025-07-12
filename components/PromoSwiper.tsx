"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const promoImages = [
  {
    id: 1,
    title: "Summer Sale - Up to 70% Off",
    subtitle: "Fashion & Electronics",
    image: "/placeholder.svg?height=300&width=800",
    cta: "Shop Now",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Latest Gadgets & Accessories",
    image: "/placeholder.svg?height=300&width=800",
    cta: "Explore",
  },
  {
    id: 3,
    title: "Home Essentials",
    subtitle: "Transform Your Space",
    image: "/placeholder.svg?height=300&width=800",
    cta: "Discover",
  },
]

export default function PromoSwiper() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoImages.length) % promoImages.length)
  }

  return (
    <section className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="relative h-64 md:h-80">
            {promoImages.map((promo, index) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center h-full px-8 md:px-16">
                  <div className="text-white max-w-md">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{promo.title}</h2>
                    <p className="text-lg md:text-xl mb-6 opacity-90">{promo.subtitle}</p>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      {promo.cta}
                    </Button>
                  </div>
                  <div className="hidden md:block ml-auto">
                    <Image
                      src={promo.image || "/placeholder.svg"}
                      alt={promo.title}
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {promoImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
