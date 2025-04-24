import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingBag, FaSearch } from 'react-icons/fa';
import { BsCheckCircle } from 'react-icons/bs';
import Navbar from './Navbar';

const PurchaseHistory = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'To Pay', 'To Ship', 'To Receive', 'Completed', 'Cancelled', 'Return Refund'];
  
  // Map backend status to UI tabs
  const statusToTab = {
    'pending': 'To Pay',
    'processing': 'To Ship',
    'shipped': 'To Receive',
    'delivered': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Return Refund'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + '/api/order/user-order', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab !== 'All' && statusToTab[order.status] !== activeTab) return false;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      
      // Check if seller exists and has a name property
      const sellerNameMatch = order.seller && order.seller.name ? 
        order.seller.name.toLowerCase().includes(lower) : false;
      
      // Check if order items exist and have names
      const itemNameMatch = order.orderItems && order.orderItems.some(item => 
        item.name && item.name.toLowerCase().includes(lower));
      
      // Check order ID
      const orderIdMatch = order._id.toLowerCase().includes(lower);
      
      return sellerNameMatch || itemNameMatch || orderIdMatch;
    }
    return true;
  });

  const Button = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`px-3 py-1 rounded border text-sm ${className}`}>{children}</button>
  );

  return (
    <div className="max-w-4xl mt-24 mx-auto font-sans p-4">
      <Navbar />
      <div className="flex border-b mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab}
            className={`px-5 py-2 cursor-pointer font-medium whitespace-nowrap ${activeTab === tab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded bg-gray-50 text-sm"
          placeholder="Search by Seller Name, Order ID, or Product Name"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-400">No orders found</div>
      ) : (
        filteredOrders.map(order => (
          <div key={order._id} className="border border-gray-200 rounded mb-5 p-4 bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                {order.seller && order.seller.preferred && 
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Preferred</span>
                }
                <span className="font-medium">{order.seller?.name || 'Shop'}</span>
                <span className="ml-2 text-gray-500 text-sm">Order ID: {order._id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => console.log('chat')} className="border-gray-300 text-gray-600">💬 Chat</Button>
                <Button onClick={() => console.log('view shop')} className="border-gray-300 text-gray-600">🏪 View Shop</Button>
              </div>
            </div>

            {order.status === 'delivered' && (
              <div className="flex items-center text-green-600 text-sm mt-2 gap-2">
                📦 Parcel has been delivered ℹ️
                <span className="ml-auto text-xs font-medium text-green-600">{statusToTab[order.status] || order.status}</span>
              </div>
            )}

            {order.orderItems && order.orderItems.map((item, index) => (
              <div key={index} className="flex gap-4 mt-4 border-b pb-4">
                <img 
                  src={import.meta.env.VITE_API_URL + item.image || '/images/placeholder.jpg'} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded" 
                />
                <div className="flex-grow">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  {item.variation && <p className="text-xs text-gray-500">Variation: {item.variation}</p>}
                  <p className="text-sm text-gray-700">x{item.quantity}</p>
                </div>
                <div className="text-right">
                  {item.originalPrice && item.originalPrice !== item.price && (
                    <p className="text-sm line-through text-gray-400">₱{item.originalPrice}</p>
                  )}
                  <p className="text-lg text-green-600 font-semibold">₱{item.price}</p>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <div className="text-gray-600">
                <span>Order Total:</span> 
                <span className="text-lg font-bold text-green-600 ml-2">
                  ₱{order.totalAmount || 
                    (order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
                </span>
              </div>
              
              {order.status === 'delivered' && (
                <div className="flex gap-2">
                  <Button onClick={() => console.log('rate')} className="border-green-600 text-green-600">Rate</Button>
                  <Button onClick={() => console.log('contact')} className="border-gray-300 text-gray-600">Contact Seller</Button>
                  <Button onClick={() => console.log('buy again')} className="border-gray-300 text-gray-600">Buy Again</Button>
                </div>
              )}
              
              {order.status === 'processing' && (
                <div className="flex gap-2">
                  <Button onClick={() => console.log('track')} className="border-green-600 text-green-600">Track Order</Button>
                  <Button onClick={() => console.log('contact')} className="border-gray-300 text-gray-600">Contact Seller</Button>
                </div>
              )}
              
              {order.status === 'shipped' && (
                <div className="flex gap-2">
                  <Button onClick={() => console.log('confirm')} className="border-green-600 bg-green-600 text-white">Confirm Receipt</Button>
                  <Button onClick={() => console.log('track')} className="border-green-600 text-green-600">Track Order</Button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PurchaseHistory;