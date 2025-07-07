import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";

const ReferralTreeTable = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferralTree = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + "/api/member/referral-tree",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
  
        if (!response.ok) throw new Error("Failed to fetch");
  
        const data = await response.json();
        setTreeData(data.data.referralTree);
  
        const totalEarnings =
          data.data?.statistics?.totalEarningsWithCommissionAndDirectReferral ||
          "Not available";
        localStorage.setItem("totalEarnings", totalEarnings);
  
        // Function to log referral earnings by level
        function logReferralEarningsByLevel(data) {
          // Initialize an object to store earnings for each level
          const earningsByLevel = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
          };
  
          // Function to recursively traverse the tree
          function traverseTree(node, currentLevel) {
            // Log the current node and level for debugging
  
            // If the level is within our range of interest (1-7)
            if (currentLevel >= 1 && currentLevel <= 7) {
              // Add the direct referral earnings to the appropriate level
              earningsByLevel[currentLevel] +=
                node.statistics.directReferralEarnings || 0;
            }
  
            // Recursively process children
            if (node.children && node.children.length > 0) {
              node.children.forEach((child) => {
                traverseTree(child, currentLevel + 1);
              });
            }
          }
  
          // Start traversing from the referralTree array (level 1)
          if (data.data.referralTree && data.data.referralTree.length > 0) {
            data.data.referralTree.forEach((child) => {
              traverseTree(child, 1);
            });
          }
  
          // Log the results
          for (let level = 1; level <= 7; level++) {
          }
        }
  
        // Call the function with the response data
        logReferralEarningsByLevel(data);
  
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
  
    fetchReferralTree();
  }, []);

  const openModal = (node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedNode(null);
    setIsModalOpen(false);
  };

  // Render tree node with visual styling
  const renderTreeNode = (node, isLast = false, level = 1) => (
    <div key={node.userDetails.id} className="relative">
      {/* Connecting lines */}
      {level > 1 && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute -top-6 left-4 w-px h-6 bg-emerald-300"></div>
          {/* Horizontal line to node */}
          <div className="absolute -top-6 left-4 w-8 h-px bg-emerald-300"></div>
          {/* Vertical continuation line if not last child */}
          {!isLast && (
            <div className="absolute top-0 left-4 w-px h-full bg-emerald-300"></div>
          )}
        </>
      )}
      
      {/* Node card */}
      <div className="ml-8 mb-4">
        <Card
          className="cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-emerald-50"
          onClick={() => openModal(node)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-lg shadow-md">
                  {node.userDetails.firstName.charAt(0).toUpperCase()}
                  {node.userDetails.lastName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* User info */}
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {node.userDetails.firstName.toLowerCase() + " " + node.userDetails.lastName.toLowerCase()}
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500 block">Wallet Balance</span>
                    <span className="font-bold text-emerald-600">
                      {node.statistics.directReferralEarnings || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total Withdraw</span>
                    <span className="font-bold text-gray-700">0</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Commission</span>
                    <span className="font-bold text-emerald-600">
                      {node.statistics.directReferralEarnings || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Level indicator */}
              <div className="flex-shrink-0">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                  Level {level}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render children */}
      {node.children && node.children.length > 0 && (
        <div className="relative">
          {node.children.map((child, index) => 
            renderTreeNode(child, index === node.children.length - 1, level + 1)
          )}
        </div>
      )}
    </div>
  );

  // Render empty slot
  const renderEmptySlot = (level) => (
    <div className="ml-8 mb-4">
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400"></div>
              <span className="text-sm">Empty Slot - Level {level}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render modal tree node
  const renderModalTreeNode = (node, level, isRoot = false) => (
    <div className="relative mb-4">
      <Card className={`border-2 transition-all duration-200 ${
        isRoot 
          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg' 
          : 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-r from-white to-emerald-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg shadow-md ${
                isRoot ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}>
                {node.userDetails.firstName.charAt(0).toUpperCase()}
                {node.userDetails.lastName.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* User info */}
            <div className="flex-grow">
              <h3 className={`font-semibold text-lg ${isRoot ? 'text-emerald-800' : 'text-gray-800'}`}>
                {node.userDetails.firstName.toLowerCase() + " " + node.userDetails.lastName.toLowerCase()}
                {isRoot && <span className="ml-2 text-sm font-normal text-emerald-600">(Root)</span>}
              </h3>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-500 block">Wallet Balance</span>
                  <span className="font-bold text-emerald-600">
                    {node.statistics.directReferralEarnings || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Withdraw</span>
                  <span className="font-bold text-gray-700">0</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Commission</span>
                  <span className="font-bold text-emerald-600">
                    {node.statistics.directReferralEarnings || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Level indicator */}
            <div className="flex-shrink-0">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isRoot 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                Level {level}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render empty slot for modal
  const renderModalEmptySlot = (level) => (
    <div className="mb-4">
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400"></div>
              <span className="text-sm">Empty Slot</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render complete 7-level tree for modal
  const renderCompleteTree = (rootNode) => {
    const levels = [];
    
    // Level 1 - Root node
    levels.push(
      <div key="level-1" className="mb-8">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-emerald-700 mb-2">Level 1 - Root</h3>
          <div className="w-20 h-1 bg-emerald-500 mx-auto rounded"></div>
        </div>
        {renderModalTreeNode(rootNode, 1, true)}
      </div>
    );

    // Function to collect nodes at specific level
    const getNodesAtLevel = (node, targetLevel, currentLevel = 1) => {
      if (currentLevel === targetLevel) {
        return [node];
      }
      
      if (currentLevel < targetLevel && node.children) {
        return node.children.flatMap(child => 
          getNodesAtLevel(child, targetLevel, currentLevel + 1)
        );
      }
      
      return [];
    };

    // Levels 2-7
    for (let level = 2; level <= 7; level++) {
      const nodesAtLevel = getNodesAtLevel(rootNode, level);
      
      levels.push(
        <div key={`level-${level}`} className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-emerald-700 flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                Level {level}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({nodesAtLevel.length} member{nodesAtLevel.length !== 1 ? 's' : ''})
                </span>
              </h3>
            </div>
            <div className="w-16 h-px bg-emerald-300"></div>
          </div>
          
          <div className="grid gap-4">
            {nodesAtLevel.length > 0 ? (
              nodesAtLevel.map((node, index) => (
                <div key={node.userDetails.id} className="relative">
                  {/* Connection line to parent level */}
                  {level > 1 && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-px h-6 bg-emerald-300"></div>
                      <div className="w-8 h-px bg-emerald-300 -mt-px -ml-4"></div>
                    </div>
                  )}
                  {renderModalTreeNode(node, level)}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                {renderModalEmptySlot(level)}
                <p className="text-gray-400 text-sm mt-2">No referrals at this level</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return levels;
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading referral tree...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Referral Tree</h2>
        <p className="text-gray-600">Visual representation of your referral network</p>
      </div>

      {treeData.length === 0 ? (
        <Card className="w-full border-2 border-dashed border-gray-300">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                No Referrals Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start sharing your referral code to build your network and earn commissions from multiple levels
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tree visualization */}
          <div className="space-y-2">
            {treeData.slice(0, 7).map((node, index) => 
              renderTreeNode(node, index === Math.min(treeData.length, 7) - 1, 1)
            )}
          </div>
        </div>
      )}

      {/* Modal for detailed tree view */}
      {isModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xl shadow-lg">
                    {selectedNode.userDetails.firstName.charAt(0).toUpperCase()}
                    {selectedNode.userDetails.lastName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedNode.userDetails.firstName} {selectedNode.userDetails.lastName}
                    </h3>
                    <p className="text-gray-600">Complete Referral Tree (7 Levels)</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-6 bg-gradient-to-b from-emerald-50 to-white">
              {renderCompleteTree(selectedNode)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTreeTable;