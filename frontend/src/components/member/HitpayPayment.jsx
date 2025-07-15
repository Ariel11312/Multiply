import React, { useState } from 'react';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'SGD',
    email: '',
    name: '',
    purpose: '',
    reference_number: '',
    payment_methods: ['paynow_online', 'card', 'wechat', 'alipay'],
    allow_repeated_payments: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const createPaymentRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.amount || !formData.currency) {
        throw new Error('Amount and currency are required');
      }

      // Prepare payment data
      const paymentData = {
        ...formData,
        redirect_url: `${window.location.origin}/payment-success`,
        webhook: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/webhook`,
        reference_number: formData.reference_number || `REF-${Date.now()}` 
      };

      // Make API call to your backend
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        }
      );

      const data = await response.json();

      if (data.success) {
        setPaymentUrl(data.data.url);
        // Redirect to payment URL
        window.location.href = data.data.url;
      } else {
        throw new Error(data.error || 'Payment creation failed');
      }

    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const availablePaymentMethods = [
    { value: 'paynow_online', label: 'PayNow Online' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'wechat', label: 'WeChat Pay' },
    { value: 'alipay', label: 'Alipay' },
    { value: 'grabpay', label: 'GrabPay' },
    { value: 'fave_duit', label: 'Fave & DuitNow' },
    { value: 'shopback', label: 'ShopBack' },
    { value: 'atome', label: 'Atome' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Payment Request</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div onSubmit={createPaymentRequest} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency *
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SGD">SGD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="customer@example.com"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose
          </label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Product purchase, Service payment"
          />
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number
          </label>
          <input
            type="text"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Will be auto-generated if empty"
          />
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Methods
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availablePaymentMethods.map(method => (
              <label key={method.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.payment_methods.includes(method.value)}
                  onChange={() => handlePaymentMethodChange(method.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Allow Repeated Payments */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="allow_repeated_payments"
              checked={formData.allow_repeated_payments}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow repeated payments</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={createPaymentRequest}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Payment...' : 'Create Payment Request'}
        </button>
      </div>

      {paymentUrl && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">Payment URL created successfully!</p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {paymentUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;