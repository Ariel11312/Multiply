import React, { useEffect, useState } from "react";
import Navigation from "../member/Navbar";
import { allUsers } from "../../middleware/user";

const UsersTable = () => {
  const [data, setData] = useState([]); // Ensure data is an empty array by default
  const [initialData, setInitialData] = useState([]); // Store the initial data
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [groupBy, setGroupBy] = useState(null);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'line'

  // Define columns for sorting and grouping options
  const columns = [
    { key: "firstName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "memberType", label: "Member Type" },
    { key: "memberDate", label: "Member Date" },
  ];

  // Search function
  const handleSearch = (value) => {
    setSearch(value);
    if (value === "") {
      setData(initialData); // Reset to the original data
      return;
    }

    if (Array.isArray(initialData)) {
      const filteredData = initialData.filter((item) =>
        Object.values(item).some((val) =>
          val.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setData(filteredData);
    }
  };

  // Sort function
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  // Group function
  const handleGroup = (key) => {
    if (key === groupBy) {
      setGroupBy(null);
      setData(initialData);
      return;
    }

    setGroupBy(key);
    const grouped = {};
    initialData.forEach((item) => {
      const groupValue = item[key];
      if (!grouped[groupValue]) {
        grouped[groupValue] = [];
      }
      grouped[groupValue].push(item);
    });

    const groupedData = Object.entries(grouped).flatMap(
      ([groupValue, items]) => [
        { isGroupHeader: true, value: groupValue, key },
        ...items,
      ]
    );

    setData(groupedData);
  };

  // Fetch users on component mount
  useEffect(() => {
    allUsers((fetchedData) => {
      setInitialData(fetchedData); // Set the fetched data as the initial data
      setData(fetchedData); // Set the initial data for the table
    });
  }, []);

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) =>
        item.isGroupHeader ? (
          <div
            key={`group-${item.value}`}
            className="col-span-full bg-green-100 p-4 rounded-lg font-bold text-green-800"
          >
            {item.key}: {item.value}
          </div>
        ) : (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors"
          >
            <div className="space-y-2">
              {/* Full Name */}
              <div>
                <span className="font-bold text-green-700">Full Name: </span>
                <span>{item.firstName + " " + item.lastName}</span>
              </div>

              {/* Email */}
              <div>
                <span className="font-bold text-green-700">Email: </span>
                <span>{item.email}</span>
              </div>

              {/* Member Type and Member Date */}
              {item.memberDetails && item.memberDetails.length > 0 && (
                <>
                  <div>
                    <span className="font-bold text-green-700">
                      Member Type:{" "}
                    </span>
                    <span>{item.memberDetails[0].memberType}</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-700">
                      Member Date:{" "}
                    </span>
                    <span>{item.memberDetails[0].memberDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );

  // Line View Component
  const LineView = () => (
    <div className="space-y-4">
      {data.map((item) =>
        item.isGroupHeader ? (
          <div
            key={`group-${item.value}`}
            className="bg-green-100 p-4 rounded-lg font-bold text-green-800"
          >
            {item.key}: {item.value}
          </div>
        ) : (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg border-l-4 border-green-500 hover:border-green-600 transition-colors shadow-sm"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Full Name */}
              <div>
                <span className="font-bold text-green-700">Full Name: </span>
                <span>{item.firstName + " " + item.lastName}</span>
              </div>

              {/* Email */}
              <div>
                <span className="font-bold text-green-700">Email: </span>
                <span>{item.email}</span>
              </div>

              {/* Member Type */}
              <div>
                <span className="font-bold text-green-700">Member Type: </span>
                <span>
                  {item.memberDetails
                    ? item.memberDetails[0].memberType
                    : "N/A"}
                </span>
              </div>

              {/* Member Date */}
              <div>
                <span className="font-bold text-green-700">Member Date: </span>
                <span>
                  {item.memberDetails
                    ? item.memberDetails[0].memberDate
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto mt-10">
        <div className="mb-6 space-y-4 px-2">
          <h1 className="text-2xl font-bold text-center md:text-start text-green-800">
            Users Information
          </h1>

          {/* Controls Section */}
          <div className="flex flex-wrap gap-4">
            {/* View Toggle Buttons */}
            <div className="flex rounded-lg overflow-hidden border-2 border-green-600">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 ${
                  viewMode === "grid"
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("line")}
                className={`px-4 py-2 ${
                  viewMode === "line"
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 hover:bg-green-50"
                }`}
              >
                Line View
              </button>
            </div>
            {/* Sort Button and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Sort By ↓
              </button>
              {showSortOptions && (
                <div className="absolute mt-2 w-48 bg-white border border-green-200 rounded-lg shadow-lg z-10">
                  {columns.map((column) => (
                    <button
                      key={column.key}
                      onClick={() => {
                        handleSort(column.key);
                        setShowSortOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span className="ml-2">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Group Button and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowGroupOptions(!showGroupOptions)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Group By ↓
              </button>
              {showGroupOptions && (
                <div className="absolute mt-2 w-48 bg-white border border-green-200 rounded-lg shadow-lg z-10">
                  {columns.map((column) => (
                    <button
                      key={column.key}
                      onClick={() => {
                        handleGroup(column.key);
                        setShowGroupOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-green-50"
                    >
                      {column.label}
                      {groupBy === column.key && " ✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-grow px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Showing {data.filter((item) => !item.isGroupHeader).length} Results
        </div>

        {/* Table Data */}
        {viewMode === "grid" ? <GridView /> : <LineView />}
      </div>
    </div>
  );
};

export default UsersTable;
