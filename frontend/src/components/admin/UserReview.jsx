import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Eye, Calendar, 
  User, MapPin, FileText, Clock, 
  Hash, CreditCard, Users, Loader2,
  DollarSign, Banknote, Wallet 
} from 'lucide-react';


const AdminApprovalCard = () => {
  // State management
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userProof, setUserProof] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/member/get-all-user-proof`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members || []);
        setUsers(data.user || []);
        setUserProof(data.userProof || []);
        setWithdrawals(data.withdraw || []);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Member approval functions
  const handleApproveMember = async (memberData) => {
    try {
      setIsProcessing(true);
      const requestBody = {
        memberID: memberData.memberID,
        referralCode: memberData.referralCode,
        memberType: Array.isArray(memberData.memberType) ? memberData.memberType[0] : memberData.memberType,
        addressNo: memberData.addressNo,
        region: memberData.region,
        province: memberData.province,
        city: memberData.city,
        barangay: memberData.barangay,
        userType: memberData.userType,
        role: memberData.role,
        memberStatus: 'Approved',
        paymentType: memberData.paymentType,
        referredBy: memberData.referredBy,
        memberDate: memberData.memberDate,
        memberRoot: memberData.memberRoot
      };

      let endpoint = '/api/member/create-member';
      if (memberData.userType === 'Golden Seats') {
        endpoint = '/api/member/update-member';
      } else if (memberData.userType === 'Upgrade Package') {
        endpoint = '/api/member/create-package';
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: endpoint === '/api/member/update-member' ? 'PUT' : 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
window.location.href = '/admin/user-review'
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setMembers(prev =>
          prev.map(member =>
            member._id === memberData._id ? { ...member, memberStatus: 'Approved' } : member
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving member:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineMember = async (memberId, userId) => {
    
    try {
      setIsProcessing(true);
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/member/declinemembership`,
  {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId: memberId,messageToMember: "Your membership request due to not enough proof",userId:userId })
  }
);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setMembers(prev => 
          prev.map(member => 
            member._id === memberId ? { ...member, memberStatus: 'Declined' } : member
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error declining member:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Withdrawal approval functions
  const handleApproveWithdrawal = async (id,withdrawalId,paymentMethod,accountNumber,walletAddress,amount) => {
try {
  setIsProcessing(true);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/member/approvewithdraw`,
    {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id,withdrawalId,paymentMethod,accountNumber,walletAddress,amount }), // Fixed: wrapped in object
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.success) {
    setWithdrawals(prev =>
      prev.map(w =>
        w._id === withdrawalId ? { ...w, status: 'Approved' } : w
      )
    );
    window.location.href = '/admin/user-review'
  }
} catch (error) {
  console.error('Error approving withdrawal:', error);
} finally {
  setIsProcessing(false);
};
  
}

  const handleRejectWithdrawal = async (id,withdrawalId,paymentMethod,accountNumber,walletAddress,amount)  => {
    try {
      setIsProcessing(true);
   const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/member/rejectwithdraw`,
    {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id,withdrawalId,paymentMethod,accountNumber,walletAddress,amount }), // Fixed: wrapped in object
    }
  );

window.location.href = '/admin/user-review'
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setWithdrawals(prev =>
          prev.map(w => 
            w._id === withdrawalId ? { ...w, status: 'Rejected' } : w
          )
        );
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions
  const viewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'declined':
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMemberProofs = (memberId) => {
    return userProof.filter(proof => proof.id === memberId);
  };

  const getFirstProofImage = (memberId) => {
    const proofs = getMemberProofs(memberId);
    return proofs.length > 0 ? proofs[0].image : 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png';
  };

  const getUserInfo = (memberId) => {
    return users.find(user => user.id === memberId || user._id === memberId) || {};
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Approval Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('members')}
          >
            Member Applications
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'withdrawals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawal Requests
          </button>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Member Applications ({members.length})</h2>
            
            {members.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No member applications found.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {members.map((member) => {
                  const memberProofs = getMemberProofs(member._id);
                  const userInfo = getUserInfo(member.memberID);
                  
                  return (
                    <div key={member._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getFirstProofImage(member._id)}
                              alt="Member proof"
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/50/50';
                              }}
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {userInfo.firstName} {userInfo.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {Array.isArray(member.memberType) ? member.memberType.join(', ') : member.memberType} Member
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(member.memberStatus)}`}>
                            {member.memberStatus}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member.referralCode}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDate(member.memberDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member.city}, {member.province}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <h4 className="font-medium text-gray-900 mb-2">Member Details</h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div><span className="font-medium">Member ID:</span> {member.memberID}</div>
                            <div><span className="font-medium">Member Type:</span> {Array.isArray(member.memberType) ? member.memberType.join(', ') : member.memberType}</div>
                            <div><span className="font-medium">Role:</span> {member.role}</div>
                            <div><span className="font-medium">Payment Type:</span> {member.paymentType}</div>
                            <div><span className="font-medium">User Type:</span> {member.userType}</div>
                          </div>
                        </div>

                        {memberProofs.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Submitted Proof Documents ({memberProofs.length})
                            </h4>
                            <div className="grid md:grid-cols-3 gap-3">
                              {memberProofs.slice(0, 3).map((proof, index) => (
                                <div key={proof._id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">Proof {index + 1}</p>
                                      <p className="text-xs text-gray-500">{formatDate(proof.date)}</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => window.open(proof.image, '_blank')}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="View proof document"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              {memberProofs.length > 3 && (
                                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                  +{memberProofs.length - 3} more documents
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {member.memberStatus?.toLowerCase() === 'pending' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => viewDetails(member)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Review Details</span>
                            </button>
                            <button
                              onClick={() => handleApproveMember(member)}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleDeclineMember(member._id,member.memberID)}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Withdrawal Requests ({withdrawals.length})</h2>
            
            {withdrawals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No withdrawal requests found.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {withdrawals.map((withdrawal) => {
                  const userInfo = getUserInfo(withdrawal.userId);
                  
                  return (
                    <div key={withdrawal._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 rounded-full">
                              <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {withdrawal.accountName} 
                              </h3>
                              <p className="text-sm text-gray-600">
                                {withdrawal.paymentMethod} Withdrawal
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center space-x-2">
                            <Wallet className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {withdrawal.paymentMethod}: {withdrawal.accountNumber || withdrawal.walletAddress}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Banknote className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatCurrency(withdrawal.amount)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(withdrawal.createdAt)}
                            </span>
                          </div>
                        </div>

                        {withdrawal.status?.toLowerCase() === 'pending' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleApproveWithdrawal(withdrawal._id,withdrawal.memberID, withdrawal.paymentMethod, withdrawal.accountNumber, withdrawal.walletAddress, withdrawal.amount)}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(withdrawal._id,withdrawal.memberID, withdrawal.paymentMethod, withdrawal.accountNumber, withdrawal.walletAddress, withdrawal.amount)}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'members' ? 'Member' : 'Withdrawal'} Application Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {activeTab === 'members' ? (
                  <MemberDetailsModal 
                    member={selectedItem} 
                    userInfo={getUserInfo(selectedItem.memberID)}
                    memberProofs={getMemberProofs(selectedItem._id)}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    onApprove={handleApproveMember}
                    onDecline={handleDeclineMember}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <WithdrawalDetailsModal 
                    withdrawal={selectedItem} 
                    userInfo={getUserInfo(selectedItem.userId)}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusColor={getStatusColor}
                    onApprove={handleApproveWithdrawal}
                    onReject={handleRejectWithdrawal}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for better organization
const MemberDetailsModal = ({ 
  member, 
  userInfo, 
  memberProofs, 
  formatDate, 
  getStatusColor, 
  onApprove, 
  onDecline, 
  isProcessing 
}) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <img
        src={memberProofs.length > 0 ? memberProofs[0].image : 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'}
        alt="Member proof"
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {userInfo.firstName} {userInfo.lastName}
        </h3>
        <p className="text-gray-600">
          {Array.isArray(member.memberType) ? member.memberType.join(', ') : member.memberType} Member
        </p>
        <p className="text-sm text-gray-500">
          Applied: {formatDate(member.memberDate)}
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Member Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Member ID:</span> {member.memberID}</div>
            <div><span className="font-medium">Referral Code:</span> {member.referralCode}</div>
            <div><span className="font-medium">Member Type:</span> {Array.isArray(member.memberType) ? member.memberType.join(', ') : member.memberType}</div>
            <div><span className="font-medium">Role:</span> {member.role}</div>
            <div><span className="font-medium">User Type:</span> {member.userType}</div>
            <div><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(member.memberStatus)}`}>
                {member.memberStatus}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Payment & Referral</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Payment Type:</span> {member.paymentType}</div>
            <div><span className="font-medium">Member Root:</span> {member.memberRoot}</div>
            {member.referredBy && (
              <div><span className="font-medium">Referred By:</span> {member.referredBy}</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Address Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Address:</span> {member.addressNo}</div>
            <div><span className="font-medium">Barangay:</span> {member.barangay}</div>
            <div><span className="font-medium">City:</span> {member.city}</div>
            <div><span className="font-medium">Province:</span> {member.province}</div>
            <div><span className="font-medium">Region:</span> {member.region}</div>
          </div>
        </div>
      </div>
    </div>

    {memberProofs.length > 0 && (
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Submitted Proof Documents ({memberProofs.length})
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          {memberProofs.map((proof, index) => (
            <div key={proof._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Proof Document {index + 1}</p>
                  <p className="text-sm text-gray-500">Uploaded: {formatDate(proof.date)}</p>
                </div>
              </div>
              <button 
                onClick={() => window.open(proof.image, '_blank')}
                className="text-blue-600 hover:text-blue-800"
                title="View document"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {member.memberStatus?.toLowerCase() === 'pending' && (
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => onApprove(member)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>Approve Member</span>
        </button>
        <button
          onClick={() => onDecline(member._id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>Decline Member</span>
        </button>
      </div>
    )}
  </div>
);

const WithdrawalDetailsModal = ({ 
  withdrawal, 
  userInfo, 
  formatDate, 
  formatCurrency, 
  getStatusColor, 
  onApprove, 
  onReject, 
  isProcessing 
}) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className="p-4 bg-blue-50 rounded-full">
        <DollarSign className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {userInfo.firstName} {userInfo.lastName || ''}
        </h3>
        <p className="text-gray-600">
          {withdrawal.paymentMethod} Withdrawal
        </p>
        <p className="text-sm text-gray-500">
          Requested: {formatDate(withdrawal.createdAt)}
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Withdrawal Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Amount:</span> {formatCurrency(withdrawal.amount)}</div>
            <div><span className="font-medium">Payment Method:</span> {withdrawal.paymentMethod}</div>
            <div><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(withdrawal.status)}`}>
                {withdrawal.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{withdrawal.paymentMethod} Account:</span> 
              <p className="mt-1 p-2 bg-gray-50 rounded">
                {withdrawal.accountNumber || withdrawal.walletAddress}
              </p>
            </div>
            {withdrawal.paymentMethod === 'Bank' && (
              <>
                <div><span className="font-medium">Bank Name:</span> {withdrawal.bankName}</div>
                <div><span className="font-medium">Account Name:</span> {withdrawal.accountName}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {withdrawal.status?.toLowerCase() === 'pending' && (
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => onApprove(withdrawal._id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>Approve Withdrawal</span>
        </button>
        <button
          onClick={() => onReject(withdrawal._id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>Reject Withdrawal</span>
        </button>
      </div>
    )}
  </div>
);

export default AdminApprovalCard;