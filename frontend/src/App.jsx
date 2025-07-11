import React, { useEffect, useState } from "react";
import "./index.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/user/Home";
import Dashboard from "./components/admin/Dashboard";
import MemberHome from "./components/member/MemberHome";
import Verification from "./Verification";
import Membership from "./components/user/Membership";
import { checkAuth } from "./middleware/auth";
import ItemsPage from "./components/member/MemberItem";
import TransactionsHistory from "./components/member/TransactionHistory";
import UserInformation from "./components/admin/UserInformation";
import InventoryRankings from "./components/admin/Inventory";
import PaymentStatus from "./components/user/PaymentStatus";
import GoldenSeatsTable from "./components/admin/GoldenSeatsTable";
import GoldenSeats from "./components/member/GoldenSeatsCommision";
import EcommerceShop from "./components/user/Shop";
import ReferralCode from "./components/user/ReferralCode";
import Seatlist from "./components/member/SeatList";
import AddToCart from "./components/user/AddToCart";
import CheckOut from "./components/user/CheckOut";
import PurchaseHistory from "./components/user/PurchaseHistory";
import Earnings from "./components/member/Earnings";
import AccountSettings from "./components/user/AccountSettings";
import Tracker from "./components/admin/Tracker";
import WithdrawPage from "./components/member/Withdraw";
import VPCommissionPage from "./components/admin/VPCommission";
const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    userType: null,
    error: null,
  });

  // Public Route Component (redirects if already authenticated)
  const PublicRoute = ({ children }) => {
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    if (authState.isCheckingAuth) {
      return <div>Loading...</div>;
    }

    if (authState.isAuthenticated) {
      return <Navigate to={from} replace />;
    }

    return children;
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();

    if (authState.isCheckingAuth) {
      return <div>Loading...</div>;
    }

    if (!authState.isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Case-insensitive role check with detailed logging
    if (allowedRoles.length > 0) {
      const roleMatch = allowedRoles.some(
        (role) =>
          role.toLowerCase() === (authState.userType || "").toLowerCase()
      );

      if (!roleMatch) {
        console.error("Role mismatch", {
          allowedRoles,
          currentUserType: authState.userType,
        });
        return <Navigate to="/" replace />;
      }
    }

    return children;
  };

  // Combined authentication and member check
  useEffect(() => {
    const fetchAuthAndMemberData = async () => {
      try {
        // First, check authentication
        await checkAuth((authResult) => {
          setAuthState((prev) => ({
            ...prev,
            ...authResult,
            isCheckingAuth: true,
          }));
        });

        // Then fetch member data
        const response = await fetch(
          import.meta.env.VITE_API_URL+`/api/auth/check-member`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAuthState((prev) => ({
            ...prev,
            userType: data.user.userType,
            isCheckingAuth: false,
          }));
        } else {
          setAuthState((prev) => ({
            ...prev,
            isCheckingAuth: false,
          }));
        }
      } catch (error) {
        console.error("Authentication/Member check error:", error);
        setAuthState((prev) => ({
          ...prev,
          isCheckingAuth: false,
        }));
      }
    };

    fetchAuthAndMemberData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login
                onLoginSuccess={(user) => {
                  setAuthState({
                    isAuthenticated: true,
                    user,
                    isCheckingAuth: false,
                    userType: user.userType,
                    error: null,
                  });
                }}
              />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

<Route
          path="/seatlist"
          element={
              <Seatlist />
          }
        />
        <Route path="/member-registration" element={<Membership />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/verify-payment" element={<PaymentStatus />} />
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<AddToCart />} />
        <Route path="/shop" element={<EcommerceShop />} />

        <Route
          path="/verification"
          element={
            <PublicRoute>
              <Verification />
            </PublicRoute>
          }
        />
        <Route
          path="/referral-verification"
          element={

              <ReferralCode />
          }
        />
        <Route
          path="/checkout"
          element={<CheckOut />}
        />
        <Route
          path="/my-purchase"
          element={<PurchaseHistory />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tracker"
          element={
              <Tracker />

          }
        />

        <Route path="/admin/user-information" element={<UserInformation />} />
        <Route path="/admin/inventory" element={<InventoryRankings />} />

        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={["Member"]}>
              <MemberHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute allowedRoles={["Member"]}>
              <Earnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute allowedRoles={["Member"]}>
              <WithdrawPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comission"
          element={
            <ProtectedRoute allowedRoles={["Member"]}>
              <GoldenSeats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/items" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ItemsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/golden-seats"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <GoldenSeatsTable />
            </ProtectedRoute>
          }

        />
        <Route
          path="/admin/vp-commission"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <VPCommissionPage />
            </ProtectedRoute>
          }

        />


        <Route
          path="/member-transactions"
          element={
            <ProtectedRoute allowedRoles={["Member"]}>
              <TransactionsHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
