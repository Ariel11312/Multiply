import React, { useEffect, useState } from "react";
import Navbar from "../user/Navbar";
import { fetchItems } from "../../middleware/shopItems";

const EcommerceShop = () => {
  const [cartItems, setCartItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    // Call the fetch function when component mounts
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

  // Add to cart function for frontend
  const addToCart = async (itemId, quantity = 1, userId) => {
    try {
      // Show loading state if needed
      setLoading(true);

      // API call to add item to cart
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/cart/addcart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId,
            itemId,
            quantity,
          }),
        }
      );
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      // Parse the successful response
      const updatedCart = await response.json();

      // Update local cart state
      setCart(updatedCart);

      // Update cart item count for UI badge/indicator
      setCartItemCount(
        updatedCart.items.reduce((total, item) => total + item.quantity, 0)
      );

      // Show success message
      setNotification({
        type: "success",
        message: "Item added to cart successfully!",
      });

      return updatedCart;
    } catch (error) {
      // Handle and display error
      console.error("Add to cart error:", error);
      setNotification({
        type: "error",
        message: error.message || "Failed to add item to cart",
      });
      throw error;
    } finally {
      // Clear loading state
      setLoading(false);
    }
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
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/default-product-image.jpg"; // Default image if none provided
    if (imageUrl.startsWith("http")) return imageUrl; // If URL is already a full URL, return as is
    return `${API_BASE_URL}${imageUrl}`; // If it's a relative path, prepend the base API URL
  };
  const recommendedProducts = [
    {
      id: 1,
      imageUrl: "/uploads/product1.png",
      alt: "Product 2"
    },
    {
      id: 2,
      imageUrl: "/uploads/product3.png",
      alt: "Product 3"
    },
    {
      id: 3,
      imageUrl: "/uploads/product4.png",
      alt: "Product 4"
    }
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === recommendedProducts.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [recommendedProducts.length]);
  
  // Handle dot indicator click
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  

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
            src={import.meta.env.VITE_API_URL + "/uploads/promo_main.png"}
            alt="Main promotion"
          />
        </div>
        
        {/* Small Promos */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 w-full mt-4 md:mt-6">
          <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
            <img
              className="w-full h-auto"
              src={import.meta.env.VITE_API_URL + "/uploads/subpromo1.png"}
              alt="Promotion 1"
            />
          </div>
          <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
            <img
              className="w-full h-auto"
              src={import.meta.env.VITE_API_URL + "/uploads/subpromo2.png"}
              alt="Promotion 2"
            />
          </div>
          <div className="bg-gray-200 rounded p-2 flex items-center justify-center">
            <img
              className="w-full h-auto"
              src={import.meta.env.VITE_API_URL + "/uploads/subpromo3.png"}
              alt="Promotion 3"
            />
          </div>
        </div>
      </div>

      {/* Side Content */}
      <div className="space-y-4 md:space-y-6 mt-4 md:mt-0">
        <div className="bg-green-500 rounded p-4 text-white">
          <p className="font-medium mb-2">Previous Product</p>
          <img
            className="w-full h-96 bg-white"
            src={import.meta.env.VITE_API_URL + "/uploads/product2.png"}
            alt="Feature promotion"
          />
        </div>
        <div className="bg-white rounded p-4 shadow relative">
      <p className="font-medium text-green-600 mb-2">Recommended Product</p>
      
      {/* Slider container */}
      <div className="relative overflow-hidden h-96">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {recommendedProducts.map((product) => (
            <div key={product.id} className="min-w-full h-full flex-shrink-0">
              <img
                className="w-full h-full object-cover rounded"
                src={import.meta.env.VITE_API_URL + product.imageUrl}
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
              currentSlide === index ? 'bg-green-500' : 'bg-gray-300'
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
    ) : error ? (
      <div className="text-center py-8 text-red-500">
        Error loading products: {error}
      </div>
    ) : items.length === 0 ? (
      <div className="text-center py-8">No products found</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded shadow overflow-hidden flex flex-col h-full"
          >
            <div className="relative pt-[100%]">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/api/placeholder/200/150";
                }}
              />
            </div>
            <div className="p-4 bg-green-500 text-white flex-grow">
              <div className="flex justify-between text-xs mb-1">
                <p>Reaper 10</p>
                <p>Golden Seater 10</p>
              </div>
              <h3 className="font-medium text-sm md:text-base line-clamp-2">{product.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="font-bold">₱ {parseFloat(product.price).toFixed(2)}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
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
    </>
  );
};

export default EcommerceShop;
