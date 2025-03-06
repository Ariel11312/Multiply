import React, { useState, useEffect } from 'react';

const EnhancedReferralCard = () => {
  const [copied, setCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [memberDetails, setMemberDetails] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Get the referral code from URL parameters or props
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('referral') || "asdadsadsfhgadsfhadschgasd";
  
  // First API call to get member details based on referral code
   // Fetch Member Details when referralCode changes
  // First useEffect to fetch member details by referral code
useEffect(() => {
    if (referralCode) {
      setLoading(true);
      setError(null); // Reset error state before fetching
      
      fetch(`${import.meta.env.VITE_API_URL}/api/member/memberReferral/${encodeURIComponent(referralCode)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to fetch member details");
          return response.json();
        })
        .then(data => {
          // Check if the response has the expected structure with member object
          if (data.success && data.member) {
            setMemberDetails(data.member);
          } else {
            throw new Error("Invalid member data structure");
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching member details:", error);
          setError("Could not load referral information");
          setLoading(false);
        });
    }
  }, [referralCode]);
  
  // Log memberDetails whenever it updates (for debugging)
  useEffect(() => {
  }, [memberDetails]);
  
  // Fetch User Details when memberDetails is updated with a valid memberID
  useEffect(() => {
    // Make sure memberDetails exists and has a memberID property
    if (memberDetails && memberDetails.memberID) {
      fetch(`${import.meta.env.VITE_API_URL}/api/user/user-details/${memberDetails.memberID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to fetch user details");
          return response.json();
        })
        .then(data => {
          // Check if the response has the expected structure
          if (data.success && data.user) {
            setUserData(data.user);
          } else {
            setUserData(data); // Fallback in case structure is different
          }
        })
        .catch(error => {
          console.error("Error fetching user details:", error);
          setError("Could not load user details");
        });
    }
  }, [memberDetails]);
  
  // Log userData whenever it updates (for debugging)
  useEffect(() => {
  }, [userData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleAccept = () => {
    setAccepted(true);
    localStorage.setItem("referralCode", referralCode);
    window.location.href = "/member-registration";
  };
  
  // If loading or error state
  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 border-2 border-green-500">
      <div className="p-8">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Friend's Referral Code</h2>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded"></div>
          </div>
          
          {/* User Details */}
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {userData ? `${userData?.member?.firstName} ${userData?.member?.lastName}` : 'Juan Dela Cruz'}
            </h3>
            <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-lg p-3 mt-2">
              <span className="text-gray-700 text-sm font-medium">Referral:</span>
              <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">{referralCode}</code>
              <button 
                onClick={copyToClipboard}
                className="ml-2 p-1 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mb-6 w-full bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits:</h4>
            <ul className="text-sm text-gray-600">
              <li className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {memberDetails?.referrerBenefit || "your friend will receive 5% commission on every product you purchase"}
              </li>
              <li className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {memberDetails?.referralBenefit || "Your friend receives 5% commision when you use their referral code"}
              </li>
            </ul>
          </div>
          
          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={accepted}
            className={`w-full py-3 px-4 rounded font-bold text-center text-white transition-colors ${
              accepted 
                ? 'bg-green-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {accepted ? (
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                ACCEPTED
              </div>
            ) : (
              'ACCEPT'
            )}
          </button>
          
          {/* Social Share */}
          <div className="mt-6 flex justify-center">
            <span className="text-xs text-gray-500 mr-2">Share via:</span>
            <div className="flex space-x-2">
              <button className="p-1 bg-green-100 hover:bg-green-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </button>
              <button className="p-1 bg-green-100 hover:bg-green-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>
              <button className="p-1 bg-green-100 hover:bg-green-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReferralCard;