import React, { useState, useRef, useEffect } from 'react';
import { Package, MapPin, Clock, CheckCircle, Truck, User, Phone, Mail, Edit3, Eye, X, QrCode, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const DeliveryTracker = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const printRef = useRef(null);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-green-100 text-green-800 border-green-200',
    shipped: 'bg-green-100 text-green-800 border-green-200',
    'out-for-delivery': 'bg-orange-100 text-orange-800 border-orange-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    'out-for-delivery': MapPin,
    delivered: CheckCircle,
    cancelled: X
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(import.meta.env.VITE_API_URL +'/api/order/all-orders');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched orders:', data);
        
        // Transform API data to match component structure if needed
        const transformedOrders = data.map(order => ({
          id: order._id || order.id,
          customerName: order.name || 'N/A',
          customerEmail: order.email || 'N/A',
          customerPhone: order.phone || 'N/A',
          // Handle order items - get first item or create summary
          item: order.orderItems && order.orderItems.length > 0 
            ? order.orderItems.length === 1 
              ? order.orderItems[0].name 
              : `${order.orderItems.length} items`
            : 'No items',
          quantity: order.orderItems ? order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
          price: order.orderItems ? order.orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) : 0,
          status: order.status || 'pending',
          address: `${order.address} || ${order.barangay || ''} ${order.city || ''} ${order.province || ''}`.trim() || 'N/A',
          orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          trackingNumber: order.trackingNumber || 'Pending',
          courierService: order.courierService || 'TBD',
          paymentMethod: order.paymentMethod || 'N/A',
          region: order.region || 'N/A'
        }));
        
        setOrders(transformedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    fetch(import.meta.env.VITE_API_URL + `/api/order/update-order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })  
  };

  const openQRModal = (order) => {
    setSelectedOrder(order);
    setShowQRModal(true);
  };

  const openPrintModal = (order) => {
    setSelectedOrder(order);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    // Ensure the print ref exists
    if (!printRef.current) {
      console.error("Print content not found");
      return;
    }

    // Create a clone of the printable content
    const printContent = printRef.current.cloneNode(true);
    
    // Convert any canvas elements to images
    const canvases = printContent.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas) {
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.width = `${canvas.width}px`;
        img.style.height = `${canvas.height}px`;
        canvas.parentNode.replaceChild(img, canvas);
      }
    });

    // Create a print window
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WeMultiply Sticker Print</title>
        <style>
          /* WeMultiply sticker styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            margin: 5mm;
            size: 100mm 150mm; /* Standard sticker size */
          }

          body {
            font-family: 'Arial', sans-serif;
            font-size: 9px;
            line-height: 1.2;
            color: #333;
            background: #fff;
            width: 90mm;
            max-width: 90mm;
            margin: 0 auto;
          }

          /* Sticker container */
          .sticker-container {
            width: 90mm;
            min-height: 140mm;
            border: 2px dashed #ee4d2d;
            border-radius: 8px;
            padding: 8px;
            background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
            position: relative;
            overflow: hidden;
          }

          /* Header - compact WeMultiply branding */
          .sticker-header {
            background: linear-gradient(45deg, #ee4d2d, #ff6b35);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 6px;
            box-shadow: 0 1px 3px rgba(238, 77, 45, 0.3);
          }

          .sticker-header .logo {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          }

          .sticker-header .tagline {
            font-size: 6px;
            opacity: 0.9;
            margin-top: 1px;
          }

          /* Content sections - ultra compact */
          .sticker-section {
            margin-bottom: 5px;
            padding: 3px 5px;
            background: rgba(238, 77, 45, 0.05);
            border-radius: 3px;
            border-left: 2px solid #ee4d2d;
          }

          .sticker-section h3 {
            color: #ee4d2d;
            font-size: 8px;
            font-weight: 700;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .sticker-section p {
            font-size: 7px;
            line-height: 1.3;
            margin-bottom: 2px;
          }

          /* QR Code area */
          .qr-section {
            text-align: center;
            background: white;
            padding: 4px;
            border-radius: 4px;
            border: 1px solid #ee4d2d;
            margin: 5px 0;
          }

          .qr-placeholder {
            width: 100px;
            height: 60px;          border: 1px dashed #ccc;
            margin: 0 auto 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            color: #999;
            border-radius: 2px;
          }

          /* Tables - mini format */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6px;
            margin: 3px 0;
          }

          th, td {
            padding: 2px 3px;
            border: 1px solid #ddd;
            text-align: left;
          }

          th {
            background: #ee4d2d;
            color: white;
            font-weight: 600;
            font-size: 6px;
          }

          tr:nth-child(even) {
            background: #fafafa;
          }

          /* Info badges */
          .info-badge {
            display: inline-block;
            background: #ffc107;
            color: #333;
            padding: 1px 4px;
            border-radius: 8px;
            font-size: 6px;
            font-weight: 600;
            margin: 1px;
          }

          .success-badge {
            background: #28a745;
            color: white;
          }

          .priority-badge {
            background: #dc3545;
            color: white;
          }


          /* Footer - minimal */
          .sticker-footer {
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            font-size: 5px;
            color: #999;
            width: 100%;
          }

          .timestamp {
            color: #ee4d2d;
            font-weight: 600;
          }

          /* Icons using CSS */
          .icon {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 2px;
            vertical-align: middle;
          }

          .icon-box::before {
            content: "📦";
            font-size: 6px;
          }

          .icon-location::before {
            content: "📍";
            font-size: 6px;
          }

          .icon-phone::before {
            content: "📞";
            font-size: 6px;
          }

          /* Print optimizations */
          @media print {
            body {
              font-size: 8px;
            }
            
            .sticker-container {
              border: 1px solid #ccc;
              break-inside: avoid;
            }
            
            @page {
              margin: 3mm;
            }
          }

          /* Compact utilities */
          .text-tiny { font-size: 5px; }
          .text-bold { font-weight: 700; }
          .text-center { text-align: center; }
          .mb-2 { margin-bottom: 2px; }
          .mt-2 { margin-top: 2px; }
          
          /* WeMultiply decorative elements */
          .corner-decoration {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            background: #ee4d2d;
            border-radius: 50%;
            opacity: 0.3;
          }

          .side-stripe {
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(180deg, #ee4d2d, #ff6b35);
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="sticker-container">
          <div class="corner-decoration"></div>
          <div class="side-stripe"></div>
          
          <div class="sticker-header">
            <div class="logo">WeMultiply</div>
            <div class="tagline">Fast • Reliable • Secure</div>
          </div>

          
          <div class="sticker-content" style="max-height: 80mm; overflow: hidden;">
            ${printContent.innerHTML}
          </div>
          
          
          <div class="sticker-footer">
            <div class="timestamp">${new Date().toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div class="text-tiny">wemultiplyapp.com</div>
          </div>
        </div>
        
        <script>
          // Auto-print when page loads
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
          
          window.onafterprint = function() {
            setTimeout(() => {
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'price') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Filter orders based on search term and status filter
  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.courierService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      'out-for-delivery': 0,
      delivered: 0,
      cancelled: 0
    };
    
    orders.forEach(order => {
      counts[order.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  const PrintableReceipt = ({ order }) => {
    const qrData = JSON.stringify({
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      status: order.status,
      customer: order.customerName,
      item: order.item,
      viewUrl: `https://delivery-tracker.com/track/${order.id}`
    });

    return (
      <div ref={printRef} className="bg-white p-8 max-w-md mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">DELIVERY RECEIPT</h1>
          <p className="text-sm text-gray-600">FastShip Express</p>
          <p className="text-xs text-gray-500">Track your package anywhere, anytime</p>
        </div>

        {/* Order Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">ORDER DETAILS</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Number:</span>
              <span className="font-semibold">{order.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span>{order.orderDate}</span>
            </div>
        
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">RECIPIENT DETAILS</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600 block">Name:</span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Phone:</span>
              <span>{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Email:</span>
              <span>{order.customerEmail}</span>
            </div>
            <div>
              <span className="text-gray-600 block">Address:</span>
              <span className="font-medium">{order.address}</span>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">ITEM DETAILS</h2>
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800">{order.item}</span>
              <span className="text-lg font-bold text-green-600">₱{order.price}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>Quantity: {order.quantity}</span>
              <span className="ml-4">Courier: {order.courierService}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">DELIVERY STATUS</h2>
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${statusColors[order.status]}`}>
              {React.createElement(statusIcons[order.status], { size: 16, className: "mr-2" })}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">SCAN TO TRACK</h2>
          <div className="flex justify-center">
            <div className="border-2 border-gray-300 p-3 rounded-lg bg-white">
              <QRCodeSVG
                value={qrData} 
                size={60}
                level="M"
                includeMargin={true}
                fgColor="#4f46e5"
                bgColor="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">Delivery Status Tracker</h1>
            <p className="text-green-100 text-lg">Track and manage your deliveries with QR code integration</p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders, customers, items, tracking numbers..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="processing">Processing ({statusCounts.processing})</option>
                <option value="shipped">Shipped ({statusCounts.shipped})</option>
                <option value="out-for-delivery">Out for Delivery ({statusCounts['out-for-delivery']})</option>
                <option value="delivered">Delivered ({statusCounts.delivered})</option>
                <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{statusCounts.all}</div>
              <div className="text-xs text-gray-600">Total Orders</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-800">{statusCounts.pending}</div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{statusCounts.processing}</div>
              <div className="text-xs text-green-700">Processing</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{statusCounts.shipped}</div>
              <div className="text-xs text-green-700">Shipped</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-800">{statusCounts['out-for-delivery']}</div>
              <div className="text-xs text-orange-700">Out for Delivery</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{statusCounts.delivered}</div>
              <div className="text-xs text-green-700">Delivered</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-800">{statusCounts.cancelled}</div>
              <div className="text-xs text-red-700">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    Order ID
                    {sortField === 'id' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customerName')}
                  >
                    Customer
                    {sortField === 'customerName' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('item')}
                  >
                    Item
                    {sortField === 'item' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quantity')}
                  >
                    Qty
                    {sortField === 'quantity' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {sortField === 'price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orderDate')}
                  >
                    Order Date
                    {sortField === 'orderDate' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">No orders found</p>
                        <p className="text-gray-500">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No orders available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const StatusIcon = statusIcons[order.status];
                    return (
                      <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          <div className="text-sm text-gray-500">{order.status}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-500 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{order.item}</div>
                          <div className="text-sm text-gray-500">{order.courierService}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{order.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.orderDate}</div>
                          <div className="text-sm text-gray-500">Est: {order.estimatedDelivery}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1 ${statusColors[order.status]}`}>
                            <StatusIcon size={12} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out-for-delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openQRModal(order)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                              title="Generate QR Code"
                            >
                              <QRCodeSVG size={16} />
                            </button>
                            <button
                              onClick={() => openPrintModal(order)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded-full hover:bg-green-50"
                              title="Print Receipt"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Order Information */}
                                  {/* Order Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="text-green-500" />
                      Order Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium">{selectedOrder.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span>{selectedOrder.orderDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span>{selectedOrder.estimatedDelivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Courier Service:</span>
                        <span>{selectedOrder.courierService}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span>{selectedOrder.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Truck className="text-green-500" />
                      Delivery Status
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                          {React.createElement(statusIcons[selectedOrder.status], { size: 14, className: "mr-1" })}
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                          Update Status:
                        </label>
                        <select
                          id="status-select"
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out-for-delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="text-purple-500" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="text-red-500" />
                      Delivery Address
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="text-green-500" />
                    Order Items
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{selectedOrder.item}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {selectedOrder.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₱{(selectedOrder.price / selectedOrder.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₱{selectedOrder.price}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                            Total:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ₱{selectedOrder.price}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => openQRModal(selectedOrder)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </button>
                  <button
                    onClick={() => openPrintModal(selectedOrder)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">QR Code for Order #{selectedOrder.id}</h2>
                <button 
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <QRCodeSVG
                      value={JSON.stringify({
                        orderId: selectedOrder.id,
                        trackingNumber: selectedOrder.trackingNumber,
                        status: selectedOrder.status,
                        customer: selectedOrder.customerName,
                        item: selectedOrder.item,
                        viewUrl: `https://delivery-tracker.com/track/${selectedOrder.id}`
                      })}
                      size={256}
                      level="H"
                      includeMargin={true}
                      fgColor="#4f46e5"
                      bgColor="#ffffff"
                    />
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Scan this QR code to track this order's status</p>
                    <p className="text-xs text-gray-500">Order ID: {selectedOrder.id}</p>
                    <p className="text-xs text-gray-500">Tracking #: {selectedOrder.trackingNumber}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // You could implement download functionality here
                        console.log("Download QR code");
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setShowQRModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Print Delivery Receipt</h2>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <PrintableReceipt order={selectedOrder} />
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Now
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracker;