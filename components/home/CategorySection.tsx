"use client";

import { categories } from "@/data/catagory";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function CategorySection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-2 md:py-5 bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Grid layout for tablet and larger */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="group cursor-pointer animate-fade-in "
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  router.push(
                    `/category/${category.name
                      .toLowerCase()
                      .replace(" & ", "-")
                      .replace(" ", "-")}`
                  );
                }}
              >
                <div className="bg-white dark:bg-muted rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div
                    className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-center mb-1 group-hover:text-nepal-red dark:group-hover:text-primary transition-colors dark:text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground text-center">
                    {/* {category.count} */}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontally scrollable layout for mobile */}
        <div className="flex md:hidden gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="min-w-[120px] flex-shrink-0 group cursor-pointer"
                onClick={() => {
                  router.push(
                    `/category/${category.name
                      .toLowerCase()
                      .replace(" & ", "-")
                      .replace(" ", "-")}`
                  );
                }}
              >
                <div className="bg-white dark:bg-muted rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div
                    className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center mb-2 mx-auto group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xs font-semibold text-center group-hover:text-nepal-red dark:group-hover:text-primary transition-colors dark:text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-muted-foreground text-center"></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
