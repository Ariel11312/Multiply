import React, { useState } from "react";
import logo from "../../assets/MULTIPLY-1 remove back.png";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Settings,
  Home,
  Package,
  Users,
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Package, label: "Transactions", path: "/member-transactions " },
    { icon: Users, label: "4 Ways To Earn", path: "/earnings" },
  ];
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
        window.location.href= "/";
        setAuthState({
          isAuthenticated: false,
          user: null,
          isCheckingAuth: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
   
   
   <>
      {/* Main Navigation */}
      <nav className="bg-emerald-600 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="text-white font-bold text-xl"><img src={logo} alt=""                 className="h-24 sm:h-10 md:h-28 w-auto object-contain transition-all duration-200" /></div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Bell className="h-6 w-6 text-white cursor-pointer hover:text-emerald-200 transition-colors" />
              <User className="h-6 w-6 text-white cursor-pointer hover:text-emerald-200 transition-colors" onClick={() => setIsOpen(true)} />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(true)}
                className="text-white p-2 rounded-md hover:bg-emerald-700 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="py-4">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              ))}

              <div className="border-t my-4" />

              <a
                href="/account-settings"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </a>

              <button
                onClick={() => {
                  // Handle logout
                  setIsOpen(false);
                handleLogout()
                }}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                <LogOut className="h-5 w-5 mr-3"/>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navigation;
