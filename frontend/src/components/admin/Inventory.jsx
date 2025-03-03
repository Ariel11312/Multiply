import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Package, Users, Crown, Award, Trophy } from "lucide-react";
import Navigation from "../member/Navbar";

const InventoryRankings = () => {
  // Sample data - replace with actual data
  const topProducts = [
    { id: 1, name: "X1 Package", sales: 150, revenue: 750000 },
    { id: 2, name: "X2 Package", sales: 120, revenue: 480000 },
    { id: 3, name: "X3 Package", sales: 90, revenue: 270000 },
    { id: 4, name: "X5 Package", sales: 90, revenue: 270000 },
  ];

  const topReapers = [
    { id: 1, name: "John Doe", referrals: 50, earnings: 250000 },
    { id: 2, name: "Jane Smith", referrals: 45, earnings: 225000 },
    { id: 3, name: "Mike Johnson", referrals: 40, earnings: 200000 },
  ];

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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Inventory & Rankings
            </h1>
            <p className="text-gray-500">
              Track top performers and product performance
            </p>
          </div>

          {/* Top Products Section */}
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
          </Card>

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
    </>
  );
};

export default InventoryRankings;
