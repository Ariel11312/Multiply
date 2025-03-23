import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Package, Crown, Diamond } from "lucide-react";

const MemberCategory = ({ onSelectPackage, selectedType }) => {
  const packages = [
    { name: "X1 PACKAGE", type: "X1", membership: 500, bottles: 1 },
    { name: "X2 PACKAGE", type: "X2", membership: 1000, bottles: 2 },
    { name: "X3 PACKAGE", type: "X3", membership: 3000, bottles: 6 },
    { name: "X5 PACKAGE", type: "X5", membership: 5000, bottles: 10 },
    { 
      name: "Crown PACKAGE", 
      type: "Crown", 
      membership: 15000, 
      bottles: 40,
      cashValue: 5000 
    },
    {
      name: "Crown Diamond PACKAGE",
      type: "Diamond",
      membership: 750000,
      bottles: 0,
      cashback: 250000,
      commission: 2000
    },
  ];

  const handleClick = (pkg) => {
    onSelectPackage(pkg.type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-24">
      {packages.map((pkg, index) => {
        const isPremium = pkg.type === "Crown" || pkg.type === "Diamond";
        const isDiamond = pkg.type === "Diamond";
        const isCrown = pkg.type === "Crown";
        
        return (
          <Card
            key={index}
            onClick={() => handleClick(pkg)}
            className={`relative transition-all duration-300 cursor-pointer hover:shadow-xl ${
              selectedType === pkg.type
                ? "bg-green-500 text-white shadow-lg border-green-500"
                : isPremium
                ? isDiamond 
                  ? "bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 text-white border-0" // Blue gradient for Diamond
                  : "bg-gradient-to-br from-yellow-400 to-amber-600 text-white border-0"
                : "bg-white"
            } ${isPremium ? "transform hover:scale-105" : ""} ${isDiamond ? "shadow-xl ring-2 ring-blue-300" : ""}`}
          >
            {isPremium && (
              <div className={`absolute -top-3 -right-3 ${isDiamond ? "bg-blue-700" : "bg-red-500"} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                {isDiamond ? "EXCLUSIVE" : "PREMIUM"}
              </div>
            )}
            {isDiamond && (
              <>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIiBvcGFjaXR5PSIwLjIiPjxwYXRoIGQ9Ik0yNSAwIEwzMCAyMCBMNTAgMjUgTDMwIDMwIEwyNSA1MCBMMjAgMzAgTDAgMjUgTDIwIDIwIFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] opacity-50 animate-pulse"></div>
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-300 transform rotate-45 animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-300 transform rotate-45 animate-pulse"></div>
                
                {/* Additional sparkle elements */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-75"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-150"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-200"></div>
                <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-white rounded-full animate-ping delay-300 opacity-75"></div>
              </>
            )}
            <CardContent className={`p-6 relative ${isDiamond ? "pt-8" : ""}`}>
              {isDiamond && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full border-2 border-blue-300 animate-pulse">
                  Ultimate Luxury
                </div>
              )}
              <div className="mb-4"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {isDiamond ? (
                      <div className="relative">
                        <div className="absolute -inset-1 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>
                        <Diamond className="h-6 w-6 text-white relative" />
                        <div className="absolute -top-1 -right-1">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : pkg.type === "Crown" ? (
                      <Crown className="h-6 w-6 text-white" />
                    ) : (
                      <Package className={`h-5 w-5 ${selectedType === pkg.type ? "text-white" : "text-green-500"}`} />
                    )}
                    <span className={`font-bold text-lg ${isPremium ? "text-white" : ""} ${isDiamond ? "tracking-wide" : ""}`}>{pkg.name}</span>
                  </div>
                  <span className={`font-bold text-xl ${isPremium ? "text-white" : ""} ${isDiamond ? "text-white" : ""}`}>
                    ₱{pkg.membership.toLocaleString()}
                  </span>
                </div>
                <div className={`text-sm ${selectedType === pkg.type || isPremium ? "text-white/80" : "text-gray-600"}`}>
                  Membership Value
                </div>
                <div className={`border-t ${selectedType === pkg.type || isPremium ? isDiamond ? "border-blue-300/50" : "border-white/30" : ""} pt-4`}>
                  {isDiamond ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Cashback</span>
                        <span className="font-bold text-lg text-white">₱{pkg.cashback.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Indirect Referral Commission</span>
                        <span className="font-bold text-lg text-white">₱{pkg.commission.toLocaleString()}</span>
                      </div>
                    </>
                  ) : isCrown ? (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Choose one:</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Bottles</span>
                        <span className="font-bold text-lg">{pkg.bottles}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cash Value</span>
                        <span className="font-bold text-lg">₱{pkg.cashValue.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bottles</span>
                      <span className="font-bold text-lg">{pkg.bottles}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MemberCategory;