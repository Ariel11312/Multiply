import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Building, Smartphone, AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { checkMemberTransaction } from '../../middleware/memberTransaction';
import { checkMember } from '../../middleware/member';
import { checkAuth } from '../../middleware/auth';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [errors, setErrors] = useState({});
  const [MemberTransaction, setMemberTransaction] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [authState, setAuthState] = useState();
  const balance = MemberTransaction?.total || 0;
  const minWithdraw = 500;
  const maxWithdraw = 10000;

  // Mock transaction data
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN001',
      amount: 250.00,
      method: 'Bank Transfer',
      status: 'completed',
      date: '2025-06-09',
      estimatedArrival: 'Completed',
      fee: 0
    },
    {
      id: 'TXN002',
      amount: 100.00,
      method: 'GCash',
      status: 'processing',
      date: '2025-06-11',
      estimatedArrival: 'Today by 6 PM',
      fee: 5.99
    },
    {
      id: 'TXN003',
      amount: 75.50,
      method: 'GCash',
      status: 'pending',
      date: '2025-06-11',
      estimatedArrival: 'Within 24 hours',
      fee: 1.50
    }
  ]);

  const withdrawMethods = [
    { 
      id: 'gcash', 
      name: 'GCash', 
      icon: Smartphone, 
      fee: 5.99, 
      time: 'Instant',
      description: 'Fast and convenient mobile wallet transfer'
    },
    { 
      id: 'bank', 
      name: 'Bank Transfer', 
      icon: Building, 
      fee: 0, 
      time: '1-3 business days',
      description: 'Direct transfer to your bank account'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (withdrawAmount < minWithdraw) {
      newErrors.amount = `Minimum withdrawal is ₱${minWithdraw}`;
    } else if (withdrawAmount > maxWithdraw) {
      newErrors.amount = `Maximum withdrawal is ₱${maxWithdraw}`;
    } else if (withdrawAmount > balance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };
const handleBack = () => {
  setShowTransactionStatus(false);
  setShowSuccess(false);
  setShowConfirmation(false);
  setAmount('');
  window.location.href = '/member';
};


  const confirmWithdraw = () => {
    // Create new transaction
    const newTransaction = {
      id: `TXN${String(transactions.length + 1).padStart(3, '0')}`,
      amount: withdrawAmount,
      method: selectedMethodData.name,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      estimatedArrival: selectedMethodData.time,
      fee: totalFee
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setCurrentTransaction(newTransaction);
    setShowConfirmation(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowTransactionStatus(true);
      // Reset form
      setAmount('');
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <Package className="w-5 h-5 text-green-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressSteps = (status) => {
    const steps = [
      { id: 'initiated', label: 'Withdrawal Initiated', icon: Clock },
      { id: 'processing', label: 'Processing Payment', icon: Package },
      { id: 'completed', label: 'Funds Delivered', icon: CheckCircle }
    ];

    let currentStep = 0;
    if (status === 'processing') currentStep = 1;
    if (status === 'completed') currentStep = 2;

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentStep,
      isCurrent: index === currentStep
    }));
  };

  const selectedMethodData = withdrawMethods.find(m => m.id === selectedMethod);
  const withdrawAmount = parseFloat(amount) || 0;
  const totalFee = selectedMethodData?.fee || 0;
  const netAmount = withdrawAmount - totalFee;
  
  useEffect(() => {
    checkMember(setMemberData);
    checkMemberTransaction(setMemberTransaction);
    checkAuth(setAuthState);
  }, []);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your withdrawal of ₱{withdrawAmount.toFixed(2)} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Funds will arrive in {selectedMethodData?.time.toLowerCase()}
          </p>
          <button
            onClick={() => {
              setShowSuccess(false);
              setShowTransactionStatus(true);
            }}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mb-3"
          >
            View Transaction Status
          </button>
          <button
            onClick={() => setShowSuccess(false)}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Make Another Withdrawal
          </button>
        </div>
      </div>
    );
  }

  // Transaction Status Page
  if (showTransactionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-2xl mx-auto p-4 pt-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={() => setShowTransactionStatus(false)}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors mr-3"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Status</h1>
          </div>

          {/* Current Transaction Detail (if just completed) */}
          {currentTransaction && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Latest Transaction</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentTransaction.status)}`}>
                  {currentTransaction.status.charAt(0).toUpperCase() + currentTransaction.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₱{currentTransaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentTransaction.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-sm">{currentTransaction.id}</p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    {getProgressSteps(currentTransaction.status).map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                            step.isActive ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              step.isActive ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <p className={`text-xs text-center ${
                            step.isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {index < getProgressSteps(currentTransaction.status).length - 1 && (
                            <div className={`absolute h-0.5 w-16 mt-4 ml-8 ${
                              step.isActive ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-green-800">
                    <strong>Estimated Arrival:</strong> {currentTransaction.estimatedArrival}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Transactions */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h2>
            </div>
            
            <div className="divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          ₱{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.method}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.estimatedArrival}
                      </p>
                    </div>
                  </div>
                  
                  {transaction.status !== 'completed' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>
                          {transaction.status === 'pending' && '1/3'}
                          {transaction.status === 'processing' && '2/3'}
                          {transaction.status === 'completed' && '3/3'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: transaction.status === 'pending' ? '33%' : 
                                   transaction.status === 'processing' ? '66%' : '100%' 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowTransactionStatus(false)}
            className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Make New Withdrawal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-2xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-700"  onClick={handleBack}/>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">₱{balance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₱</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min={minWithdraw}
                  max={maxWithdraw}
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-4 border rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Min: ₱{minWithdraw} | Max: ₱{maxWithdraw}
              </p>
            </div>

            {/* Withdrawal Methods */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Withdrawal Method
              </label>
              <div className="space-y-3">
                {withdrawMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                            selectedMethod === method.id ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              selectedMethod === method.id ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                            <p className="text-sm text-gray-600 font-medium">{method.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 mb-1">
                            {method.fee = 10 ? '10' : `₱${method.fee}`}
                          </p>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedMethod === method.id
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod === method.id && (
                              <div className="w-3 h-3 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Account Details</p>
                  <p className="text-sm text-blue-700">
                    Account details will be provided by our secure payment processor during the withdrawal process. 
                    No need to enter account information manually.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {amount && withdrawAmount > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Transaction Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Amount</span>
                    <span className="font-medium">₱{withdrawAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">₱{totalFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">You'll Receive</span>
                    <span className="font-bold text-gray-900">₱{netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!amount || withdrawAmount <= 0}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Withdrawal</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">₱{withdrawAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">{selectedMethodData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee</span>
                <span className="font-medium">₱{totalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-medium">{selectedMethodData?.time}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-900">You'll Receive</span>
                <span className="font-bold text-gray-900">₱{netAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Account details will be provided by our secure payment processor to complete this transaction.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}