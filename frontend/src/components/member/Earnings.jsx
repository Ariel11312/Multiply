import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { checkMember } from "../../middleware/member";
import {
  HelpCircle,
  CheckCircle,
  Diamond,
  Crown,
  Coins,
  Award,
} from "lucide-react";
import Navbar from "../member/Navbar";
import axios from "axios";

const DirectSellingCards = () => {
  const [openModal, setOpenModal] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
 const [paymentUrl, setPaymentUrl] = useState("");
  useEffect(() => {
    checkMember(setMemberData);
  }, []);

  const seats = [
    {
      title: "e-Governor",
      price: "750,000",
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "e-Mayor",
      price: "250,000",
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "e-Captain",
      price: "25,000",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  // Reordered packages according to requirements
  const packages = [
    // 1. Direct Selling (Gold Design)
    {
      id: 1,
      title: "DIRECT SELLING",
      price: "15,000",
      icon: <Crown className="w-10 h-10 text-yellow-600" />,
      color: "from-yellow-500 to-yellow-300",
      hoverColor: "from-yellow-600 to-yellow-400",
      bgColor: "bg-gradient-to-r from-yellow-500 to-yellow-300",
      borderColor: "border-yellow-400",
      shadowColor: "shadow-yellow-200",
      packageType: "Crown",
      features: [
        "get 5,000 / 40 bottles for every direct referral",
        "get 50 direct referral and become crown diamond",
      ],
      getReferralLink: (referralCode) =>
        referralCode
          ? `${
              import.meta.env.VITE_URL
            }/referral-verification?referral=${referralCode}&type=Crown`
          : "",
    },
    // 2. Super Direct Selling (Blue/Diamond Design)
    {
      id: 3,
      title: "SUPER DIRECT SELLING",
      subtitle: "Crown Diamond Package",
      price: "750,000",
      icon: <Diamond className="w-12 h-12 text-blue-500" />,
      color: "from-blue-500 to-blue-400",
      hoverColor: "from-blue-600 to-blue-500",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-400",
      borderColor: "border-blue-300",
      shadowColor: "shadow-blue-200",
      packageType: "Diamond",
      features: [
        "get 250,000 cash back for every crown diamond",
        "get 100,000 cash back for every crown diamond indirect referral",
        "get 5,000 / 40 bottles for every 15k package",
        "get 2,000 cash back for every crown indirect referral",
      ],
      getReferralLink: (referralCode) =>
        referralCode
          ? `${
              import.meta.env.VITE_URL
            }/referral-verification?referral=${referralCode}&type=Diamond`
          : "",
    },
    // 3. 7 Levels Passive Income
    {
      id: 2,
      title: "7 LEVELS PASSIVE INCOME",
      icon: <Coins className="w-10 h-10 text-green-600" />,
      color: "from-green-600 to-green-400",
      hoverColor: "from-green-700 to-green-500",
      bgColor: "bg-gradient-to-r from-green-600 to-green-400",
      borderColor: "border-green-400",
      shadowColor: "shadow-green-200",
      features: [
        "get 5% commission for every direct referral",
        "every direct referral will be multiplied by 7 reapers",
        "lifetime commissions for every repeat purchases of 7 levels or reapers",
        "golden seaters will earn commission for every repeat purchases",
      ],
      subPackages: [
        { name: "X1", price: "375", packageType: "X1" },
        { name: "X2", price: "750", packageType: "X2" },
        { name: "X3", price: "2250", packageType: "X3" },
        { name: "X5", price: "3750", packageType: "X5" },
      ],
      getReferralLink: (referralCode, subPackage) =>
        referralCode && subPackage
          ? `${
              import.meta.env.VITE_URL
            }/referral-verification?referral=${referralCode}&type=${subPackage}`
          : "",
    },
    // 4. Golden Seats
    {
      id: 4,
      title: "GOLDEN SEATS",
      icon: <Award className="w-10 h-10 text-amber-600" />,
      color: "from-amber-600 to-amber-400",
      hoverColor: "from-amber-700 to-amber-500",
      bgColor: "bg-gradient-to-r from-amber-600 to-amber-400",
      borderColor: "border-amber-400",
      shadowColor: "shadow-amber-200",
      features: [
        "avail GOLDEN SEAT & earn passive income inside your jurisdiction for 7 years",
        "avail e-Governor for 750,000 per seat",
        "avail e-Mayor for 250,000 per seat ",
        "avail e-Captain for 25,000 per seat",
        "earn commission for every bottle sold",
        "get 5% commission for every golden seaters",
        "territorial distibutorship passive income",
      ],
    },
  ];
  const closeModal = () => {
    setOpenModal(null);
    setSelectedPackage(null);
    setShowModal(false);
    setSelectedSeat(null);
  };

  const handleSubPackageSelect = (subPackage) => {
    setSelectedPackage(subPackage);
  };
  const handlePackage = async (name, price) => {
    const packageData = {
      name: name,
      price: price,
    };
    const cleanPrice = price.toString().replace(/,/g, "");
    console.log("Package Data:", cleanPrice);
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/paymongo/create-payment",
        {
          amount: cleanPrice, // Convert to cents
          description: packageData.name,
          name: "Customer Name", // Optional, add real customer data if needed
          email: "customer@example.com", // Optional
          phone: "09123456789", // Optional
        }
      );

      if (response.data.success) {
        setPaymentUrl(response.data.checkoutUrl); // Set the URL to redirect the user to PayMongo
        localStorage.setItem(
          "packages",
          JSON.stringify({
            package: "success1",
            name: packageData.name,
          })
        );
        window.location.href = response.data.checkoutUrl; // Redirect to PayMongo checkout
      } else {

      }
    } catch (error) {
      console.error("Payment creation error:", error);
    }
  };

  const HandleAvailModal = (seat) => {
    setSelectedSeat(seat);
    window.location.href = "./member";
    localStorage.setItem("seat", JSON.stringify(seat.title));
  };

  // Simple component for the Podluck Icon
  const PodluckIcon = ({ availed }) => (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        availed ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500"
      }`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  // Diamond background for the Super Direct Selling card
  const DiamondPattern = () => (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="diamondPattern"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path d="M15 0 L30 15 L15 30 L0 15 Z" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#diamondPattern)" />
      </svg>
    </div>
  );

  // Gold background for Direct Selling card
  const GoldPattern = () => (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="goldPattern"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="10" cy="10" r="5" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#goldPattern)" />
      </svg>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br mt-1 from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-green-800 mb-4">
            4 WAYS TO EARN
          </h1>
          <p className="text-xl text-center text-green-600 mb-12">
            Choose Your Package
          </p>

          {/* First row: Direct Selling and Super Direct Selling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {packages.slice(0, 2).map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl border-2 ${
                  pkg.borderColor
                } shadow-lg overflow-hidden transition-all duration-300 transform ${
                  hoveredCard === pkg.id ? "scale-105 shadow-xl" : ""
                } hover:shadow-2xl relative flex flex-col h-full`} // Changed to flex-col h-full
                onMouseEnter={() => setHoveredCard(pkg.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {pkg.id === 1 && <GoldPattern />}
                {pkg.id === 3 && <DiamondPattern />}
                <div
                  className={`bg-gradient-to-r ${pkg.color} hover:${pkg.hoverColor} p-6 text-white relative overflow-hidden`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{pkg.title}</h2>
                      {pkg.subtitle && (
                        <p className="text-blue-100 mt-1">{pkg.subtitle}</p>
                      )}
                      {pkg.price && (
                        <p className="text-3xl font-bold mt-4">₱{pkg.price}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">{pkg.icon}</div>
                  </div>

                  {pkg.id === 3 && (
                    <div className="absolute -right-4 -top-4 w-24 h-24 rotate-45 bg-blue-800 flex items-end justify-center pb-1">
                      <span className="text-xs font-bold text-white transform -rotate-45">
                        PREMIUM
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow">
                  {" "}
                  {/* Added flex-grow */}
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className={`h-5 w-5 ${
                            pkg.id === 1
                              ? "text-yellow-500"
                              : pkg.id === 3
                              ? "text-blue-500"
                              : "text-green-500"
                          } mr-2 mt-0.5`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  {" "}
                  {/* Added mt-auto and pt-0 */}
                  <button
                    onClick={() => setOpenModal(pkg.id)}
                    className={`w-full bg-gradient-to-r ${pkg.color} hover:${pkg.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:-translate-y-1`}
                  >
                    Click Here
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Second row: 7 Levels Passive Income and Golden Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packages.slice(2, 4).map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl border-2 ${
                  pkg.borderColor
                } shadow-lg overflow-hidden transition-all duration-300 transform ${
                  hoveredCard === pkg.id ? "scale-105 shadow-xl" : ""
                } hover:shadow-2xl flex flex-col h-full`} // Added flex flex-col h-full
                onMouseEnter={() => setHoveredCard(pkg.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`bg-gradient-to-r ${pkg.color} hover:${pkg.hoverColor} p-6 text-white relative`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{pkg.title}</h2>
                      {pkg.subtitle && (
                        <p className="text-green-200 mt-1">{pkg.subtitle}</p>
                      )}
                      {pkg.id === 4 && (
                        <p className="text-lg font-medium mt-2">
                          Territorial Leadership
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">{pkg.icon}</div>
                  </div>
                </div>

                <div className="p-6 flex-grow">
                  {" "}
                  {/* Added flex-grow */}
                  <ul className="space-y-3">
                    {pkg.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className={`h-5 w-5 ${
                            pkg.id === 4 ? "text-amber-500" : "text-green-500"
                          } mr-2 mt-0.5`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pkg.features.length > 4 && (
                      <li className="text-center mt-2">
                        <span className="text-gray-500 text-sm italic">
                          + {pkg.features.length - 4} more benefits
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  {" "}
                  {/* Added mt-auto and pt-0 */}
                  <button
                    onClick={() => setOpenModal(pkg.id)}
                    className={`w-full bg-gradient-to-r ${pkg.color} hover:${pkg.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:-translate-y-1`}
                  >
                    Click Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {packages.map((pkg) => {
          let referralLink = null;
          if (pkg.id === 2 && selectedPackage) {
            referralLink = pkg.getReferralLink
              ? pkg.getReferralLink(
                  memberData?.referralCode,
                  selectedPackage.name
                )
              : null;
          } else if (pkg.getReferralLink) {
            referralLink = pkg.getReferralLink(memberData?.referralCode);
          }

          const isEligibleForPackage =
            (pkg.id === 1 && memberData?.memberType?.includes("Crown")) ||
            (pkg.id === 3 && memberData?.memberType?.includes("Diamond")) ||
            (pkg.id === 2 &&
              ["X1", "X2", "X3", "X5"].some((type) =>
                memberData?.memberType?.includes(type)
              ) &&
              selectedPackage);

          return (
            <div
              key={pkg.id}
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
                openModal === pkg.id ? "block" : "hidden"
              }`}
            >
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={closeModal}
              ></div>
              <div
                className={`relative bg-white rounded-xl max-w-md w-full mx-auto overflow-hidden shadow-2xl z-10 border-2 ${pkg.borderColor}`}
              >
                {/* Header Section */}
                <div className={`${pkg.bgColor} p-6 text-white`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{pkg.title}</h2>
                      {pkg.subtitle && (
                        <p className="text-blue-100 mt-1">{pkg.subtitle}</p>
                      )}
                      {pkg.price && (
                        <p className="text-3xl font-bold mt-2">₱{pkg.price}</p>
                      )}
                      {selectedPackage && (
                        <p className="text-2xl font-bold mt-2">
                          {selectedPackage.name} - ₱{selectedPackage.price}
                        </p>
                      )}
                    </div>
                    <div>{pkg.icon}</div>
                  </div>
                </div>

                {/* Package Selection (for package 2) */}
                {openModal === pkg.id && pkg.id === 2 && !selectedPackage && (
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">
                      Select a Package:
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {pkg.subPackages.map((subPkg, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubPackageSelect(subPkg)}
                          className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center transform hover:scale-105"
                        >
                          <span className="font-bold">{subPkg.name}</span>
                          <span className="mt-1">₱{subPkg.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Golden Seats (for package 4) */}
                {openModal === pkg.id && pkg.id === 4 && (
                  <div className="p-6">
                    <div className="bg-white rounded-lg shadow">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-semibold text-amber-600">
                            Golden Seats
                          </div>
                          <button
                            onClick={() => setShowModal(true)}
                            className="text-amber-500 hover:text-amber-700"
                          >
                            <HelpCircle size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        {seats.map((seat, index) => (
                          <div
                            key={index}
                            onClick={() => HandleAvailModal(seat)}
                            className={`flex items-center mb-3 cursor-pointer p-3 rounded-lg hover:bg-amber-100 border border-transparent hover:border-amber-200 transition-all`}
                          >
                            <div className="mr-3 text-amber-500">
                              {seat.icon}
                            </div>
                            <div>
                              <p className="text-gray-800 font-medium">
                                {seat.title}
                              </p>
                              <p className="text-amber-600 text-sm">
                                ₱{seat.price}
                              </p>
                            </div>
                            {seat.availed && (
                              <div className="ml-auto">
                                <CheckCircle
                                  size={16}
                                  className="text-green-500"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code or Upgrade Message */}
                {openModal === pkg.id && (
                  <div className="p-6 flex flex-col items-center">
                    {isEligibleForPackage && referralLink ? (
                      <div
                        className={`p-4 rounded-lg ${
                          pkg.id === 1
                            ? "bg-yellow-50"
                            : pkg.id === 3
                            ? "bg-blue-50"
                            : "bg-green-50"
                        }`}
                      >
                        <QRCodeCanvas
                          value={referralLink}
                          size={200}
                          bgColor="transparent"
                          fgColor={
                            pkg.id === 1
                              ? "#ca8a04"
                              : pkg.id === 3
                              ? "#3b82f6"
                              : "#059669"
                          }
                          level="H"
                          className="mb-4"
                        />
                        <p className="text-sm text-gray-500 text-center mt-2">
                          Scan this QR code to join
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-red-500 mb-4">
                          You need to upgrade your membership to access this
                          package.
                        </p>
                        {pkg.id !== 2 && (
                          <button
                            onClick={() =>
                              handlePackage(pkg.packageType, pkg.price)
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Avail this Package
                          </button>
                        )}
                        {pkg.id === 2 && (
                          <>
                            <p className="text-sm font-medium text-gray-700 mt-3 mb-2">
                              Choose a sub-package:
                            </p>
                            <div className="space-y-3">
                              {pkg.subPackages.map((subPkg, index) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium text-gray-800">
                                        {subPkg.name}
                                      </span>
                                      <span className="block text-green-600 font-bold">
                                        ₱{subPkg.price}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handlePackage(
                                          subPkg.packageType,
                                          subPkg.price
                                        )
                                      }
                                      className={`px-4 py-2 text-white rounded-md 
                bg-gradient-to-r ${pkg.color} hover:${pkg.hoverColor} 
                transition-all transform hover:scale-105`}
                                    >
                                      Avail
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Package Features */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">
                    Package Includes:
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className={`h-5 w-5 ${
                            pkg.id === 1
                              ? "text-yellow-500"
                              : pkg.id === 3
                              ? "text-blue-500"
                              : pkg.id === 4
                              ? "text-amber-500"
                              : "text-green-500"
                          } mr-2 mt-0.5`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      Close
                    </button>

                    {pkg.id === 2 && selectedPackage && (
                      <button
                        onClick={() => setSelectedPackage(null)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        Back
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Help Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl max-w-md w-full mx-auto overflow-hidden shadow-2xl z-10 border-2 border-amber-300">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <Award className="mr-2" />
                  Golden Seats Information
                </h2>
              </div>
              <div className="p-6">
                <p className="mb-4">
                  Golden Seats allow you to earn passive income by becoming a
                  digital leader in specific geographic areas.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start p-3 bg-amber-50 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">e-Governor (₱750,000)</span>
                      <p className="text-sm text-gray-600">
                        Earn from an entire region
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start p-3 bg-amber-50 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">e-Mayor (₱250,000)</span>
                      <p className="text-sm text-gray-600">
                        Earn from a specific city
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start p-3 bg-amber-50 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">e-Captain (₱25,000)</span>
                      <p className="text-sm text-gray-600">
                        Earn from a barangay
                      </p>
                    </div>
                  </li>
                </ul>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectSellingCards;
