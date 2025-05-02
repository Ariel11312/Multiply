import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import { checkMember } from "../../middleware/member";
import { HelpCircle, CheckCircle } from "lucide-react";
import Navbar from '../member/Navbar';

const DirectSellingCards = () => {
  const [openModal, setOpenModal] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    checkMember(setMemberData);
  }, []);
  
  const seats = [
    {

      title: "e-Governor",
    },
    {
      title: "e-Mayor",
    },
    {
      title: "e-Captain",
    }
  ];

  const packages = [
    {
      id: 3,
      title: "SUPER DIRECT SELLING",
      subtitle: "Crown Diamond Package",
      price: "750K",
      features: [
        "for every 1 person invited get 250,000 cash",
        "Get 100,00 cash for every crown diamond package, indirect referral",
        "Get 2,000 cash for every crown package indirect referral",
      ],
      getReferralLink: (referralCode) => referralCode
        ? `${import.meta.env.VITE_URL}/referral-verification?referral=${referralCode}&type=Diamond`
        : ""
    },
    {
      id: 1,
      title: "DIRECT SELLING",
      price: "15K",
      features: [
        "for every 1 person invited to get 40 bottle of cnergee or 5,000 cash",
        "Invite 50 persons to get a crown diamond package",
      ],
      getReferralLink: (referralCode) => referralCode
        ? `${import.meta.env.VITE_URL}/referral-verification?referral=${referralCode}&type=Crown`
        : ""
    },
    {
      id: 2,
      title: "7 LEVELS PASSIVE INCOME",
      features: [
        "invite X1, X2, X3, and X5 packages to get 10% commission",
      ],
      subPackages: [
        { name: "X1 Package", price: "1,000" },
        { name: "X2 Package", price: "2,000" },
        { name: "X3 Package", price: "3,000" },
        { name: "X5 Package", price: "5,000" }
      ],
      getReferralLink: (referralCode, subPackage) => referralCode && subPackage
        ? `${import.meta.env.VITE_URL}/referral-verification?referral=${referralCode}&type=PassiveIncome&package=${subPackage}`
        : ""
    },
    {
      id: 4,
      title: "GOLDEN SEATS",
      features: [
        "Avail e-Governor and earn passive income by choosing a region",
        "Avail e-Mayor and make a passive income by choosing a city",
        "Avail e-Captain and make a passive income by choosing a barangay",
      ],
    }
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
  const HandleAvailModal = (seat) => {
    setSelectedSeat(seat);
    window.location.href = "./member"
    localStorage.setItem("seat", JSON.stringify(seat.title));
  };
  
  // Simple component for the Podluck Icon
  const PodluckIcon = ({ availed }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${availed ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500"}`}>
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <>
                  <Navbar />
    <div className="min-h-screen bg-gradient-to-br mt-1 from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-4">4 WAYS TO EARN</h1>
        <p className="text-xl text-center text-green-600 mb-12">Choose Your Package</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
                <h2 className="text-2xl font-bold">{pkg.title}</h2>
                {pkg.subtitle && <p className="text-green-200 mt-1">{pkg.subtitle}</p>}
                {pkg.price && <p className="text-3xl font-bold mt-4">{pkg.price}</p>}
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setOpenModal(pkg.id)}
                  className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Click here
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
          // For 7 LEVELS PASSIVE INCOME with selected subpackage
          referralLink = pkg.getReferralLink ? pkg.getReferralLink(memberData?.referralCode, selectedPackage.name) : null;
        } else if (pkg.getReferralLink) {
          // For other packages with referral links
          referralLink = pkg.getReferralLink(memberData?.referralCode);
        }
        
        return (
          <div
            key={pkg.id}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${openModal === pkg.id ? 'block' : 'hidden'}`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
            <div className="relative bg-white rounded-xl max-w-md w-full mx-auto overflow-hidden shadow-2xl z-10">
              <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
                <h2 className="text-2xl font-bold">{pkg.title}</h2>
                {pkg.subtitle && <p className="text-green-200 mt-1">{pkg.subtitle}</p>}
                {pkg.price && <p className="text-3xl font-bold mt-2">{pkg.price} Package</p>}
                {selectedPackage && <p className="text-2xl font-bold mt-2">{selectedPackage.name} - ₱{selectedPackage.price}</p>}
              </div>
              
              {openModal === pkg.id && pkg.id === 2 && !selectedPackage && (
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Select a Package:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {pkg.subPackages.map((subPkg, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubPackageSelect(subPkg)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-3 px-4 rounded-lg transition duration-200 flex flex-col items-center"
                      >
                        <span className="font-bold">{subPkg.name}</span>
                        <span className="mt-1">₱{subPkg.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {openModal === pkg.id && pkg.id === 4 && (
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-semibold">Golden Seats</div>
                        <button
                          onClick={() => setShowModal(true)}
                          className="text-gray-500 hover:text-gray-700"
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
                          className={`flex items-center mb-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-300 ${
                            !seat.availed ? "opacity-60" : ""
                          }`}
                        >
                          <div className="podluckIcon mr-3">
                            <PodluckIcon availed={seat.availed} />
                          </div>
                          <p className="text-gray-800">{seat.title + " " + (seat.name || "")}</p>
                          {seat.availed && (
                            <div className="ml-auto">
                              <CheckCircle size={16} className="text-green-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {openModal === pkg.id && ((pkg.id === 1 || pkg.id === 3) || (pkg.id === 2 && selectedPackage)) && referralLink && (
                <div className="p-6 flex flex-col items-center">
                  <QRCodeCanvas
                    value={referralLink}
                    size={200}
                    bgColor="transparent"
                    fgColor="#059669"
                    level="H"
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-500 text-center mt-2">Scan this QR code to join</p>
                </div>
              )}

              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Package Includes:</h3>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex space-x-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                  {((pkg.id !== 2) || (pkg.id === 2 && selectedPackage)) && (
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                      Join Now
                    </button>
                  )}
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
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-xl max-w-md w-full mx-auto overflow-hidden shadow-2xl z-10">
            <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white">
              <h2 className="text-2xl font-bold">Golden Seats Information</h2>
            </div>
            <div className="p-6">
              <p className="mb-4">Golden Seats allow you to earn passive income by becoming a digital leader in specific geographic areas.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Become an e-Governor and earn from an entire region</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Become an e-Mayor and earn from a specific city</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Become an e-Captain and earn from a barangay</span>
                </li>
              </ul>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Seat Detail Modal */}
    </div>
</>
  );
};

export default DirectSellingCards;