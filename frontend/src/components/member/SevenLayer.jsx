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
            console.log(`Level ${currentLevel} Node:`, node);
  
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
            console.log(`Level ${level} Direct Referral Earnings: ${earningsByLevel[level]}`);
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
  }, []);  const openModal = (node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedNode(null);
    setIsModalOpen(false);
  };

  // Render referral card for level 1 (to click)
  const renderReferralCard = (node) => (
    <Card
      key={node.userDetails.id}
      className="mb-2 cursor-pointer border border-emerald-200 hover:border-emerald-300 hover:bg-gray-50"
      onClick={() => openModal(node)}
    >
      <div className="flex text-center items-center justify-between p-3">
       <table className="w-full h-full">
        <thead className="">
<tr className="text-lg">

          <th>Name</th>
          <th>Total Withdraw</th>
          <th>Current Wallet Balance</th>
          <th>Overall Commission</th>
</tr>
        </thead>
        <tbody className="text-md font-bold text-green-500">
          <tr>
          <td> {node.userDetails.firstName.toLowerCase() + " " + node.userDetails.lastName.toLowerCase()} </td>          
         <td>0</td>
         <td>{node.statistics.directReferralEarnings}</td>
         <td>{node.statistics.directReferralEarnings}</td>
          </tr>
        </tbody>
       </table>
      
      
      </div>
    </Card>
  );

  // Render each level with "Empty Slot" if no data
  const renderLevelWithEmptySlots = (children, level = 1) => {
    if (!children || children.length === 0) {
      return (
        <div className="border border-dashed border-gray-400 p-3 text-center text-sm text-gray-500">
          Empty Slot
        </div>
      );
    }

    return children.map((node) => (
      <div key={node.userDetails.id}>
        {renderReferralCard(node)} {/* Display the referral card */}
      </div>
    ));
  };

  // Render full referral tree (levels 2 to 7) in the modal
  const renderFullReferralTree = (node) => {
    const maxLevels = 7;
    let nodes = [node]; // Initialize nodes with the clicked node

    const levels = [];
    for (let level = 2; level <= maxLevels; level++) { // Start from level 2
      const children = nodes[level - 2]?.children || [];
      levels.push(
        <div key={level} className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-blue-600">
            Level {level}
          </h3>
          <div className="space-y-2">
            {renderLevelWithEmptySlots(children, level)}
          </div>
        </div>
      );
      nodes.push(...children); // Move to the next level's children
    }

    return levels;
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-6 text-xl font-bold">Referral List</h2>

      {treeData.length === 0 ? (
        <Card className="w-full">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">
                No Referrals Found
              </h3>
              <p className="text-gray-500">
                Start sharing your referral code to earn commissions
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Display only level 1 here */}
          {treeData.slice(0, 7).map((node) => renderReferralCard(node))} {/* Display first 7 referral cards */}
        </div>
      )}

      {/* Modal for full referral tree */}
      {isModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-[90%] max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                  {selectedNode.userDetails.firstName.charAt(0).toUpperCase()}
                  {selectedNode.userDetails.lastName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold">
                  {selectedNode.userDetails.firstName}{" "}
                  {selectedNode.userDetails.lastName}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Render the full referral tree with levels 2 to 7 */}
            <h4 className="mb-4 text-lg font-medium">Referral Tree</h4>
            {renderFullReferralTree(selectedNode)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTreeTable;
