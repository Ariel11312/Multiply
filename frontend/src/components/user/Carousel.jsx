import React from "react";
import { Star } from "lucide-react";

const Carousel = () => {
  const testimonials = [
    {
      name: "David Chen",
      role: "WeMultiply Golden Seat Member",
      message:
        "Yumaman ako dahil sa wemultiply. Salamat sa lahat ng blessings!",
      rating: 5,
      productUsed: "Golden Seater",
      image: "",
    },
    {
      name: "Sarah Martinez",
      role: "WeMultiply Golden Seat Member",
      message:
        "I earned my 1st million because of wemultiply. I can't believe it",
      rating: 5,
      productUsed: "Golden Seater",
      image: "",
    },
    {
      name: "Mike Johnson",
      role: "WeMultiply Golden Seat Member",
      message:
        "Nakapaghongkong ako dahil sa weMultiply",
      rating: 5,
      productUsed: "Golden Seater",
      image: "",
    },
    {
      name: "Emma Wilson",
      role: "WeMultiply Golden Seat Member",
      message:
        "Ang sarap makita ung weMultiply na wallet ko na padami ng padami araw araw. Literal na multiply",
      rating: 5,
      productUsed: "Golden Seater",
      image: "",
    },
    {
      name: "Alex Thompson",
      role: "WeMultiply Golden Seat Member",
      message:
        "Amg sarap maging goldenseater! Natupad ang pangarap kong maging governor, e-Governor nga lang. Thank you weMultiply",
      rating: 5,
      productUsed: "Golden Seater",
      image: "",
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
