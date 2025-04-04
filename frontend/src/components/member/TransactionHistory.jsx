import React, { useState, useEffect } from "react";
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
} from "lucide-react";
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

  const handleClaimClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
    };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const handleOptionSelect = async (option) => {
    // Set loading state
    setIsUpdating(true);

    // Determine the value to update based on selection
    const updateData = {
      transactionId: selectedTransaction.transactionId,
      claimOption: option,
      // Set amount based on selected option
      amount: option === "5000 pesos" ? 5000 : "40 bottles",
    };

    try {
      // Make the PUT request to your API
      const response = await fetch(
        `/api/trans/transaction/${selectedTransaction.transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for authentication
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      const result = await response.json();
      console.log("Update successful:", result);
      window.location.href ="./member-transactions"
      // Set success status
      setUpdateStatus({
        success: true,
        message: `Successfully claimed ${option} for transaction #${selectedTransaction.transactionId}`,
      });

      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseModal();
        // Optionally refresh the transaction list here
        // refreshTransactions();
      }, 2000);
    } catch (error) {
      console.error("Error updating transaction:", error);

      // Set error status
      setUpdateStatus({
        success: false,
        message: `Failed to claim reward: ${error.message}`,
      });

      // Don't close the modal on error
      setIsUpdating(false);
    }
  };
  // Mock data - In real app, this would come from an API
  useEffect(() => {
    // Define an async function to handle the transaction check and state updates
    const fetchTransactions = async () => {
      const fetchedTransactions = await checkTransaction(setTransactions);

      // If the fetched transactions exist, update both states
      if (fetchedTransactions) {
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);
      }
    };

    fetchTransactions();
  }, []); // The empty dependency array ensures this runs only once on component mount

  // Filter functionality
  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.productName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.transactionDate
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.transactionId.includes(searchQuery)
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate >= new Date(dateRange.start) &&
          transactionDate <= new Date(dateRange.end)
        );
      });
    }

    // Salesperson filter
    if (selectedSalesperson !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.by === selectedSalesperson
      );
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((transaction) => {
        const amount = transaction.price;
        const minCheck = priceRange.min
          ? amount >= Number(priceRange.min)
          : true;
        const maxCheck = priceRange.max
          ? amount <= Number(priceRange.max)
          : true;
        return minCheck && maxCheck;
      });
    }

    setFilteredTransactions(filtered);
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
          }","${t.user.firstName + " " + t.user.lastName}"`
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

      {/* <div>
        <label className="block text-sm font-medium mb-2">Salesperson</label>
        <select
          value={selectedSalesperson}
          onChange={(e) => setSelectedSalesperson(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="all">All Salespersons</option>
          <option value="Christian Albert Viceo">Christian Albert Viceo</option>
          <option value="Maria Santos">Maria Santos</option>
          <option value="John Smith">John Smith</option>
        </select>
      </div> */}
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

  <div className="space-y-4 p-4">
    {filteredTransactions.length > 0 ? (
      filteredTransactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center gap-3 bg-white shadow-sm rounded-lg p-3 border border-gray-100"
        >
          <div className="bg-green-50 p-2 rounded-lg">
            <Camera size={20} className="text-green-600" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-green-700">₱{transaction.price}</span>
              <span className="text-xs text-gray-400">
                {transaction.transactionDate}
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
</div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto p-6">
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
                    <h1 className="text-xl font-semibold">Transactions</h1>
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

                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-3">Transaction</th>
                        <th className="text-left pb-3">Items</th>
                        <th className="text-left pb-3">Amount</th>
                        <th className="text-left pb-3">Date</th>
                        <th className="text-left pb-3">ID</th>
                        <th className="text-left pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.transactionId}
                          className="hover:bg-green-50"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-50 p-2 rounded-lg">
                                <Camera size={20} className="text-green-600" />
                              </div>
                              <span>
                                {transaction.user?.firstName}{" "}
                                {transaction.user?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">{transaction.productName}</td>
                          <td className="py-3">₱{transaction.price}</td>
                          <td className="py-3">
                            {transaction.transactionDate}
                          </td>
                          <td className="py-3 text-gray-400">
                            #{transaction.transactionId}
                          </td>
                          <td className="py-3">
                            {transaction.productName ===
                              "Crown Referral Bonus" &&
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
            </div>
          </div>
        </div>
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Choose Your Reward
        </h2>
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
            Your selection is final and cannot be changed
            later.
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
