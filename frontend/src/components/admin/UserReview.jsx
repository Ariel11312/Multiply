import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Calendar, User, MapPin, FileText, Clock, Hash, CreditCard, Users } from 'lucide-react';

const AdminApprovalCard = () => {
  const [members, setMembers] = useState([]);
  const [userProof, setUserProof] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/member/get-all-user-roof",
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
      console.log('API Response:', data);
      
      if (data.success) {
        setMembers(data.members || []);
        setUserProof(data.userProof || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

const handleApprove = async (referralCode,memberID, memberType, addressNo, region, province, city, barangay, userType, role, memberStatus, paymentType, referredBy, memberDate, memberRoot) => {
  try {
    const requestBody = {
      memberID,
      referralCode,
      memberType,
      addressNo,
      region,
      province,
      city,
      barangay,
      userType,
      role,
      memberStatus: 'Approved',
      paymentType,
      referredBy,
      memberDate,
      memberRoot
    };

    // Debug: Log the request body
    console.log('Request body:', requestBody);
    console.log('Request body JSON:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(import.meta.env.VITE_API_URL + '/api/member/create-member', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Debug: Log response details
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      // Get error details from response
      const errorData = await response.text();
      console.log('Error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const result = await response.json();
    console.log('Member approved:', result);

    setApplications(prev =>
      prev.map(app =>
        app._id === memberID ? { ...app, status: 'approved' } : app
      )
    );
    
    setShowModal(false);
    
  } catch (error) {
    console.error('Error approving member:', error);
  }
};
  const handleDecline = async (memberId) => {
    // TODO: Implement API call to decline member
    setMembers(prev => 
      prev.map(member => 
        member._id === memberId ? { ...member, memberStatus: 'Declined' } : member
      )
    );
    setShowModal(false);
  };

  const viewDetails = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    try {
      // Handle different date formats
      if (dateString.includes(',')) {
        // Format like "July 25, 2025"
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        // ISO format
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return dateString || 'Unknown date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMemberProofs = (memberId) => {
    return userProof.filter(proof => proof.id === memberId);
  };

  const getFirstProofImage = (memberId) => {
    const proofs = getMemberProofs(memberId);
    return proofs.length > 0 ? proofs[0].image : '/api/placeholder/50/50';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading member applications...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800">Error Loading Applications</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchUsers}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Member Applications Review</h1>
        
        {members.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No member applications found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {members.map((member) => {
              const memberProofs = getMemberProofs(member._id);
              
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
                          <h3 className="text-lg font-semibold text-gray-900">{member.memberID}</h3>
                          <p className="text-sm text-gray-600">{member.memberType?.join(', ')} Member</p>
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
                        <div><span className="font-medium">Member Type:</span> {member.memberType?.join(', ')}</div>
                        <div><span className="font-medium">Role:</span> {member.role}</div>
                        <div><span className="font-medium">Payment Type:</span> {member.paymentType}</div>
                        <div><span className="font-medium">User Type:</span> {member.userType}</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Address Information</h4>
                      <div className="text-sm text-gray-700">
                        <p>{member.addressNo}, {member.barangay}</p>
                        <p>{member.city}, {member.province}</p>
                        <p>{member.region}</p>
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

                    <div className="mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Root: {member.memberRoot}</span>
                        </div>
                        {member.referredBy && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Referred by: {member.referredBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

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
                          onClick={() => handleApprove(member.referralCode,member.memberID,member.memberType[0],member.addressNo,member.region,member.province,member.city,member.barangay,member.userType,member.role,member.memberStatus,member.paymentType,member.referredBy,member.memberDate,member.memberRoot)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDecline(member._id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {member.memberStatus?.toLowerCase() !== 'pending' && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Member has been {member.memberStatus?.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Member Application Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={getFirstProofImage(selectedMember._id)}
                    alt="Member proof"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/50/50';
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedMember.memberID}</h3>
                    <p className="text-gray-600">{selectedMember.memberType?.join(', ')} Member</p>
                    <p className="text-sm text-gray-500">Applied: {formatDate(selectedMember.memberDate)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Member Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Member ID:</span> {selectedMember.memberID}</div>
                        <div><span className="font-medium">Referral Code:</span> {selectedMember.referralCode}</div>
                        <div><span className="font-medium">Member Type:</span> {selectedMember.memberType?.join(', ')}</div>
                        <div><span className="font-medium">Role:</span> {selectedMember.role}</div>
                        <div><span className="font-medium">User Type:</span> {selectedMember.userType}</div>
                        <div><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedMember.memberStatus)}`}>
                            {selectedMember.memberStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Payment & Referral</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Payment Type:</span> {selectedMember.paymentType}</div>
                        <div><span className="font-medium">Member Root:</span> {selectedMember.memberRoot}</div>
                        {selectedMember.referredBy && (
                          <div><span className="font-medium">Referred By:</span> {selectedMember.referredBy}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Address Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Address:</span> {selectedMember.addressNo}</div>
                        <div><span className="font-medium">Barangay:</span> {selectedMember.barangay}</div>
                        <div><span className="font-medium">City:</span> {selectedMember.city}</div>
                        <div><span className="font-medium">Province:</span> {selectedMember.province}</div>
                        <div><span className="font-medium">Region:</span> {selectedMember.region}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {getMemberProofs(selectedMember._id).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Submitted Proof Documents ({getMemberProofs(selectedMember._id).length})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {getMemberProofs(selectedMember._id).map((proof, index) => (
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

                {selectedMember.memberStatus?.toLowerCase() === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(selectedMember._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve Member</span>
                    </button>
                    <button
                      onClick={() => handleDecline(selectedMember._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Decline Member</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalCard;