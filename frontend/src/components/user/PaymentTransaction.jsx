import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Filter, Search, Download, RefreshCw, DollarSign, TrendingUp, Eye, ArrowUpRight, Package } from 'lucide-react';
import { checkAuth } from '../../middleware/auth';
import {useNavigate} from 'react-router-dom'

export default function PaymentTransaction() {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isCheckingAuth: true,
        user: null,
        error: null,
    });

    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        checkAuth(setAuthState);
    }, []);

    const checkPayment = async () => {
        try {
            const id = authState.user?._id;
            if (!id) {
                throw new Error('User ID not available');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/check-payment/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch payment records');
                
            }

            if (!Array.isArray(data?.payments)) {
                throw new Error('Invalid response structure: payments array not found');
            }

            return data.payments;
        } catch (error) {
            console.error('Error checking payment status:', error);
            setError(error.message);
            throw error;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const paymentData = await checkPayment();
            setPayments(paymentData);
            setError(null);
        } catch (error) {
            setError(error.message);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (authState.isAuthenticated) {
            fetchData();
        }
    }, [authState.isAuthenticated]);

    // Filter and search logic
    useEffect(() => {
        let filtered = [...payments];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(payment => payment.status?.toLowerCase() === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPayments(filtered);
    }, [payments, searchTerm, filterStatus]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="text-emerald-500" size={20} />;
            case 'failed':
                return <XCircle className="text-red-500" size={20} />;
            case 'pending':
                return <Clock className="text-amber-500" size={20} />;
            default:
                return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200";
        switch (status?.toLowerCase()) {
            case 'completed':
                return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`;
            case 'failed':
                return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
            case 'pending':
                return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const navigate = useNavigate()

 const handlePayment = (paymentUrl) =>{
    navigate( '/proof-of-payment?id=' + paymentUrl)
 }
    const getStatusCount = (status) => {
        return payments.filter(p => p.memberStatus?.toLowerCase() === status).length;
    };

    if (authState.isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Required</h2>
                    <p className="text-slate-600">Please login to view your payment history</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto"></div>
                        <div className="h-4 bg-slate-300 rounded w-48 mx-auto"></div>
                    </div>
                    <p className="text-slate-600 font-medium mt-4">Loading payment data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-200 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
                    <p className="text-slate-700 mb-6">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    const getPaymentAmount = (memberType) => {
        switch (memberType) {
            case 'X1':
                return '₱750';
            case 'X2':
                return '₱1,500';
            case 'X3':
                return '₱4,500';
            case 'X5':
                return '₱7,500';
            case 'Crown':
                return '₱15,000';
            case 'Diamond':
                return '₱750,000';
            default:
                return 'N/A';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">Payment Transactions</h1>
                            <p className="text-slate-600">Manage and track your payment history</p>
                        </div>
                        <div className="mt-4 lg:mt-0">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2"
                            >
                                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={18} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Transactions</p>
                                <p className="text-2xl font-bold text-slate-800">{payments.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold text-emerald-600">{getStatusCount('completed')}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="text-emerald-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Pending</p>
                                <p className="text-2xl font-bold text-amber-600">{getStatusCount('pending')}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="text-slate-400" size={20} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard className="text-slate-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">
                            {payments.length === 0 ? 'No payment records found' : 'No matching transactions'}
                        </h2>
                        <p className="text-slate-500 mb-6">
                            {payments.length === 0
                                ? "You don't have any payment transactions yet."
                                : "Try adjusting your search or filter criteria."
                            }
                        </p>
                        {searchTerm || filterStatus !== 'all' ? (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map((payment, index) => (
                            <div
                                key={payment._id || index}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                                        <div className="flex items-center gap-3 mb-2 lg:mb-0">
                                            {getStatusIcon(payment.status)}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Payment #{index + 1}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    ID: {payment._id || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={getStatusBadge(payment.memberStatus)}>
                                                {payment.memberStatus || 'N/A'}
                                            </span>
                                            {payment.amount && (
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-slate-800">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="text-blue-600" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Payment Method</p>
                                                <p className="font-semibold text-slate-800">{payment.paymentType || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="text-green-600" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Date</p>
                                                <p className="font-semibold text-slate-800">{formatDate(payment.memberDate)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Package className="text-purple-600" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Package</p>
                                                <p className="font-semibold text-slate-800 font-mono text-sm">
                                                    {payment.memberType || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <DollarSign className="text-purple-600" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500 font-medium">Amount To Pay</p>
                                                <p className="font-semibold text-slate-800 font-mono text-sm">
                                                    {getPaymentAmount(payment.memberType[0])}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-5">
                                            <button onClick={() => handlePayment(payment._id)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
                                                Pay Now
                                            </button>
                                              <button
                                                onClick={() => handlePayment(payment._id)}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 transition-colors duration-200"
                                            >
                                                View Details
                                                <ArrowUpRight size={16} />
                                            </button>
                                          
                                        </div>
                                    </div>

                                    {selectedPayment === payment._id && (
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <div className="bg-slate-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-slate-800 mb-3">Transaction Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-500">Transaction ID:</span>
                                                        <span className="ml-2 font-mono text-slate-800">{payment._id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Status:</span>
                                                        <span className="ml-2 font-semibold text-slate-800">{payment.memberStatus}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Amount:</span>
                                                        <span className="ml-2 font-semibold text-slate-800">{getPaymentAmount(payment.memberType[0])}</span>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}