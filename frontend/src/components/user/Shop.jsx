import React, { useEffect, useState } from "react";
import Navbar from "../user/Navbar";
import { fetchItems } from "../../middleware/shopItems";
import { Card, CardContent } from "../../components/ui/card";
import { Diamond, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkMember } from "../../middleware/member";

const EcommerceShop = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [memberData, setMemberData] = useState(null);
  const [Reapers, setReapers] = useState(null);


const fetchReapers = async (reaper) => {  
  try {
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/member/reapers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaper }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch reapers");
    }
    
    // The backend now always returns a memberType array
    setReapers(data.memberType || []); // Extra safety in case response format changes
    return data.memberType || [];
    
  } catch (err) {
    console.error("Error fetching reapers:", err);
    setError(err.message);
    setReapers([]); // Reset to empty array on error
    throw err;
  }
};
useEffect(() => {
  // Create an async function inside useEffect
  const fetchMemberData = async () => {
    const member = await checkMember(setMemberData);

    fetchReapers(member?.referredBy);
  };

  fetchMemberData();



    fetchMemberData();

    // Rest of your code for loading products
    const loadProducts = async () => {
      try {
        await fetchItems(setItems);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [showModal, setShowModal] = useState(false); // Modal state
  // Add to cart function for frontend

  const diamondPackage = {
    name: "Crown Diamond PACKAGE",
    type: "Diamond",
    membership: 750000,
    cashback: 250000,
    commission: 2000,
  };

  const navigate = useNavigate();

  const HandleItemClick = (productId) => {
    window.location.href = `${
      import.meta.env.VITE_URL
    }/Items?productId=${productId}`;
  };

  const removeFromCart = (productId) => {
    const index = cartItems.findIndex((item) => item._id === productId);
    if (index !== -1) {
      const newCartItems = [...cartItems];
      newCartItems.splice(index, 1);
      setCartItems(newCartItems);
    }
  };
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0).toFixed(2);
  };
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const getImageUrl = (product) => {
    const image = product.images?.[0] || product.imageUrl || null; // Use first image from `images`, or fallback to `imageUrl`

    if (!image) return "/default-product-image.jpg"; // Default image if none found
    if (image.startsWith("http")) return image; // Already full URL
    return `${API_BASE_URL}${image}`; // Prepend base API URL
  };

  const recommendedProducts = [
    {
      id: 1,
      imageUrl: "/uploads/cars1.avif",
      alt: "Product 2",
    },
    {
      id: 2,
      imageUrl: "/uploads/cars2.avif",
      alt: "Product 3",
    },
    {
      id: 3,
      imageUrl: "/uploads/promo1.avif",
      alt: "Product 4",
    },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === recommendedProducts.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [recommendedProducts.length]);

  // Handle dot indicator click
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  const HandlDiamond = () => {
    window.location.href = "./member-registration";
  };
function calculateCommission(productName, reapers) {
  if (!productName || !reapers) return 0;
  
  const reaperStr = reapers.toString();
  let total = 0;

  if (productName.includes("Cnergee 30 Capsules")) {
    if (reaperStr.includes("X1")) total += 3;
    if (reaperStr.includes("X2")) total += 6;
    if (reaperStr.includes("X3")) total += 7;
    if (reaperStr.includes("X5")) total += 9;
  }
  else if (productName.includes("Cnergee 60 Capsules")) {
    if (reaperStr.includes("X1")) total += 10;
    if (reaperStr.includes("X2")) total += 20;
    if (reaperStr.includes("X3")) total += 25;
    if (reaperStr.includes("X5")) total += 30;
  }
  else if (productName.includes("Cnergee 100 Capsules")) {
    if (reaperStr.includes("X1")) total += 20;
    if (reaperStr.includes("X2")) total += 30;
    if (reaperStr.includes("X3")) total += 40;
    if (reaperStr.includes("X5")) total += 50;
  }
  else if (productName.includes("Cnergee 1200 Capsules")) {
    if (reaperStr.includes("X1")) total += 100;
    if (reaperStr.includes("X2")) total += 200;
    if (reaperStr.includes("X3")) total += 300;
    if (reaperStr.includes("X5")) total += 500;
  }

  return total;
}
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-grow pt-16 md:pt-24">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Main Promo */}
              <div className="md:col-span-2 bg-gray-200 rounded p-4 md:p-8 flex flex-col items-center">
                <div className="w-full">
                  <img
                    className="w-full h-auto object-cover rounded"
                    src={
                      import.meta.env.VITE_API_URL + "/uploads/promo_main.avif"
                    }
                    alt="Main promotion"
                  />
                </div>

                {/* Small Promos */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 w-full mt-4 md:mt-6">
                  <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
                    <img
                      className="w-full h-auto"
                      src={
                        import.meta.env.VITE_API_URL + "/uploads/promo1.avif"
                      }
                      alt="Promotion 1"
                    />
                  </div>
                  <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
                    <img
                      className="w-full h-auto"
                      src={
                        import.meta.env.VITE_API_URL + "/uploads/promo2.avif"
                      }
                      alt="Promotion 2"
                    />
                  </div>
                  <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
                    <img
                      className="w-full h-auto"
                      src={
                        import.meta.env.VITE_API_URL + "/uploads/promo3.avif"
                      }
                      alt="Promotion 3"
                    />
                  </div>
                </div>
              </div>

              {/* Side Content */}
              <div className="space-y-4 md:space-y-6 mt-4 md:mt-0">
                <Card
                  onClick={() => onSelect && onSelect(diamondPackage.type)}
                  className="relative transition-all duration-300 cursor-pointer hover:shadow-xl bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 text-white border-0 transform hover:scale-105 shadow-xl ring-2 ring-blue-300"
                >
                  <div className="absolute -top-3 -right-3 bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                    EXCLUSIVE
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIiBvcGFjaXR5PSIwLjIiPjxwYXRoIGQ9Ik0yNSAwIEwzMCAyMCBMNTAgMjUgTDMwIDMwIEwyNSA1MCBMMjAgMzAgTDAgMjUgTDIwIDIwIFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] opacity-50 animate-pulse"></div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-300 transform rotate-45 animate-pulse"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-300 transform rotate-45 animate-pulse"></div>

                  {/* Additional sparkle elements */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-75"></div>
                  <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-150"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-200"></div>
                  <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-white rounded-full animate-ping delay-300 opacity-75"></div>

                  <CardContent
                    onClick={HandlDiamond}
                    className="p-6 relative pt-8"
                  >
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full border-2 border-blue-300 animate-pulse">
                      Ultimate Luxury
                    </div>
                    <div className="mb-4"></div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>
                            <Diamond className="h-6 w-6 text-white relative" />
                            <div className="absolute -top-1 -right-1">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <span className="font-bold text-lg text-white tracking-wide">
                            {diamondPackage.name}
                          </span>
                        </div>
                        <span className="font-bold text-xl text-white">
                          ₱{diamondPackage.membership.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-white/80">
                        Membership Value
                      </div>
                      <div className="border-t border-blue-300/50 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Buy 50 Crown Accounts
                          </span>
                          <span className="font-bold text-lg text-white">
                            ₱{diamondPackage.cashback.toLocaleString()}
                          </span>
                        </div>
                        <span>AND</span>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            Get Indirect Referral Commission
                          </span>
                          <span className="font-bold text-lg text-white">
                            ₱{diamondPackage.commission.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="bg-white rounded p-4 shadow relative">
                  <p className="font-medium text-green-600 mb-2">
                    Recommended Product
                  </p>

                  {/* Slider container */}
                  <div className="relative overflow-hidden h-96 ">
                    <div
                      className="flex transition-transform duration-500 ease-in-out h-full"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {recommendedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="min-w-full h-full flex-shrink-0"
                        >
                          <img
                            className="w-full h-full object-cover rounded"
                            src={
                              import.meta.env.VITE_API_URL + product.imageUrl
                            }
                            alt={product.alt}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {recommendedProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                          currentSlide === index
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search Bar */}
          <section className="container mx-auto px-4 py-4">
            <div className="bg-gray-200 rounded-full py-3 px-6 w-full max-w-3xl mx-auto"></div>
          </section>

          {/* Products Grid */}
<section className="container mx-auto px-4 py-6 md:py-8">
  {loading ? (
    <div className="text-center py-8">Loading products...</div>
  ) : items.length === 0 ? (
    <div className="text-center py-8">No products found</div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((product) => {
        // Determine Golden Seater value (always shown)
        let goldenSeaterValue = 10;
        if (product.name?.includes("Cnergee")) {
          if (product.name.includes("30 Capsules")) goldenSeaterValue = 10;
          else if (product.name.includes("60 Capsules")) goldenSeaterValue = 20;
          else if (product.name.includes("100 Capsules")) goldenSeaterValue = 30;
          else if (product.name.includes("1200 Capsules")) goldenSeaterValue = 250;
        }

        // Default to 0 if member not found or error occurs
        const commission = (!memberData || error) ? 0 : calculateCommission(product.name, Reapers);

        return (
          <div
            key={product._id}
            onClick={() => HandleItemClick(product._id)}
            className="bg-white rounded shadow overflow-hidden flex flex-col h-full cursor-pointer"
          >
            <div className="relative pt-[100%]">
              <img
                src={getImageUrl(product)}
                alt={product.name || 'Product'}
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/api/placeholder/200/150";
                }}
              />
            </div>
            <div className="p-4 bg-green-500 text-white flex-grow">
              <div className="flex justify-between text-xs mb-1">
                <p>Reaper Commission: ₱{commission}</p>
                <p>Golden Seater: {goldenSeaterValue}</p>
              </div>
              <h3 className="font-medium text-sm md:text-base line-clamp-2">
                {product.name}
              </h3>
              <div className="flex justify-between items-center mt-2">
                {product.price ? (
                  <>
                    ₱{" "}
                    {parseFloat(
                      memberData ? product.price : product.price * 2
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </>
                ) : (
                  "Price unavailable"
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>
          {/* Cart Modal */}
          {cartItems.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-full max-w-xs sm:max-w-sm z-50">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold">Shopping Cart</h3>
                <button
                  onClick={() => setCartItems([])}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-64 overflow-auto py-2">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div className="flex-grow pr-2">
                      <div className="flex justify-between text-xs">
                        <p>Reapers 10</p>
                        <p>Golden Seaters 10</p>
                      </div>
                      <p className="font-medium text-sm line-clamp-1">
                        {item.name}{" "}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₱{parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center font-bold">
                  <p>Total:</p>
                  <p>₱{getCartTotal()}</p>
                </div>
                <button className="w-full mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-green-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">WEMULTIPLY</h3>
                <p className="text-sm">
                  Your one-stop shop for all your needs.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Shop</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:underline">
                      All Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Featured
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      New Arrivals
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Discounted
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:underline">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:underline">
                      Terms & Conditions
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Stay Connected</h3>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-gray-200">
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-gray-200">
                    <span className="sr-only">Instagram</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="hover:text-gray-200">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">
                    Subscribe to our newsletter
                  </h4>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="px-4 py-2 w-full rounded-l text-black"
                    />
                    <button className="bg-white text-green-600 px-4 py-2 rounded-r font-medium hover:bg-gray-100">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-green-500 mt-8 pt-8 text-center text-sm">
              <p>© 2025 WEMULTIPLY. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
            <div className="mb-3 flex justify-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              🛒 Item added to cart!
            </p>
            Continue Shopping
          </div>
        </div>
      )}
    </>
  );
};

export default EcommerceShop;
