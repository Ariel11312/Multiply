import React from "react";
import { Star } from "lucide-react";

const Carousel = () => {
  const testimonials = [
    {
      name: "David Chen",
      role: "Fitness Enthusiast",
      message:
        "Cnergee's pre-workout gives me incredible energy and focus during my training sessions. No crash, just clean energy!",
      rating: 5,
      productUsed: "Pre-Workout Plus",
      image: "/api/placeholder/100/100",
    },
    {
      name: "Sarah Martinez",
      role: "CrossFit Athlete",
      message:
        "The protein blend tastes amazing and mixes perfectly. I've seen great improvements in my recovery since using Cnergee supplements.",
      rating: 5,
      productUsed: "Premium Whey Isolate",
      image: "/api/placeholder/100/100",
    },
    {
      name: "Mike Johnson",
      role: "Bodybuilder",
      message:
        "Best supplements I've used in my 10 years of training. The quality is unmatched and results are visible within weeks.",
      rating: 5,
      productUsed: "Mass Gainer Elite",
      image: "/api/placeholder/100/100",
    },
    {
      name: "Emma Wilson",
      role: "Personal Trainer",
      message:
        "I recommend Cnergee to all my clients. The BCAA blend is perfect for maintaining muscle during intense cut phases.",
      rating: 5,
      productUsed: "BCAA Recovery",
      image: "/api/placeholder/100/100",
    },
    {
      name: "Alex Thompson",
      role: "Endurance Runner",
      message:
        "The electrolyte formula has been a game-changer for my marathon training. Great taste and perfect for long runs!",
      rating: 5,
      productUsed: "Hydration Plus",
      image: "/api/placeholder/100/100",
    },
  ];

  return (
    <div className="carousel carousel-center  rounded-xl flex justify-center flex-wrap gap-5 w-screen space-x-4 p-6">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="carousel-item">
          <div className="card w-80 bg-white shadow-lg rounded-xl p-6 border border-green-100 hover:shadow-xl transition-shadow duration-300">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>

            {/* Product Used */}
            <div className="mb-3">
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {testimonial.productUsed}
              </span>
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="fill-green-500 text-green-500"
                />
              ))}
            </div>

            {/* Testimony */}
            <p className="text-gray-700 text-sm leading-relaxed">
              "{testimonial.message}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Carousel;
