import React, { useState } from 'react';

const UnverifiedUserModal = ({ isOpen, onClose, onResendVerification, userEmail }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const handleResendClick = async () => {
    setIsResending(true);
    try {
      await onResendVerification();
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="text-center mb-4">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12M12 16V16.01M4.93 19.07C3.15 17.29 2 14.77 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C9.23 22 6.71 20.85 4.93 19.07Z" 
                    stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Email Not Verified</h3>
        </div>
        
        <div className="text-gray-600 mb-6">
          <p className="mb-2">Your account requires email verification before you can log in.</p>
          <p>We sent a verification link to <span className="font-medium">{userEmail || 'your email address'}</span>. Please check your inbox and verify your account.</p>
        </div>
        
        {resendSuccess ? (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            Verification email has been resent successfully! Please check your inbox.
          </div>
        ) : null}
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <button
            onClick={handleResendClick}
            disabled={isResending || resendSuccess}
            className="inline-flex justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : resendSuccess ? "Email Sent" : "Resend Verification Email"}
          </button>
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnverifiedUserModal;
