import React, { useEffect, useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle, CreditCard, Building, User, DollarSign } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom'

const BankPaymentSystem = () => {
      const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentData, setPaymentData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    amount: '',
    reference: '',
    purpose: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [proofs, setProofs] = useState([]); // State to store fetched proofs
  const [proofsLoading, setProofsLoading] = useState(true); // State for loading status of proofs
  const [proofsError, setProofsError] = useState(null); // State for errors during proof fetching

  // Sample bank information (this would come from your backend in a real application)
  const bankInfo = {
    bankName: "CHINA BANK",
    accountName: "WEMULTIPLYAPP.COM WEB DEVELOPMENT SERVICES",
    accountNumber: "618-000-023-381",
  };

  // Memoized ProofCheck function
  const ProofCheck = useCallback(async () => {
    if (!id) {
      setProofsLoading(false);
      navigate('/payment-transaction')
      return;
    }

    try {
      setProofsLoading(true);
      setProofsError(null); // Clear previous errors

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/member/check-proof/${id}`, {
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
      
      setProofs(data.payments); // Update state with fetched data
    } catch (error) {
      console.error('Error checking payment status:', error);
      navigate('/payment-transaction')

      
      setProofsError(error.message); // Set error message
    } finally {
      setProofsLoading(false); // Set loading to false regardless of success or failure
    }
  }, [id]); // Dependency array includes 'id'

  useEffect(() => {
    ProofCheck();
  }, [ProofCheck]); // Depend on the memoized ProofCheck function

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Correctly access name and value from e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    setUploadedFile(file);
    
    // Create preview for images (same as before)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }

    // Upload with progress tracking
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        setUploadProgress(100);
      } else {
        console.error('Upload failed');
      }
    };

    xhr.onerror = () => {
      console.error('Upload error');
    };

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  }
};

  const nextStep = () => {
    if (currentStep < 2) { // Changed from 3 to 2 as there are only two main steps in rendering logic
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

const handleSubmit = async () => {
  // Validation check
  if (!uploadedFile) {
    alert('Please select a file to upload');
    return;
  }

  // Create FormData object
  const formData = new FormData();
  
  // Append fields - make sure field names match what backend expects
  formData.append('memberId', id.toString());
  formData.append('date', new Date().toISOString()); // Use proper date format
  formData.append('paymentProof', uploadedFile, uploadedFile.name); // Field name matches backend

  // Debug: Log FormData contents
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    // Show loading state (optional)
    // setIsSubmitting(true);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    
    // Reset form state
    setPaymentData({
      accountName: '',
      accountNumber: '',
      bankName: '',
      amount: '',
      reference: '',
      purpose: ''
    });
    setUploadedFile(null);
    setUploadPreview(null);
    setCurrentStep(1);
    
    // Re-fetch proofs
    if (typeof ProofCheck === 'function') {
      ProofCheck();
      alert('Payment proof successfully submitted! please wait to approve within  0 - 2 business days')
    navigate('/')
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    alert(`Error uploading file: ${error.message}`);
  } finally {
    // Hide loading state (optional)
    // setIsSubmitting(false);
  }
};

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 text-gray-500'
          }`}>
            {currentStep > step ? <CheckCircle size={20} /> : step}
          </div>
          {step < 2 && (
            <div className={`w-12 h-0.5 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Bank Account Information</h2>
        <p className="text-gray-600">Please make your payment to the following account</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Bank Name</p>
            <p className="font-semibold text-lg">{bankInfo.bankName}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Account Name</p>
            <p className="font-semibold text-lg">{bankInfo.accountName}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Account Number</p>
            <p className="font-semibold text-lg font-mono">{bankInfo.accountNumber}</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Instructions</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Include your reference number in the payment description</li>
                <li>Keep your payment receipt for verification</li>
                <li>Allow 0-2 business days for payment processing</li>
                <li>Contact support if you encounter any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Upload className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Upload Payment Proof & Details</h2>
        <p className="text-gray-600">Enter your payment details and upload your receipt or screenshot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">Click to upload proof of payment</p>
          <p className="text-sm text-gray-500 mt-2">PNG, JPG, or PDF up to 10MB</p>
        </label>
      </div>

      {uploadedFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">File uploaded successfully</p>
              <p className="text-sm text-green-600">{uploadedFile.name}</p>
            </div>
          </div>
        </div>
      )}

      {uploadPreview && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <img
            src={uploadPreview}
            alt="Payment proof preview"
            className="max-w-full h-64 object-contain border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Upload Requirements</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure the receipt shows the transaction details clearly</li>
                <li>Include the reference number in the payment description</li>
                <li>The amount should match what you entered in the previous step</li>
                <li>File should be in good quality and readable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepIndicator()}

          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
              //   // Require all mandatory fields and file to be uploaded before submission
              //   disabled={
              //     !paymentData.accountName ||
              //     !paymentData.accountNumber ||
              //     !paymentData.bankName ||
              //     !paymentData.amount ||
              //     !paymentData.reference ||
              //     !uploadedFile
              //   }
              //   // className={`px-6 py-2 rounded-md font-medium ${
              //   //   (paymentData.accountName &&
              //   //     paymentData.accountNumber &&
              //   //     paymentData.bankName &&
              //   //     paymentData.amount &&
              //   //     paymentData.reference &&
              //   //     uploadedFile)
              //       //?
                  className='px-6 py-2 rounded-md font-medium  bg-green-600 text-white hover:bg-green-700'
              //     //  // :
              //     //  'bg-gray-300 text-gray-500 cursor-not-allowed'
              //  //</div></div> }`}
              >
                Submit Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankPaymentSystem;