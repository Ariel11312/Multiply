import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import carousel1 from "../../assets/carousel1.png";
import carousel2 from "../../assets/bg1.png";
import carousel3 from "../../assets/single.png";
import carousel4 from "../../assets/cnergee.png";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample images array - replace with your actual images
  const images = [carousel2, carousel1, carousel3, carousel4];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Main carousel container */}
      <div className="relative h-[480px] md:h-[850px] overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-transform pt-16 duration-1000 ease-in-out ${
              index === currentIndex ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              transform: `translateX(${100 * (index - currentIndex)}%)`,
            }}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-contain "
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Enhanced dot indicators with green/gray colors */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 cursor-pointer hover:scale-110 ${
              index === currentIndex
                ? "bg-green-500 scale-110" // Active dot (green)
                : "bg-gray-400 hover:bg-gray-500" // Inactive dot (gray)
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
