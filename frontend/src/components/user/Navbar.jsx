import React, { useCallback, useEffect, useState } from "react";
import logo from "../../assets/MULTIPLY-1 remove back.png";
import avatar from "../../assets/avatar.png";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Home,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Check,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { checkAuth } from "../../middleware/auth";
import { checkMember } from "../../middleware/member";

// NotificationModal Component
const NotificationModal = ({ 
  isOpen, 
  onClose, 
  notifications = [], 
  markAsRead, 
  clearAllNotifications 
}) => {
    const handleMarkAsRead = async (notificationId,actionUrl) => {
    try {
      await fetch(import.meta.env.VITE_API_URL + `/api/notification/mark-read/${notificationId}`, {
        method: 'PUT',
      });
      if (actionUrl) {
        window.location.href = actionUrl; // Navigate to the action URL if provided
      } else {
        onClose(); // Otherwise, just close the modal
      }
      // Navigate if there's an action URL
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <Check className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const getNotificationBg = (type, isRead) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'success': return 'bg-green-50 border-l-4 border-green-400';
      case 'error': return 'bg-red-50 border-l-4 border-red-400';
      case 'warning': return 'bg-yellow-50 border-l-4 border-yellow-400';
      default: return 'bg-green-50 border-l-4 border-green-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h2 className="text-xl font-bold">Notifications</h2>
          <div className="flex items-center space-x-2">
           
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {(!notifications || notifications.length === 0) ? (
            <div className="p-6 text-center space-y-4">
              <Bell className="h-16 w-16 text-gray-300 mx-auto" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-gray-400 text-sm">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id || notification._id}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${getNotificationBg(notification.type, notification.isRead)}`}
                  onClick={() => handleMarkAsRead(notification.id || notification._id, notification.actionUrl)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CartModal Component
const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  updateQuantityIncrease,
  removeFromCart,
  handleCheckout,
}) => {
  if (!isOpen) return null;

  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-500">Your cart is empty</p>
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400">Add some products to your cart</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-3">
                    {item.image ? (
                      <img
                        src={import.meta.env.VITE_API_URL + item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {item.name || "Unnamed Product"}
                      </h3>
                      <p className="text-green-700 font-bold">
                        ₱ {(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border rounded">
                      <button
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => updateQuantity(item._id, item.cartId)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => updateQuantityIncrease(item._id, item.cartId)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-between font-bold mb-4">
                <span>Total:</span>
                <span>₱ {calculateTotalPrice()}</span>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={handleCheckout} 
                  className="flex-1 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Main Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Data State
  const [memberData, setMemberData] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Control State
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [cartUpdated, setCartUpdated] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth State
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });

  const member = memberData.userType;

const fetchNotifications = useCallback(async () => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/notification/all-notif', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    let notificationList = [];
    if (Array.isArray(data)) {
      notificationList = data;
    } else if (data?.notifications && Array.isArray(data.notifications)) {
      notificationList = data.notifications;
    } else if (data?.data && Array.isArray(data.data)) {
      notificationList = data.data;
    }
    
    // ONLY CHANGE: Sort notifications in descending order (newest first)
    const sortedNotifications = [...notificationList].sort((a, b) => 
      new Date(b.createdAt || b.date || b.timestamp).getTime() - 
      new Date(a.createdAt || a.date || a.timestamp).getTime()
    );
    
    setNotifications(sortedNotifications); // <-- Now sorted
    setUnreadCount(sortedNotifications.filter(n => !n?.isRead).length);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setNotifications([]);
    setUnreadCount(0);
  }
}, []);


  const clearAllNotifications = async () => {
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/notification/clear-all', {
        method: 'DELETE',
        credentials: 'include'
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Cart Functions
  const fetchUserCart = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + `/api/cart/usercart`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
  
      if (!response.ok) {
        setCartQuantity(0);
        setCartItems([]);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart");
      }
      const cartData = await response.json();
      
      const formattedCartItems = cartData.items.map((item) => ({
        _id: item.itemId?._id,
        cartId: cartData._id,
        name: item.name,
        price: item.price,
        image: item.imageUrl,
        quantity: item.quantity,
      }));
      
      setCartQuantity(cartData.items.length);
      setCartItems(formattedCartItems);
      setCartUpdated((prev) => !prev);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error.message);
    }
  };

  const updateQuantity = async (itemId, cartId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/decrease/${itemId}/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setCartUpdated((prev) => !prev);
      return data;
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const updateQuantityIncrease = async (itemId, cartId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/increase/${itemId}/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setCartUpdated((prev) => !prev);
      return data;
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + `/api/cart/items/`+itemId,
        {
          method: 'DELETE',
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        }
      );

      const result = await response.json();
      
      if (response.ok) {
        setCartUpdated((prev) => !prev);
      } else {
        console.error("Failed to remove item:", result);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Navigation Functions
  const getActiveIndex = () => {
    switch (location.pathname) {
      case "/shop":
        return 1;
      case "/member-registration":
        return 2;
      case "/contact-us":
        return 3;
      case "/my-purchase":
        return 4;
      default:
        return 0;
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsProfileMenuOpen(false);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isCheckingAuth: false,
          error: null,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginNav = () => {
    navigate("/login");
  };

  const handleCheckout = () => {
    navigate("/checkout");
    setIsCartOpen(false);
  };

  const active = getActiveIndex();

  // Effects
  useEffect(() => {
    checkAuth(setAuthState);
    checkMember(setMemberData);
  }, []);

  useEffect(() => {
    fetchUserCart();
  }, [cartUpdated]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchNotifications();
    }
  }, [authState.isAuthenticated, fetchNotifications]);

  return (
    <>
      <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={logo}
                className="h-8 sm:h-10 md:h-28 w-auto object-contain transition-all duration-200"
                alt="Logo"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-8">
              <ul className="flex flex-col md:flex-row gap-4 lg:gap-8 text-green-700 font-bold text-sm lg:text-base">
                <li
                  className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                    active === 0 ? "text-red-500" : ""
                  }`}
                  onClick={() => handleNavigation("/")}
                >
                  Home
                </li>
                <li
                  className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                    active === 1 ? "text-red-500" : ""
                  }`}
                  onClick={() => handleNavigation("/shop")}
                >
                  Shop
                </li>

                {member === "Member" ? null : (
                  <li
                    className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                      active === 2 ? "text-red-500" : ""
                    }`}
                    onClick={() => handleNavigation("/member-registration")}
                  >
                    Be a Member?
                  </li>
                )}

                {authState.isAuthenticated && (
                  <li
                    className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                      active === 4 ? "text-red-500" : ""
                    }`}
                    onClick={() => handleNavigation("/my-purchase")}
                  >
                    My Purchase
                  </li>
                )}
              </ul>
            </div>

            {/* Cart and Auth - Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {/* Cart Icon */}
              <div
                className="relative cursor-pointer p-2"
                onClick={() => setIsCartOpen(true)}
              >
                <div className="absolute -top-1 -right-1 transform translate-x-1/4 -translate-y-1/4">
                  <p className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartQuantity}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </div>

              {/* Notification Icon */}
              <div
                className="relative cursor-pointer p-2 group"
                onClick={() => setIsNotificationOpen(true)}
              >
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 transform translate-x-1/4 -translate-y-1/4">
                    <p className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </p>
                  </div>
                )}
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 group-hover:scale-110 group-hover:text-green-500" />
              </div>

              {/* Auth Section */}
              {authState.isAuthenticated ? (
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => setIsProfileMenuOpen(true)}
                  >
                    <img
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover transition-all duration-200"
                      src={authState.user?.profileImage || avatar}
                      alt="User Avatar"
                    />
                    <p className="font-semibold text-xs sm:text-sm">
                      {authState.user?.firstName}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold bg-slate-900 text-white text-xs sm:text-sm transition-all duration-200 hover:bg-slate-800"
                  onClick={loginNav}
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button and cart */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Cart Icon - Mobile */}
              <div
                className="relative cursor-pointer p-2"
                onClick={() => setIsCartOpen(true)}
              >
                <div className="absolute -top-1 -right-1 transform translate-x-1/4 -translate-y-1/4">
                  <p className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    ) || 0}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
              </div>
  <div
                className="relative cursor-pointer p-2 group"
                onClick={() => setIsNotificationOpen(true)}
              >
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 transform translate-x-1/4 -translate-y-1/4">
                    <p className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </p>
                  </div>
                )}
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 group-hover:scale-110 group-hover:text-green-500" />
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 transition-all duration-200"
              >
                {isMenuOpen ? (
                  <X className="block h-5 w-5" />
                ) : (
                  <Menu className="block h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-3 space-y-2 sm:px-6">
            <ul className="flex flex-col md:flex-row gap-4 lg:gap-8 text-green-700 font-bold text-sm lg:text-base px-5">
                <li
                  className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                    active === 0 ? "text-red-500" : ""
                  }`}
                  onClick={() => handleNavigation("/")}
                >
                  Home
                </li>
                <li
                  className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                    active === 1 ? "text-red-500" : ""
                  }`}
                  onClick={() => handleNavigation("/shop")}
                >
                  Shop
                </li>
                <li
                  className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                    active === 4 ? "text-red-500" : ""
                  }`}
                  onClick={() => handleNavigation("/my-purchase")}
                >
                  My Purchase
                </li>
                {member === "Member" ? null : (
                  <li
                    className={`cursor-pointer transition-colors duration-200 hover:text-red-400 ${
                      active === 2 ? "text-red-500" : ""
                    }`}
                    onClick={() => handleNavigation("/member-registration")}
                  >
                    Be a Member?
                  </li>
                )}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {authState.isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2 flex-col">
                      <div className="flex gap-2 px-5">
                        <img
                          className="w-6 h-6 rounded-full object-cover"
                          src={authState.user?.profileImage || avatar}
                          alt="User Avatar"
                        />
                        <p className="font-semibold text-sm">
                          {authState.user?.firstName}
                        </p>
                      </div>
                      {member === "Member" ? (
                        <ul>
                          <li className="group">
                            <a
                              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                              href="/account-settings"
                            >
                              <User className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                              <span>Account Settings</span>
                            </a>
                          </li>
                          <li className="group">
                            <a
                              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                              href="/member"
                            >
                              <Home className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                              <span>Member Home</span>
                            </a>
                          </li>
                          <li className="group">
                            <a
                              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                              href="/member-transactions"
                            >
                              <CreditCard className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                              <span>Transactions</span>
                            </a>
                          </li>

                        </ul>
                      ) : null}
                    </div>
                    <button
                      className="w-full px-4 py-2 rounded-lg font-bold bg-slate-900 text-white text-sm transition-colors duration-200 hover:bg-slate-800"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full px-4 py-2 rounded-lg font-bold bg-slate-900 text-white text-sm transition-colors duration-200 hover:bg-slate-800"
                    onClick={loginNav}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Modal Component */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        updateQuantityIncrease={updateQuantityIncrease}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
      />

      {/* Profile Menu Component */}
      {isProfileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsProfileMenuOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <h2 className="text-xl font-bold">My Profile</h2>
              <button
                onClick={() => setIsProfileMenuOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 border-b space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-400 shadow-md"
                    src={authState.user?.profileImage || avatar}
                    alt="User Avatar"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {authState.user?.firstName} {authState.user?.lastName}
                  </h3>
                  <p className="text-gray-500">{authState.user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-green-600 text-xs font-medium rounded-full">
                    {authState.user?.membershipType || "Standard Member"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Account Options
              </h4>
              <ul className="space-y-2 mb-6">
                <li className="group">
                  <a
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                    onClick={() => handleNavigation("/account-settings")}
                  >
                    <User className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                    <span>Account Settings</span>
                  </a>
                </li>
                <li className="group">
                  <a
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                    onClick={() => handleNavigation("/member")}
                  >
                    <Home className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                    <span>Member Home</span>
                  </a>
                </li>
                <li className="group">
                  <a
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-50 group-hover:text-green-500"
                    onClick={() => handleNavigation("/member-transactions")}
                  >
                    <CreditCard className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
                    <span>Transactions</span>
                  </a>
                </li>
              </ul>
              <button
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-bold bg-green-500 text-white transition-all duration-200 hover:bg-green-600 shadow-sm hover:shadow"
                onClick={() => {
                  handleLogout();
                  setIsProfileMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        // markAsRead={markAsRead}
        clearAllNotifications={clearAllNotifications}
      />      
    </>
  );
};



export default Navbar;