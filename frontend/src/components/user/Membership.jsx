import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import MemberCategory from "./MemberCategory";
import axios from "axios";
import termsPdf from '../../assets/Terms-and-Conditions-for-web.pdf';
function generateCustomString() {
  const prefix = "MUL";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}


const Membership = () => {
  // Auth State
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [memberType, setMemberType] = useState("");
  const [addressNo, setAddressNo] = useState("");
  const [paymentType, setPaymentType] = useState("Bank");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionName, setSelectedRegionName] = useState("");
  const [selectedCountry] = useState("Philippines"); // Default country
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedBarangayName, setSelectedBarangayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [searchParams] = useSearchParams();
  const [memberReferralCode, setMemberReferralCode] = useState("");
  const [referredBy, setReferredBy] = useState("");
  useEffect(() => {
    localStorage.removeItem("accepted");
  }, []); // Empty dependency array ensures this runs only on mount
  const referralCode = generateCustomString();
  const memberID = authState.user?._id;
  const date = new Date();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  };
  const [paymentUrl, setPaymentUrl] = useState("");

  let memberAmount = 0;
  let memberDescription = `Membership payment ${memberType} `;

  // Setting amounts based on member type
  if (memberType === "X1") memberAmount = 750;
  if (memberType === "X2") memberAmount = 1500;
  if (memberType === "X3") memberAmount = 4500;
  if (memberType === "X5") memberAmount = 7500;
  if (memberType === "Crown") memberAmount = 15000;
  if (memberType === "Diamond") memberAmount = 750000;
    useEffect(() => {
    const storedType = localStorage.getItem("referralType"); // Get type from localStorage
    
    if (storedType) {
      handlePackageSelect(storedType); // Auto-select if type exists
    }
  }, []);
  const handlePackageSelect = (packageType) => {
    setMemberType(packageType);
    setTimeout(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
            const offset = 210; // Adjust this value for better positioning
            window.scrollTo({
                top: formElement.getBoundingClientRect().top + window.scrollY - offset, 
                behavior: 'smooth'
            });
        }
    }, 100); // Delay to ensure React updates before scrolling
};

  // Create payment function to call backend
//  const createPayment = async () => {
//   if (paymentType === "Gcash") {
//     try {
//       const response = await axios.post(
//         import.meta.env.VITE_API_URL + "/api/paymongo/create-payment",
//         {
//           amount: memberAmount,
//           description: memberDescription,
//           name: "Customer Name", // Optional, add real customer data if needed
//           email: "customer@example.com", // Optional
//           phone: "+639123456789", // Optional - Xendit prefers international format
//         }
//       );

//       if (response.data.success) {
//         const paymentUrl = response.data.checkoutUrl;
//         setPaymentUrl(paymentUrl); // Set the URL to redirect the user to Xendit
        
//         // Optional: Store invoice details for tracking
//         const invoiceId = response.data.invoiceId;
//         const externalId = response.data.externalId;
        
//         // You can store these for later payment verification
//         console.log("Invoice created:", { invoiceId, externalId });
//       } else {
//         setError("Failed to create payment, please try again.");
//       }
//     } catch (error) {
//       if (error.response?.data?.error) {
//         // Handle Xendit-specific errors
//         const xenditError = error.response.data.error;
//         setError(`Payment failed: ${xenditError.message}`);
//       } else {
//         setError("An error occurred while processing the payment.");
//       }
//       console.error("Payment creation error:", error);
//     }
//   }
// };

// // Trigger payment creation when payment type is selected
// if (paymentType === "Gcash") {
//   createPayment();
// }

// Optional: Function to check payment status
// const checkPaymentStatus = async (invoiceId) => {
//   try {
//     const response = await axios.get(
//       import.meta.env.VITE_API_URL + `/api/xendit/payment-status/${invoiceId}`
//     );
    
//     if (response.data.success) {
//       const { status, paidAmount, paymentMethod, paidAt } = response.data;
//       console.log("Payment status:", { status, paidAmount, paymentMethod, paidAt });
      
//       if (status === "PAID") {
//         // Handle successful payment
//         console.log("Payment completed successfully!");
//       } else if (status === "EXPIRED") {
//         // Handle expired payment
//         setError("Payment has expired. Please try again.");
//       }
//     }
//   } catch (error) {
//     console.error("Error checking payment status:", error);
//   }
// }; 

  const memberDate = new Intl.DateTimeFormat("en-US", options).format(date);

  // Auth Check
  const checkAuth = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL+`/api/auth/check-auth`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Authentication failed");
      const data = await response.json();
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        isCheckingAuth: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isCheckingAuth: false,
        error: error.message,
      });
    }
  };

  // Location Data Fetching
  const fetchProvinces = async () => {
    setLoading(true);
    try {
      // Fetch regular provinces
      const response = await fetch("https://psgc.gitlab.io/api/provinces/");
      const provincesData = await response.json();
      
      // Fetch regions to get NCR
      const regionsResponse = await fetch("https://psgc.gitlab.io/api/regions/");
      const regionsData = await regionsResponse.json();
      
      // Store regions data in state
      const regionsMap = regionsData.reduce((acc, region) => {
        acc[region.code] = region.name;
        return acc;
      }, {});
      setRegions(regionsMap);
      
      // Find NCR in regions data
      const ncrRegion = regionsData.find(region => region.code === "130000000");
      
      // Add NCR as a special "province" option
      const allOptions = [
        {
          code: "NCR",
          name: "National Capital Region (NCR)",
          isSpecialRegion: true,
          regionCode: "130000000"
        },
        ...provincesData
      ];
      
      setProvinces(allOptions);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
    setLoading(false);
  };
  
  // Fetch cities based on province or region code
  const fetchCities = async (provinceCode) => {
    setLoading(true);
    try {
      // Get the selected province object
      const selectedProvinceObj = provinces.find(p => p.code === provinceCode);
      
      // Check if this is the special NCR case
      if (selectedProvinceObj && selectedProvinceObj.isSpecialRegion) {
        // Fetch cities directly from the region
        const response = await fetch(
          `https://psgc.gitlab.io/api/regions/${selectedProvinceObj.regionCode}/cities-municipalities/`
        );
        const data = await response.json();
        setCities(data);
      } else {
        // Fetch cities from the province as normal
        const response = await fetch(
          `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`
        );
        const data = await response.json();
        setCities(data);
      }
      // Clear barangays when city selection changes
      setBarangays([]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
    setLoading(false);
  };
  
  // Fetch barangays (works the same for all cities)
  const fetchBarangays = async (cityCode) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`
      );
      const data = await response.json();
      setBarangays(data);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
    setLoading(false);
  };
  
  

  // Event Handlers
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    
    // Find the selected province object
    const selectedProvinceObj = provinces.find((province) => province.code === provinceCode);
  
    const provinceName = selectedProvinceObj ? selectedProvinceObj.name : "";
    const regionCode = selectedProvinceObj ? selectedProvinceObj.regionCode : ""; // Ensure correct property name
    const regionName = regionCode ? regions[regionCode] : "";
  
    setSelectedProvince(provinceCode);
    setSelectedProvinceName(provinceName);
    setSelectedRegion(regionCode);
    setSelectedRegionName(regionName);
    setCities([]);
    setBarangays([]);
    if (provinceCode) fetchCities(provinceCode);
  };
  
  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    const cityName = cities.find((city) => city.code === cityCode)?.name || "";
    setSelectedCity(cityCode);
    setSelectedCityName(cityName);
    setBarangays([]);
    if (cityCode) fetchBarangays(cityCode);
  };

  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    const barangayName =
      barangays.find((barangay) => barangay.code === barangayCode)?.name || "";
    setSelectedBarangay(barangayCode);
    setSelectedBarangayName(barangayName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission immediately

    try {
      // Check if terms and conditions are accepted
      if (!termsAccepted) {
        setError("Please accept the terms and conditions.");
        return;
      }

      setIsLoading(true);
      setError("");

      // Check if the member already exists in the database
      const checkResponse = await fetch(
        import.meta.env.VITE_API_URL+`/api/member/check-member/${memberID}`
      );
      const checkData = await checkResponse.json();

      if (checkData.success && checkData.member) {
        setError("You are already a member.");
        setIsLoading(false);
        return;
      }
      // Prepare membership data for storage
      const membershipData = {
        referralCode,
        memberID,
        memberType,
        addressNo,
        province: selectedProvinceName,
        region: selectedRegionName, // Added region
        country: selectedCountry, // Added country (Philippines)
        city: selectedCityName,
        barangay: selectedBarangayName,
        paymentType,
        referredBy,
        memberDate,
      };

      // Store data in localStorage before redirecting
      localStorage.setItem("membershipData", JSON.stringify(membershipData));

      // Redirect to payment page
       window.location.href = import.meta.env.VITE_URL + `/verify-payment`;
    } catch (error) {
      console.error("Error during submission:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Effects
  useEffect(() => {
    checkAuth();
    fetchProvinces();
  }, []);

  useEffect(() => {
    const code = localStorage.getItem("referralCode");
    ;
    if (code) {
      setMemberReferralCode(code);
      setReferredBy(code);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <MemberCategory 
        onSelectPackage={handlePackageSelect}
        selectedType={memberType}
      />
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Membership Registration
              </h1>
              <p className="text-gray-600 mt-2">
                Please fill in your details below
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Main Form */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Membership Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Membership Type
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value)}
                    required
                  >
                    <option value="">Select Package</option>
                    <option value="X1">X1 Package</option>
                    <option value="X2">X2 Package</option>
                    <option value="X3">X3 Package</option>
                    <option value="X5">X5 Package</option>
                    <option value="Crown">Crown Package</option>
                    <option value="Diamond">Crown Diamond Package</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address No.
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="House/Building Number"
                  onChange={(e) => setAddressNo(e.target.value)}
                  required
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Province
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  City/Municipality
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    value={selectedCity}
                    onChange={handleCityChange}
                    disabled={!selectedProvince || loading}
                    required
                  >
                    <option value="">Select City/Municipality</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Barangay */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Barangay
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    value={selectedBarangay}
                    onChange={handleBarangayChange}
                    disabled={!selectedCity || loading}
                    required
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Payment Type */}


              {/* Referral Code */}
              {!memberReferralCode && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referral Code No.
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter referral code"
                    onChange={(e) => setReferredBy(e.target.value)}
                  />
                </div>
              )}

              {/* Terms and Submit */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-5 w-5 text-green-500 focus:ring-green-500 border-gray-300 rounded"
                    required
                  />
<button
  type="button"
  className="text-green-600 hover:text-green-700 font-medium underline"
  onClick={() => window.open(termsPdf)}
>
  Terms and Conditions
</button>
                </div>

                <button
                  type="submit"
                  disabled={!termsAccepted || isLoading}
                  className={`w-full py-4 px-6 rounded-lg text-white text-lg font-medium transition-all duration-200 relative
                  ${
                    termsAccepted && !isLoading
                      ? "bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                  <Loader2 className="animate-spin w-6 h-6 text-green-500" />
                  <p className="text-gray-700">Loading location data...</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {authState.isAuthenticated && (
              <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700">
                  You are authenticated and ready to proceed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Membership;
