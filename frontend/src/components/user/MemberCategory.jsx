import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Package } from "lucide-react";

const MemberCategory = ({ onSelectPackage, selectedType }) => {
  const packages = [
    { name: "X1 PACKAGE", type: "X1", membership: 500, bottles: 1 },
    { name: "X2 PACKAGE", type: "X2", membership: 1000, bottles: 2 },
    { name: "X3 PACKAGE", type: "X3", membership: 3000, bottles: 6 },
    { name: "X5 PACKAGE", type: "X5", membership: 5000, bottles: 10 },
  ];

  const handleClick = (pkg) => {
    onSelectPackage(pkg.type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 pt-24">
      {packages.map((pkg, index) => (
        <Card
          key={index}
          onClick={() => handleClick(pkg)}
          className={`relative transition-all duration-200 cursor-pointer hover:shadow-md ${
            selectedType === pkg.type 
              ? "bg-green-500 text-white shadow-lg border-green-500" 
              : "bg-white"
          }`}
        >
          <CardContent className="p-6">
            <div className="mb-4"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Package className={`h-5 w-5 ${selectedType === pkg.type ? "text-white" : "text-green-500"}`} />
                  <span className="font-bold text-lg">{pkg.name}</span>
                </div>
                <span className="font-bold text-xl">
                  ₱{pkg.membership.toLocaleString()}
                </span>
              </div>
              <div className={`text-sm ${selectedType === pkg.type ? "text-white/80" : "text-gray-600"}`}>
                Membership Value
              </div>
              <div className={`border-t ${selectedType === pkg.type ? "border-white/30" : ""} pt-4`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Bottles</span>
                  <span className="font-bold text-lg">{pkg.bottles}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MemberCategory;