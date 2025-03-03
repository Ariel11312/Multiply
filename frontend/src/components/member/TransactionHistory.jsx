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
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
            >
              <Download size={20} />
            </button>
            <div className="flex gap-2">
              <button onClick={shareData}>
                <Share2 className="text-green-600" size={24} />
              </button>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter className="text-green-600" size={24} />
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
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-start gap-3">
              <div className="bg-green-50 p-2 rounded-lg">
                <Camera size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">₱{transaction.price}</span>
                  <span className="text-gray-400">
                    {transaction.transactionDate}
                  </span>
                </div>
                <span className="text-gray-400 text-sm block">
                  {transaction.user?.firstName} {transaction.user?.lastName}
                </span>
                <span className="text-gray-600 block mt-1">
                  {transaction.productName}
                </span>
                <span className="text-gray-400 text-sm">
                  #{transaction.transactionId}
                </span>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default TransactionHistory;
