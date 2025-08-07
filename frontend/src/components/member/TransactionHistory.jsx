import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Camera,
  Share2,
  SlidersHorizontal,
  Menu,
  Download,
  Calendar,
  Filter,
  X,
  BarChart3,
  TrendingUp,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import Navigation from "../member/Navbar";
import { checkTransaction } from "../../middleware/transaction";

const TransactionHistory = () => {
  // States for data and filters
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedSalesperson, setSelectedSalesperson] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Colors for charts
  const CHART_COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#FCD34D', '#F59E0B', '#D97706'];

  // Calculate statistics from transactions
  const statistics = useMemo(() => {
    if (!transactions.length) return null;

    // Daily transaction amounts
    const dailyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transactionDate).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      acc[date].amount += transaction.price;
      acc[date].count += 1;
      return acc;
    }, {});

    const dailyChart = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days

    // Product distribution
    const productData = transactions.reduce((acc, transaction) => {
      const product = transaction.productName || 'Unknown';
      if (!acc[product]) {
        acc[product] = { name: product, value: 0, count: 0 };
      }
      acc[product].value += transaction.price;
      acc[product].count += 1;
      return acc;
    }, {});

    const productChart = Object.values(productData);

    // Monthly trends
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 };
      }
      acc[month].amount += transaction.price;
      acc[month].count += 1;
      return acc;
    }, {});

    const monthlyChart = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'));

    // Summary stats
    const totalAmount = transactions.reduce((sum, t) => sum + t.price, 0);
    const avgAmount = totalAmount / transactions.length;
    const highestTransaction = Math.max(...transactions.map(t => t.price));
    const claimedCount = transactions.filter(t => t.claimStatus === 'claimed').length;

    return {
      dailyChart,
      productChart,
      monthlyChart,
      summary: {
        totalAmount,
        avgAmount,
        highestTransaction,
        totalTransactions: transactions.length,
        claimedCount,
        pendingCount: transactions.length - claimedCount
      }
    };
  }, [transactions]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClaimClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
    setUpdateStatus(null);
  };

  const handleOptionSelect = async (option) => {
    setIsUpdating(true);
    
    const updateData = {
      transactionId: selectedTransaction.transactionId,
      claimOption: option,
      amount: option === "5000 pesos" ? 5000 : 0,
      claimStatus: "claimed",
      claimDate: new Date().toISOString()
    };
    
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/trans/transaction/claim",
        {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Update successful:", result);
      
      setUpdateStatus({
        success: true,
        message: `Successfully claimed ${option} for transaction #${selectedTransaction.transactionId}`,
      });
      
      setTransactions(prev => prev.map(t => 
        t.transactionId === selectedTransaction.transactionId 
          ? { ...t, claimStatus: "claimed", claimOption: option }
          : t
      ));
      
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (error) {
      console.error("Error updating transaction:", error);
      setUpdateStatus({
        success: false,
        message: `Failed to claim reward: ${error.message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch transactions with limit and sorting - Remove the slice(0, 10) to get all data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const fetchedTransactions = await checkTransaction(setTransactions);
        
        if (fetchedTransactions) {
          const sortedTransactions = fetchedTransactions
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
          
          setTransactions(sortedTransactions);
          setFilteredTransactions(sortedTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Filter functionality
  useEffect(() => {
    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.transactionDate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.transactionId?.toString().includes(searchQuery)
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate >= new Date(dateRange.start) &&
          transactionDate <= new Date(dateRange.end)
        );
      });
    }

    if (selectedSalesperson !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.by === selectedSalesperson
      );
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((transaction) => {
        const amount = transaction.price;
        const minCheck = priceRange.min ? amount >= Number(priceRange.min) : true;
        const maxCheck = priceRange.max ? amount <= Number(priceRange.max) : true;
        return minCheck && maxCheck;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchQuery, dateRange, selectedSalesperson, priceRange, transactions]);

  // Export functionality
  const exportData = (format) => {
    const data = filteredTransactions;

    if (format === "csv") {
      const headers = [
        "ID",
        "Amount",
        "TransactionDate",
        "Items",
        "Salesperson",
      ];
      const csvData = data.map(
        (t) =>
          `${t.transactionId},${t.price},${t.transactionDate},"${
            t.productName
          }","${t.user?.firstName || ""} ${t.user?.lastName || ""}"`
      );
      const csv = [headers.join(","), ...csvData].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  // Share functionality
  const shareData = async () => {
    try {
      await navigator.share({
        title: "Transaction History",
        text: `${filteredTransactions.length} transactions shared`,
        url: window.location.href,
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  // Statistics Cards Component
  const StatisticsCards = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">₱{statistics.summary.totalAmount.toLocaleString()}</div>
          <div className="text-green-100">Total Amount</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{statistics.summary.totalTransactions}</div>
          <div className="text-blue-100">Total Transactions</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">₱{Math.round(statistics.summary.avgAmount).toLocaleString()}</div>
          <div className="text-purple-100">Average Amount</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{statistics.summary.claimedCount}</div>
          <div className="text-orange-100">Claimed Rewards</div>
        </div>
      </div>
    );
  };

  // Charts Component
  const ChartsSection = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Transactions Chart */}
        <div className="bg-white p-6 rounded-lg border border-green-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Daily Transaction Amounts (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={statistics.dailyChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Distribution Chart */}
        <div className="bg-white p-6 rounded-lg border border-green-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="text-green-600" size={20} />
            Product Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart
              data={statistics.productChart}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {statistics.productChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
              <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Total Amount']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends Chart */}
        {statistics.monthlyChart.length > 1 && (
          <div className="bg-white p-6 rounded-lg border border-green-500 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="text-green-600" size={20} />
              Monthly Transaction Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'amount' ? `₱${value.toLocaleString()}` : value,
                  name === 'amount' ? 'Total Amount' : 'Transaction Count'
                ]} />
                <Legend />
                <Bar dataKey="amount" fill="#10B981" name="amount" />
                <Bar dataKey="count" fill="#059669" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-green-100">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm border rounded-md ${
                page === currentPage
                  ? 'bg-green-600 text-white border-green-600'
                  : page === '...'
                  ? 'border-transparent cursor-default'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Filter panel component
  const FilterPanel = ({ isMobile = false }) => (
    <div className={`${isMobile ? "p-4" : "p-6"} space-y-4`}>
      <div>
        <label className="block text-sm font-medium mb-2">Date Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      {/* Mobile Layout */}
      <div className="lg:hidden w-full bg-white border border-green-500">
        <div className="p-4 border-b border-green-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center justify-center w-10 h-10 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <BarChart3 size={20} />
              </button>
              <button
                onClick={() => exportData("csv")}
                className="flex items-center justify-center w-10 h-10 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={shareData}
                className="flex items-center justify-center w-10 h-10 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center w-10 h-10 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {showStats && (
            <div className="mb-4">
              <StatisticsCards />
              <ChartsSection />
            </div>
          )}

          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {isFilterOpen && <FilterPanel isMobile={true} />}
        </div>

        {/* Mobile transaction cards with pagination */}
        <div className="space-y-4 p-4">
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction) => (
              <div 
                key={transaction.transactionId} 
                className="flex items-center gap-3 bg-white shadow-sm rounded-lg p-3 border border-gray-100"
              >
                <div className="bg-green-50 p-2 rounded-lg">
                  <Camera size={20} className="text-green-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-green-700">₱{transaction.price}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {transaction.productName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {transaction.user?.firstName} {transaction.user?.lastName}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    #{transaction.transactionId}
                  </div>
                  {transaction.productName === "Crown Referral Bonus" &&
                    transaction.claimStatus !== "claimed" && (
                      <button
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                        onClick={() => handleClaimClick(transaction)}
                      >
                        Claim Bonus
                      </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No transactions found
            </div>
          )}
        </div>

        {/* Mobile Pagination */}
        <Pagination />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto p-6">
          {/* Statistics Dashboard */}
          <StatisticsCards />
          <ChartsSection />

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-3">
              <div className="bg-white p-4 rounded-lg border border-green-500">
                <h2 className="font-semibold mb-4">Filters</h2>
                <FilterPanel />
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <div className="bg-white rounded-lg border border-green-500">
                <div className="p-4 border-b border-green-100">
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-semibold">Transactions (Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length})</h1>
                    <div className="flex gap-4">
                      <button
                        onClick={() => exportData("csv")}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Download size={20} />
                        Export
                      </button>
                      <button
                        onClick={shareData}
                        className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Share2 size={20} />
                        Share
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search transactions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Table with horizontal scroll */}
                <div className="overflow-x-auto">
                  <div className="p-4 min-w-[800px]"> {/* Minimum width ensures horizontal scroll when needed */}
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left pb-3 whitespace-nowrap">Transaction</th>
                          <th className="text-left pb-3 whitespace-nowrap">Items</th>
                          <th className="text-left pb-3 whitespace-nowrap">Amount</th>
                          <th className="text-left pb-3 whitespace-nowrap">Date</th>
                          <th className="text-left pb-3 whitespace-nowrap">ID</th>
                          <th className="text-left pb-3 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTransactions.map((transaction) => (
                          <tr
                            key={transaction.transactionId}
                            className="hover:bg-green-50"
                          >
                            <td className="py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <Camera size={20} className="text-green-600" />
                                </div>
                                <span className="min-w-0">
                                  {transaction.user?.firstName}{" "}
                                  {transaction.user?.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="max-w-[200px] truncate" title={transaction.productName}>
                                {transaction.productName}
                              </div>
                            </td>
                            <td className="py-3 whitespace-nowrap">₱{transaction.price}</td>
                            <td className="py-3 whitespace-nowrap">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-gray-400 whitespace-nowrap">
                              #{transaction.transactionId}
                            </td>
                            <td className="py-3 whitespace-nowrap">
                              {transaction.productName === "Crown Referral Bonus" &&
                                transaction.claimStatus !== "claimed" && (
                                  <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                                    onClick={() => handleClaimClick(transaction)}
                                  >
                                    Claim
                                  </button>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Desktop Pagination */}
                <Pagination />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Choose Your Reward</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUpdating}
              >
                <X size={24} />
              </button>
            </div>

            {updateStatus ? (
              <div
                className={`p-4 mb-4 rounded-lg ${
                  updateStatus.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {updateStatus.message}
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Select one of the following options to claim your
                  Crown Referral Bonus:
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => handleOptionSelect("5000 pesos")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex justify-center items-center"
                    disabled={isUpdating}
                  >
                    <span>₱5,000 Cash</span>
                  </button>

                  <button
                    onClick={() => handleOptionSelect("40 bottles")}
                    className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-lg"
                    disabled={isUpdating}
                  >
                    40 Bottles of Crown
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Your selection is final and cannot be changed later.
                </p>
              </>
            )}

            {isUpdating && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;