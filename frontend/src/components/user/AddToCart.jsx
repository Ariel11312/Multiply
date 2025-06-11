import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star, Share2, Truck, Check } from 'lucide-react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import { checkAuth } from "../../middleware/auth";

export default function ItemPage() {
  const [item, setItem] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    inStock: false,
    images: [],
    colors: ["Black", "White", "Green"], // Default colors since they're not in your API response
    seller: "AudioTech Store", // Default value since it's not in your API response
    shipping: "Free Shipping", // Default value since it's not in your API response
    rating: 4.7, // Default value since it's not in your API response
    reviewCount: 254, // Default value since it's not in your API response
    originalPrice: 0,
    discount: 0
  });
  const [mainImage, setMainImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });
  
  // Zoom functionality
  const [showZoom, setShowZoom] = useState(false);
  const imageRef = useRef(null);
  const lensRef = useRef(null);
  const resultRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    fetchItems();
    const fetchMemberData = async () => {
      const member = await checkAuth(setAuthState);
      console.log("Member data after fetch:", member);
    };
    fetchMemberData();
  }, []);

  // Traditional image zoom functionality
  useEffect(() => {
    if (showZoom && imageRef.current && lensRef.current && resultRef.current) {
      const img = imageRef.current;
      const lens = lensRef.current;
      const result = resultRef.current;
      
      // Calculate the ratio between result DIV and lens
      const cx = result.offsetWidth / lens.offsetWidth;
      const cy = result.offsetHeight / lens.offsetHeight;
      
      // Set background properties for the result DIV
      if (item.images && item.images.length > 0) {
        result.style.backgroundImage = `url(${import.meta.env.VITE_API_URL + item.images[mainImage]})`;
        result.style.backgroundSize = `${img.offsetWidth * cx}px ${img.offsetHeight * cy}px`;
      }
      
      // Function to handle mouse movement
      const moveLens = (e) => {
        e.preventDefault();
        
        // Get the cursor's position
        const rect = img.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // Adjust for scroll position
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        
        // Calculate lens position
        let lensX = x - (lens.offsetWidth / 2);
        let lensY = y - (lens.offsetHeight / 2);
        
        // Prevent lens from going outside image bounds
        if (lensX > img.offsetWidth - lens.offsetWidth) lensX = img.offsetWidth - lens.offsetWidth;
        if (lensX < 0) lensX = 0;
        if (lensY > img.offsetHeight - lens.offsetHeight) lensY = img.offsetHeight - lens.offsetHeight;
        if (lensY < 0) lensY = 0;
        
        // Set lens position
        lens.style.left = lensX + "px";
        lens.style.top = lensY + "px";
        
        // Set result background position
        result.style.backgroundPosition = `-${lensX * cx}px -${lensY * cy}px`;
      };
      
      // Add event listeners for mouse movement
      img.addEventListener("mousemove", moveLens);
      lens.addEventListener("mousemove", moveLens);
      
      // Cleanup event listeners
      return () => {
        img.removeEventListener("mousemove", moveLens);
        lens.removeEventListener("mousemove", moveLens);
      };
    }
  }, [showZoom, mainImage, item.images]);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId');

  const fetchItems = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL+'/api/item/item/'+productId, {
        method: 'GET',
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("authentication failed");

      const fetchedItem = await response.json();
      setItem(fetchedItem);
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  const handlePrevImage = () => {
    setMainImage(prev => (prev === 0 ? item.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setMainImage(prev => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setMainImage(index);
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  // Check if user is logged in before proceeding
  const checkLoginStatus = () => {
    if (!authState.isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return false;
    }
    return true;
  };
  
  // Add to cart function
  const addToCart = async () => {
    // Check login status first
    if (!checkLoginStatus()) return;
    
    if (!item._id || isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/cart/addcart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemId: item._id, 
          imageUrl: item.images[mainImage],
          quantity: quantity,
          color: selectedColor
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      setShowModal(true); // Show success modal
      setTimeout(() => setShowModal(false), 3000); // Hide after 3 seconds
      
    } catch (error) {
      console.error("Error adding item to cart:", error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const buynow = async () => {
    // Check login status first
    if (!checkLoginStatus()) return;
    
    if (!item._id || isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/cart/addcart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemId: item._id, 
          imageUrl: item.images[mainImage],
          quantity: quantity,
          color: selectedColor
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      setShowModal(true); // Show success modal
      setTimeout(() => setShowModal(false), 3000); // Hide after 3 seconds
      window.location.href = '/checkout'; // Redirect to checkout page
    } catch (error) {
      console.error("Error adding item to cart:", error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle checkout redirect (if you have a separate checkout button)
  const handleCheckout = () => {
    // Check login status first
    if (!checkLoginStatus()) return;
    
    // Proceed to checkout
    window.location.href = '/checkout';
  };

  // Determine if the zoom container should show on the side or below based on screen size
  const getZoomResultPosition = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        // For mobile screens, position below
        return "absolute left-0 top-full mt-4 w-full h-64";
      } else if (window.innerWidth < 1024) {
        // For tablets, position to the right but smaller
        return "absolute right-0 top-0 transform translate-x-full ml-4 w-48 h-48";
      } else {
        // For desktop, position to the right
        return "absolute right-0 top-0 transform translate-x-full ml-4 w-64 h-64";
      }
    }
    return "absolute right-0 top-0 transform translate-x-full ml-4 w-64 h-64";
  };

  // Handle hover events
  const handleMouseEnter = () => {
    setShowZoom(true);
  };
  
  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-2 text-sm text-gray-600 mb-10">
          Home / {item.category} / {item.name}
        </div>

        {/* Product Section */}
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-2/5 p-4">
              <div className="relative">
                {item.images && item.images.length > 0 && (
                  <div className="relative" ref={containerRef}>
                    <div 
                      className="img-zoom-container relative"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <img 
                        ref={imageRef}
                        src={import.meta.env.VITE_API_URL + item.images[mainImage]} 
                        alt={item.name} 
                        className="w-full h-80 rounded-lg object-cover cursor-zoom-in"
                      />
                      
                      {showZoom && (
                        <>
                          {/* Lens */}
                          <div 
                            ref={lensRef}
                            className="absolute border-2 border-green-500 cursor-none z-10"
                            style={{
                              width: "100px",
                              height: "100px",
                              left: "0px",
                              top: "0px"
                            }}
                          ></div>
                          
                          {/* Result Container - Responsive positioning */}
                          <div 
                            ref={resultRef}
                            className={`${getZoomResultPosition()} border-2 border-green-500 z-20 bg-white shadow-xl`}
                            style={{
                              backgroundRepeat: "no-repeat"
                            }}
                          ></div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handlePrevImage} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full shadow-md"
                >
                  <ChevronLeft size={20} className="text-green-700" />
                </button>
                <button 
                  onClick={handleNextImage} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full shadow-md"
                >
                  <ChevronRight size={20} className="text-green-700" />
                </button>
              </div>
              <div className="flex space-x-2 mt-2 overflow-x-auto">
                {item.images && item.images.map((image, index) => (
                  <img 
                    key={index}
                    src={import.meta.env.VITE_API_URL + image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className={`w-16 h-16 object-cover rounded cursor-pointer ${mainImage === index ? 'border-2 border-green-600' : 'border border-gray-300'}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button className="flex items-center text-gray-600 text-sm">
                  <Share2 size={16} className="mr-1" /> Share
                </button>
                <button className="flex items-center text-gray-600 text-sm">
                  <Heart size={16} className="mr-1" /> Add to Wishlist
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-3/5 p-6 border-l border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{item.name}</h1>
                  {/* <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < Math.floor(item.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-yellow-500 ml-1">{item.rating}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="text-gray-500">{item.reviewCount} Reviews</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="text-green-600">Sold 1.2k</span>
                  </div> */}
                </div>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-green-700">
                    ₱ {parseFloat(authState.user ? item.price : item.price * 2).toLocaleString(undefined, {
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2
                    })}
                    {!authState.user && 
                      <span className="text-xs text-red-500 ml-1">(Non-member price)</span>
                    }
                  </span>
                  {item.originalPrice && (
                    <>
                      <span className="text-gray-400 line-through ml-2">₱ {parseFloat(item.originalPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{item.discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4">
                  <div className="flex space-x-2">
                    {item.colors && item.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border ${selectedColor === color 
                          ? 'border-green-700 bg-green-50 text-green-700' 
                          : 'border-gray-300 hover:border-green-500'} rounded-md`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-gray-700 block mb-2">Quantity:</span>
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      className="w-16 py-1 px-2 text-center border-t border-b border-gray-300"
                      readOnly
                    />
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                      disabled={quantity >= 10}
                    >
                      +
                    </button>
                    <span className="ml-4 text-gray-500">
                      {item.inStock ? `Available: In Stock` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                  <button 
                    onClick={addToCart}
                    disabled={isAddingToCart || !item.inStock} 
                    className={`bg-white border-2 border-green-700 text-green-700 hover:bg-green-50 py-3 px-6 rounded-lg font-medium flex-1 flex items-center justify-center
                      ${(isAddingToCart || !item.inStock) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} className="mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button 
                    onClick={buynow}
                    className={`bg-green-700 text-white hover:bg-green-800 py-3 px-6 rounded-lg font-medium flex-1
                      ${!item.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!item.inStock}
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <Truck size={18} className="mr-2" />
                  <span>Shipping: {item.shipping}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="mr-2 w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Sold by: {item.seller}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-lg shadow-md mt-4 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Description</h2>
            <p className="text-gray-700">{item.description}</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center">
          <Check size={20} className="mr-2" />
          <span>Item added to cart successfully!</span>
        </div>
      )}
    </>
  );
}