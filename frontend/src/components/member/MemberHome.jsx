import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  Copy,
  ArrowUpRight,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Crown,
  Award,
  Trophy,
  Target,
  CheckCircle,
  HelpCircle,
  X,
  Lock,
  Unlock,
} from "lucide-react";

import Navbar from "./Navbar";
import QRCode from "./QRCode";
import { useEffect, useState } from "react";
import { checkMember } from "../../middleware/member";
import { checkMemberTransaction } from "../../middleware/memberTransaction";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { checkAuth } from "../../middleware/auth";
import { fetchReferrals } from "../../middleware/referrals";
import SevenLayer from "./SevenLayer";
import GoldenSeats from "./GoldenSeatsCommision";

// const topProducts = [
//   { id: 1, name: "X1 Package", sales: 150, revenue: 750000 },
//   { id: 2, name: "X2 Package", sales: 120, revenue: 480000 },
//   { id: 3, name: "X3 Package", sales: 90, revenue: 270000 },
//   { id: 4, name: "X5 Package", sales: 90, revenue: 270000 },
// ];

const topReapers = [
  { id: 1, name: "John Doe", referrals: 50, earnings: 250000 },
  { id: 2, name: "Jane Smith", referrals: 45, earnings: 225000 },
  { id: 3, name: "Mike Johnson", referrals: 40, earnings: 200000 },
];

// Custom Podluck Icon component
const PodluckIcon = ({ availed }) => {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-green-500 ${
        availed ? "bg-green-500" : ""
      }`}
    >
      {availed ? (
        <Unlock size={16} className="text-white" />
      ) : (
        <Lock size={16} />
      )}
    </div>
  );
};
const topSowers = [
  { id: 1, name: "Sarah Wilson", referrals: 30, earnings: 150000 },
  { id: 2, name: "Tom Brown", referrals: 28, earnings: 140000 },
  { id: 3, name: "Lisa Davis", referrals: 25, earnings: 125000 },
];

const topOfficials = [
  { id: 1, role: "Senator", name: "James Wilson", supporters: 1200 },
  { id: 2, role: "Governor", name: "Maria Santos", supporters: 800 },
  { id: 3, role: "Mayor", name: "Robert Lee", supporters: 500 },
  { id: 4, role: "Captain", name: "Elena Cruz", supporters: 200 },
];
const quotaLevels = [
  {
    title: "Reaper",
    requirement: "25 referrals",
    icon: "👥",
    className: "bg-yellow-50 border-yellow-200",
  },
  {
    title: "E-Captain / Golden Seater",
    requirement: "₱250,000",
    icon: "👑",
    className: "bg-blue-50 border-blue-200",
  },
  {
    title: "E-Mayor",
    requirement: "₱30,000",
    icon: "🏛️",
    className: "bg-green-50 border-green-200",
  },
  {
    title: "E-Senator",
    requirement: "₱50,000",
    icon: "⭐",
    className: "bg-purple-50 border-purple-200",
  },
  {
    title: "Golden Achievement",
    requirement: "₱150,000",
    icon: "🏆",
    className: "bg-red-50 border-red-200",
  },
];
const Dashboard = () => {
  const referralCode = "MULq0AhCQVlfedGurFM9tQtl";

  const [authState, setAuthState] = useState();
  const [showModal, setShowModal] = useState(false);
  const [availModal, setAvailModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth(setAuthState);
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatFullName = (firstName, lastName) => {
    if (!firstName || !lastName) return "Loading...";
    return (
      firstName.charAt(0).toUpperCase() +
      firstName.slice(1).toLowerCase() +
      " " +
      lastName.charAt(0).toUpperCase() +
      lastName.slice(1).toLowerCase()
    );
  };

  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [memberData, setMemberData] = useState(null);
  const [MemberTransaction, setMemberTransaction] = useState(null);
  const [referralList, setReferralList] = useState([]);
  const [referralStats, setReferralStats] = useState({
    X1: 0,
    X2: 0,
    X3: 0,
    X5: 0,
  });
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatAmount = (amount) => {
    if (amount == null) return "₱ 0.00";
    return `₱ ${isVisible ? amount : "*".repeat(amount.toString().length)}`;
  };

  const handleCopy = () => {
    const referralCode = memberData?.referralCode;
    if (referralCode) {
      navigator.clipboard.writeText(referralCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  const seats = [
    {
      title: "e-Captain",
      availed: memberData?.memberType === "e-Captain" ? true : false, // Set availed to true if memberType is "e-Captain"
      unlockAmount: "25,000",
    },
    {
      title: "e-Mayor",
      availed: memberData?.memberType === "e-Mayor" ? true : false, // Set availed to true if memberType is "e-Mayor"
      unlockAmount: "50,000",
    },
    {
      title: "e-Governor",
      availed: memberData?.memberType === "e-Governor" ? true : false, // Set availed to true if memberType is "e-Governor"
      unlockAmount: "100,000",
    },
    {
      title: "e-Senator",
      availed: memberData?.memberType === "e-Senator" ? true : false, // Set availed to true if memberType is "e-Senator"
      unlockAmount: "200,000",
    },
    {
      title: "e-Vice President",
      availed: memberData?.memberType === "e-Vice President" ? true : false, // Set availed to true if memberType is "e-Vice President"
      unlockAmount: "300,000",
    },
    {
      title: "e-President",
      availed: memberData?.memberType === "e-President" ? true : false, // Set availed to true if memberType is "e-President"
      unlockAmount: "500,000",
    },
  ];

  useEffect(() => {
    checkMember(setMemberData);
    checkMemberTransaction(setMemberTransaction);
    checkAuth(setAuthState);
    fetchReferrals(setReferralList, setReferralStats); // fetch referral data
  }, []);

  const HandleAvailModal = (seat) => {
    setSelectedSeat(seat);
    setAvailModal(true);
  };

  const CreatePayment = async (seat) => {
    setSelectedSeat(seat);
    const amount = parseInt(seat.unlockAmount.toString().replace(/,/g, ""), 10);

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL+"/api/paymongo/create-payment",
        {
          amount: amount,
          description: seat.title,
          name: "Customer Name", // Optional, add real customer data if needed
          email: "customer@example.com", // Optional
          phone: "09123456789", // Optional
        }
      );

      if (response.data.success) {
        setPaymentUrl(response.data.checkoutUrl); // Set the URL to redirect the user to PayMongo
        localStorage.setItem(
          "memberGoldenSeat",
          JSON.stringify({ GoldenSeat: "success", position:selectedSeat.title })
        );
        window.location.href = response.data.checkoutUrl; // Redirect to PayMongo checkout
      } else {
        setError("Failed to create payment, please try again.");
      }
    } catch (error) {
      setError("An error occurred while processing the payment.");
      console.error("Payment creation error:", error);
    }
  };

  const InfoModal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <h3 className="text-xl font-bold mb-4">About Golden Seats</h3>

          <div className="space-y-4">
            <p>
              Golden Seats represent different levels of privileges in the
              Padlock system.
            </p>

            <div className="border-t border-b border-gray-200 py-3">
              <h4 className="font-medium mb-2">Seat Levels:</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">E-President: Unlock for 500,000</span>
                </li>
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">
                    E-Vice President: Unlock for 300,000
                  </span>
                </li>
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">E-Senator: Unlock for 200,000</span>
                </li>
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">E-Governor: Unlock for 100,000</span>
                </li>
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">E-Mayor: Unlock for 50,000</span>
                </li>
                <li className="flex items-center">
                  <PodluckIcon />
                  <span className="ml-2">E-Captain: Unlock for 25,000</span>
                </li>
              </ul>
            </div>

            <p>
              Become a Golden Seater and enjoy passive income from your
              jurisdiction.
            </p>
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="mt-6 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
        {/* Header with improved spacing */}
        <div className="flex flex-col w-full items-center space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm">
              <span className="text-xl font-semibold">
                {getInitials(
                  authState?.user?.firstName + " " + authState?.user?.lastName
                )}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {formatFullName(
                  authState?.user?.firstName,
                  authState?.user?.lastName
                )}
              </h1>
              <div className="flex items-center gap-3">
                {/* Commented code for referral remains the same */}
              </div>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <QRCode />
          </div>
        </div>

        {/* Cards Container with improved spacing */}
        <div className="flex justify-center px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl">
            {/* Stats Card */}
            <Card className="w-full h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">
                  Basic Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <span className="text-sm text-gray-600">Referrals</span>
                    </div>
                    <p className="text-2xl font-bold">{referralList.length}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <span className="text-sm text-gray-600">x1</span>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.X1}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <span className="text-sm text-gray-600">x2</span>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.X2}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <span className="text-sm text-gray-600">x3</span>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.X3}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <span className="text-sm text-gray-600">x5</span>
                    </div>
                    <p className="text-2xl font-bold">{referralStats.X5}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-blue-500" />
                      <span className="text-sm text-gray-600">Reapers</span>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-6 w-6 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        Product Availed
                      </span>
                    </div>
                    <p className="text-2xl font-bold whitespace-nowrap">
                      {memberData?.memberType || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Card */}
            <Card className="w-full h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Wallet
                  </CardTitle>
                  <Button className="bg-green-500 hover:bg-green-600" size="sm">
                    Withdraw
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold">
                        {formatAmount(
                          (MemberTransaction?.totalIncomeToday || 0) +
                            (isNaN(
                              parseFloat(localStorage.getItem("totalEarnings"))
                            )
                              ? 0
                              : parseFloat(
                                  localStorage.getItem("totalEarnings")
                                ))
                        )}
                      </h2>

                      <span className="text-sm text-gray-500">
                        in {MemberTransaction?.numberOfTransactionsToday || 0}{" "}
                        transactions
                      </span>
                      <button
                        onClick={toggleVisibility}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {isVisible ? (
                          <FaEye className="text-xl" />
                        ) : (
                          <FaEyeSlash className="text-xl" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Yesterday</p>
                      <p className="text-lg font-semibold">
                        {formatAmount(MemberTransaction?.totalIncomeYesterday)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-lg font-semibold">
                        {formatAmount(MemberTransaction?.totalIncomeThisMonth)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Referrals & Commissions Earnings
                      </p>
                      <p className="tet-lg font-semibold">
                        {formatAmount(
                          isNaN(
                            parseFloat(localStorage.getItem("totalEarnings"))
                          )
                            ? 0
                            : parseFloat(localStorage.getItem("totalEarnings"))
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <GoldenSeats />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(MemberTransaction?.total || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-semibold">Golden Seats</div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HelpCircle size={20} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {seats.map((seat, index) => (
                  <div
                    key={index}
                    onClick={() => HandleAvailModal(seat)}
                    className={`flex items-center mb-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-300 ${
                      !seat.availed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="podluckIcon mr-3">
                      <PodluckIcon availed={seat.availed} />
                    </div>
                    <p className="text-gray-800">{seat.title}</p>
                    {seat.availed && (
                      <div className="ml-auto">
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <SevenLayer />
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Member Rankings
              </h1>
              <p className="text-gray-500">Track top performers</p>
            </div>

            {/* Rankings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Reapers */}
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <CardTitle>Top Reapers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {topReapers.map((reaper, index) => (
                      <div key={reaper.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{reaper.name}</p>
                            <p className="text-sm text-gray-500">
                              {reaper.referrals} referrals
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ₱{reaper.earnings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Sowers */}
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-purple-500" />
                    <CardTitle>Top Sowers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {topSowers.map((sower, index) => (
                      <div key={sower.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{sower.name}</p>
                            <p className="text-sm text-gray-500">
                              {sower.referrals} referrals
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ₱{sower.earnings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Government Officials Rankings */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-red-500" />
                  <CardTitle>Leading Golden Seaters</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topOfficials.map((official, index) => (
                    <div key={official.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <span className="font-medium">{official.name}</span>
                        <span className="text-gray-600">{official.role}</span>
                        <span className="text-right text-blue-600 font-semibold">
                          {official.supporters.toLocaleString()} supporters
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Podluck Quota Section */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-indigo-500" />
                  <CardTitle>Podluck Achievement Quotas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quotaLevels.map((level, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${level.className} flex items-center gap-3`}
                    >
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {level.title}
                        </h3>
                        <p className="text-gray-600">{level.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products Section
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-500" />
                  <CardTitle>Top Products/Packages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-gray-600">
                          {product.sales} sales
                        </span>
                        <span className="text-green-600 font-semibold">
                          ₱{product.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
      <InfoModal />
      {availModal && selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <h2 className="text-xl font-bold mt-1">
              {selectedSeat
                ? `Golden Seats: ${selectedSeat.title}`
                : "Golden Seats"}
            </h2>

            <div className="space-y-4 mt-4">
              {/* Seat Title with Icon */}
              <div className="flex items-center">
                <PodluckIcon availed={selectedSeat.availed} />
                <span className="ml-2 font-semibold">{selectedSeat.title}</span>
              </div>

              {/* Unlock Price */}
              <p>Unlock this seat for {selectedSeat.unlockAmount} Pesos.</p>

              {/* Benefits Section */}
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">Benefits:</h5>
                <ul className="list-disc pl-5 text-green-800">
                  <li>Passive income from your jurisdiction</li>
                  <li>Commissions for every member availed products</li>
                </ul>
              </div>

              {/* Unlock Button */}
              <button
                onClick={() => CreatePayment(selectedSeat)}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Unlock {selectedSeat.title} Seat
              </button>

              {/* Close Button */}
              <button
                onClick={() => setAvailModal(false)}
                className="absolute top-2 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
