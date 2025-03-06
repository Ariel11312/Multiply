import Navigation from "../member/Navbar";

import React, { useEffect, useState } from 'react';

const GoldenSeatsTable = () => {
  const [data, setData] = useState([]);
  const [groupBy, setGroupBy] = useState('none');
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL+'/api/golden/golden-seats')
      .then(response => response.json())
      .then(result => {
        if (result.success && result.members.length > 0) {
          const formattedData = result.members.map(member => ({
            captain: member.captain || 'Not Assigned',
            mayor: member.mayor || 'Not Assigned',
            governor: member.governor || 'Not Assigned',
            senator: member.senator || 'Not Assigned',
            vicePresident: member.vicePresident || 'Not Assigned',
            president: member.President || 'Not Assigned',
            commission: member.commission || 0
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]));
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let processedData = [...data];

    if (filterText) {
      processedData = processedData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    if (sortConfig.key) {
      processedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (groupBy !== 'none') {
      const grouped = processedData.reduce((acc, curr) => {
        const key = curr[groupBy];
        if (!acc[key]) {
          acc[key] = {
            items: [],
            totalCommission: 0
          };
        }
        acc[key].items.push(curr);
        acc[key].totalCommission += Number(curr.commission);
        return acc;
      }, {});

      const groupedArray = Object.entries(grouped).map(([key, value]) => ({
        groupKey: key,
        items: value.items,
        totalCommission: value.totalCommission
      }));

      setGroupedData(groupedArray);
    } else {
      setGroupedData([{ items: processedData, totalCommission: processedData.reduce((sum, item) => sum + Number(item.commission), 0) }]);
    }
  }, [data, filterText, sortConfig, groupBy]);

  return (
   <>
    <Navigation />
    
    <div className="w-full mt-10 max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md border-2 border-green-500">
      <h2 className="text-2xl font-bold text-green-700 mb-6">Golden Seats Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Search Location</label>
          <input
            type="text"
            placeholder="Search by any field..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2 border-2 border-green-200 rounded-md focus:outline-none focus:border-green-500"
            />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-4 py-2 border-2 border-green-200 rounded-md focus:outline-none focus:border-green-500"
            >
            <option value="none">No Grouping</option>
            <option value="captain">Group by Captain</option>
            <option value="mayor">Group by Mayor</option>
            <option value="governor">Group by Governor</option>
            <option value="senator">Group by Senator</option>
            <option value="vicePresident">Group by Vice President</option>
            <option value="president">Group by President</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-green-200 rounded-lg">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-green-50">
            <tr>
              {['Captain', 'Mayor', 'Governor', 'Senator', 'Vice President', 'President', 'Commission'].map((header, index) => (
                <th
                key={index}
                onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                className="px-6 py-4 text-sm font-semibold text-green-700 cursor-pointer hover:bg-green-100 border-b-2 border-green-200"
                >
                  <div className="flex items-center justify-center">
                    {header}
                    {sortConfig.key === header.toLowerCase().replace(' ', '') && (
                      <span className="ml-2">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-100">
            {groupedData.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupBy !== 'none' && (
                  <tr className="bg-green-50">
                    <td colSpan="7" className="px-6 py-4 text-sm font-semibold text-green-700 border-b border-green-200">
                      {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}: {group.groupKey}
                      <span className="ml-4 text-green-600">
                        Total Commission: {group.totalCommission.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )}
                {group.items.map((row, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.captain}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.mayor}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.governor}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.senator}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.vicePresident}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-green-100">{row.president}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600 text-center">{row.commission.toLocaleString()}</td>
                  </tr>
                ))}
                {groupIndex === groupedData.length - 1 && (
                  <tr className="bg-green-50 font-semibold">
                    <td colSpan="6" className="px-6 py-4 text-right text-green-700 border-t-2 border-green-200">Total Commission:</td>
                    <td className="px-6 py-4 text-center text-green-600 border-t-2 border-green-200">
                      {group.totalCommission.toLocaleString()}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
            </>
  );
};

export default GoldenSeatsTable;