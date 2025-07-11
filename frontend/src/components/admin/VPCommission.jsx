import React, { useState } from 'react';
import { Users, DollarSign, Church, Award, Calculator } from 'lucide-react';
import Navbar from '../member/Navbar';

export default function VPCommissionPage() {
  const [totalAmount, setTotalAmount] = useState(10000);
  
  const distributions = [
    {
      category: "We Multiply",
      percentage: 40,
      amount: (totalAmount * 0.40).toFixed(2),
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      category: "Christian Viceo",
      percentage: 30,
      amount: (totalAmount * 0.30).toFixed(2),
      icon: <Award className="w-6 h-6" />,
      color: "bg-green-500"
    },
    {
      category: "Team Leaders",
      percentage: 15,
      amount: (totalAmount * 0.15).toFixed(2),
      icon: <Users className="w-6 h-6" />,
      color: "bg-purple-500",
      breakdown: [
        { name: "Anthony", share: (totalAmount * 0.15 / 4).toFixed(2) },
        { name: "Donald", share: (totalAmount * 0.15 / 4).toFixed(2) },
        { name: "Lee", share: (totalAmount * 0.15 / 4).toFixed(2) },
        { name: "Bastes", share: (totalAmount * 0.15 / 4).toFixed(2) }
      ]
    },
    {
      category: "First 200 Registered",
      percentage: 5,
      amount: (totalAmount * 0.05).toFixed(2),
      icon: <Users className="w-6 h-6" />,
      color: "bg-orange-500"
    },
    {
      category: "Tithes, Offering & Church",
      percentage: 10,
      amount: (totalAmount * 0.10).toFixed(2),
      icon: <Church className="w-6 h-6" />,
      color: "bg-indigo-500"
    }
  ];

  return (
    <>
    <Navbar></Navbar>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Vice President Commission Distribution
          </h1>
          <p className="text-slate-600 text-lg">
            Transparent breakdown of commission allocations
          </p>
        </div>

        {/* Total Amount Calculator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Calculator className="w-8 h-8 text-blue-500" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Commission Amount
              </label>
              <input
                readOnly={true}
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder="Enter amount"
                />
            </div>
          </div>
        </div>

        {/* Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {distributions.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`${item.color} p-4 text-white`}>
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <div>
                    <h3 className="text-lg font-semibold">{item.category}</h3>
                    <p className="text-sm opacity-90">{item.percentage}% of total</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-slate-800 mb-2">
                  ₱{item.amount}
                </div>
                {item.breakdown && (
                    <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-slate-600">Individual Shares:</p>
                    {item.breakdown.map((person, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-b-0">
                        <span className="text-sm text-slate-700">{person.name}</span>
                        <span className="text-sm font-semibold text-slate-800">₱{person.share}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-slate-800 text-white p-6">
            <h2 className="text-2xl font-bold text-center">Distribution Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-700">Percentage</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {distributions.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="font-medium text-slate-800">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      ₱{item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-6 py-4 font-bold text-slate-800">Total</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">100%</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 text-lg">
                    ₱{totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
                </>
  );
}