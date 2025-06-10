import { useState, useEffect } from 'react';
import { CreditCard, Check, Lock, ArrowRight, Loader, Edit2 } from 'lucide-react';
import { checkAuth } from '../../middleware/auth';
import { checkMember } from "../../middleware/member";

export default function CheckoutPage() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });
  const [memberData, setMemberData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    postalCode: '',
    landmark: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: '',
    initialized: false
  });
  
  // Cart related states
  const [cartItems, setCartItems] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [error, setError] = useState(null);
  
  // Form error state
  const [formError, setFormError] = useState(null);
  
  // Store display names for locations
  const [locationNames, setLocationNames] = useState({
    regionName: '',
    provinceName: '',
    cityName: '',
    barangayName: ''
  });
  
  const [step, setStep] = useState(1);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add state to track if address fields are in edit mode
  const [editingAddress, setEditingAddress] = useState(false);
  
  // Check if user has existing address
  const hasExistingAddress = memberData && memberData.addressNo;
  
  const fetchUserCart = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + `/api/cart/usercart`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        setCartQuantity(0);
        setCartItems([]);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cart");
      }
      
      const cartData = await response.json();
      const formattedCartItems = cartData.items.map((item) => ({
        _id: item.itemId,
        name: item.name,
price: memberData ? item.price : item.price * 2,
        image: item.imageUrl,
        quantity: item.quantity,
      }));
      setCartQuantity(cartData.items.length);
      setCartItems(formattedCartItems);
      setCartUpdated(prev => !prev);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error.message);
    }
  };
  
  // First useEffect - runs only once at component mount
  useEffect(() => {
    fetchRegions();
    checkAuth(setAuthState);
    checkMember(setMemberData);
    fetchUserCart();
  }, []);
  
  // Second useEffect - handles form initialization after data is available
  useEffect(() => {
    if ((memberData || authState.user) && !formData.initialized) {
      setFormData(prev => ({
        ...prev,
        email: authState.user?.email || prev.email,
        name: `${authState.user?.firstName || ''} ${authState.user?.lastName || ''}`.trim(),
        phone: authState.user?.phoneNumber || prev.phone,
        region: memberData?.region || prev.region,
        province: memberData?.province || prev.province,
        city: memberData?.city || prev.city,
        barangay: memberData?.barangay || prev.barangay,
        postalCode: memberData?.postalCode || prev.postalCode,
        address: memberData?.addressNo || prev.address,
        initialized: true
      } ) );
      
      if (memberData) {
        setLocationNames({
          regionName: memberData.regionName || '',
          provinceName: memberData.provinceName || '',
          cityName: memberData.cityName || '',
          barangayName: memberData.barangayName || ''
        });
      }
    }
  }, [memberData, authState.user, formData.initialized]);
  
  // Fetch provinces when region changes
  useEffect(() => {
    if (formData.region) {
      fetchProvinces(formData.region);
    }
  }, [formData.region]);
  
  // Fetch cities when province changes
  useEffect(() => {
    if (formData.province) {
      fetchCities(formData.province);
    }
  }, [formData.province]);
  
  // Fetch barangays when city changes
  useEffect(() => {
    if (formData.city) {
      fetchBarangays(formData.city);
    }
  }, [formData.city]);
  
  // PSGC API functions
  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://psgc.gitlab.io/api/regions');
      const data = await response.json();
      setRegions(data.map(region => ({
        code: region.code,
        name: region.name
      })));
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
    setLoading(false);
  };
  
  const fetchProvinces = async (regionCode) => {
    setLoading(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces`);
      
      if (!response.ok) {
        // For NCR and other special cases, fetch cities directly
        const citiesResponse = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/cities`);
        
        if (citiesResponse.ok) {
          const data = await citiesResponse.json();
          setProvinces([]);
          setCities(data.map(city => ({
            code: city.code,
            name: city.name
          })));
          
          // Set province as N/A for regions like NCR
          setFormData(prev => ({ ...prev, province: 'N/A' }));
          setLocationNames(prev => ({ ...prev, provinceName: 'N/A' }));
        } else {
          throw new Error("Failed to fetch provinces or cities");
        }
      } else {
        const data = await response.json();
        setProvinces(data.map(province => ({
          code: province.code,
          name: province.name
        })));
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
    setLoading(false);
  };
  
  const fetchCities = async (provinceCode) => {
    setLoading(true);
    try {
      // If province is N/A (for NCR), cities are already fetched
      if (provinceCode === 'N/A') {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities`);
      
      if (response.ok) {
        const data = await response.json();
        setCities(data.map(city => ({
          code: city.code,
          name: city.name
        })));
      } else {
        throw new Error("Failed to fetch cities");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
    setLoading(false);
  };
  
  const fetchBarangays = async (cityCode) => {
    setLoading(true);
    try {
      const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays`);
      
      if (response.ok) {
        const data = await response.json();
        setBarangays(data.map(barangay => ({
          code: barangay.code,
          name: barangay.name
        })));
      } else {
        throw new Error("Failed to fetch barangays");
      }
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
    setLoading(false);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update location names when selection changes
    if (name === 'region') {
      const selectedRegion = regions.find(r => r.code === value);
      if (selectedRegion) {
        setLocationNames(prev => ({ ...prev, regionName: selectedRegion.name }));
      }
    } else if (name === 'province') {
      const selectedProvince = provinces.find(p => p.code === value);
      if (selectedProvince) {
        setLocationNames(prev => ({ ...prev, provinceName: selectedProvince.name }));
      }
    } else if (name === 'city') {
      const selectedCity = cities.find(c => c.code === value);
      if (selectedCity) {
        setLocationNames(prev => ({ ...prev, cityName: selectedCity.name }));
      }
    } else if (name === 'barangay') {
      const selectedBarangay = barangays.find(b => b.code === value);
      if (selectedBarangay) {
        setLocationNames(prev => ({ ...prev, barangayName: selectedBarangay.name }));
      }
    }
  };
  
  // Function to toggle address editing
  const toggleAddressEdit = () => {
    setEditingAddress(!editingAddress);
  };
  const handleView = () => {
  window.location.href = '/my-purchase';
  };

  // Validation function
  const validateForm = () => {
    
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      setFormError("Your cart is empty. Please add items to your cart before checking out.");
      return false;
    }
    
    setFormError(null);
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!validateForm()) {
      return;
    }
    
    // If on step 1 (shipping), move to step 2 (payment)
    if (step === 1) {
      setStep(2);
      return;
    }
    
    // Handle final submission
    try {
      setLoading(true);
      // Create a deep copy to prevent reference issues
      const finalData = {
        customerId: authState.user?._id,
        email:  authState.user?.email || formData.email.trim(),
        name: authState.user?.firstName + " " + authState.user?.lastName || formData.name.trim(),
        phone: authState.user?.phoneNumber || formData.phone.trim(),
        address: memberData.addressNo || formData.address.trim(),
        region: memberData.region || formData.region,
        province:  memberData.province || formData.province,
        city:  memberData.city  || formData.city,
        barangay:  memberData.barangay || formData.barangay,
        postalCode: formData.postalCode || formData.postalCode.trim(),
        landmark: formData.landmark   || formData.landmark.trim(),
        paymentMethod: formData.paymentMethod,
        regionName: formData.region,
        provinceName: locationNames.provinceName,
        cityName: locationNames.cityName,
        barangayName: locationNames.barangayName,
        orderItems: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        status: formData.paymentMethod === "Cash on Delivery" ? "Pending" : "Processing",
        paid: formData.paymentMethod !== "Cash on Delivery"
      };
      
      // Submit order
       const response = await fetch(import.meta.env.VITE_API_URL + '/api/order/place-order', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify(finalData)
       });
      
       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }
      
// Map through order items and delete each from cart
for (const item of finalData.orderItems) {
  try {
    const itemId = item.productId._id || item.productId;

    
    const deleteResponse = await fetch(import.meta.env.VITE_API_URL+`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok) {
    } else {
      console.error(`Failed to delete item ${itemId}:`, deleteResult);
    }
  } catch (deleteError) {
    console.error(`Error deleting item ${itemId}:`, deleteError);
    // Continue with the next item even if this one fails
  }
}

      // Move to confirmation step
      setStep(3);
      
          } catch (error) {
      console.error("Order error:", error);
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  const CartSummary = () => {
    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 150.00;
    const total = subtotal + shipping;
    
    return (
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">

        <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
        
        {/* Display cart items */}
        {cartItems.map((item) => (
          <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <img src={import.meta.env.VITE_API_URL + item.image} alt={item.name} className="h-16 w-16 rounded-md" />
              <div className="text-sm">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-gray-500">₱{item.price.toFixed(2)}</p>
                <p className="text-gray-500">Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="text-sm text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
        
        {/* Summary section */}
        <div className="border-t border-b py-4">
          <div className="flex justify-between text-sm py-2">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span>Shipping</span>
            <span>₱{shipping.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="flex justify-between font-medium pt-2">
          <span>Total</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>
    );
  };
  // Display member contact and address info if available
  const MemberInfoDisplay = () => {
    if (!memberData || !memberData.addressNo) return null;
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex justify-between items-start">
          <h3 className="text-md font-medium text-green-800 mb-2">Current Information</h3>
          <button 
            type="button"
            onClick={toggleAddressEdit}
            className="text-green-600 hover:text-green-800 flex items-center text-sm"
          >
            {editingAddress ? 'Use Existing Information' : 'Edit Information'}
            {!editingAddress && <Edit2 className="ml-1 h-4 w-4" />}
          </button>
        </div>
        <div className="text-sm text-green-700 space-y-2">
          <div>
            <p><strong>Email:</strong> {authState.user?.email}</p>
            <p><strong>Full Name:</strong> {authState.user?.firstName + " " + authState.user?.lastName }</p>
            <p><strong>Phone:</strong> {authState.user?.phoneNumber}</p>
          </div>
          <div className="border-t border-green-200 pt-2 mt-2">
            <p><strong>Address:</strong> {memberData.addressNo}</p>
            <p><strong>Region:</strong> {memberData.region}</p>
            <p><strong>Province:</strong> {memberData.province}</p>
            <p><strong>City:</strong> {memberData.city}</p>
            <p><strong>Barangay:</strong> {memberData.barangay}</p>
            <p><strong>Postal Code:</strong> {memberData.postalCode}</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center">
            <ol className="flex items-center w-full max-w-md">
              <li className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  1
                </span>
                <span className="ml-2 text-sm font-medium">Details</span>
                <div className="w-12 mx-2 h-0.5 bg-gray-200"></div>
              </li>
              <li className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  2
                </span>
                <span className="ml-2 text-sm font-medium">Payment</span>
                <div className="w-12 mx-2 h-0.5 bg-gray-200"></div>
              </li>
              <li className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                  3
                </span>
                <span className="ml-2 text-sm font-medium">Confirmation</span>
              </li>
            </ol>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Main Content */}
            <div className="md:w-2/3 p-6 md:p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Details</h2>
                  
                  {/* Display existing address information */}
                  <MemberInfoDisplay />
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                        disabled={hasExistingAddress && !editingAddress}
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                        disabled={hasExistingAddress && !editingAddress}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input 
                        type="text" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                        disabled={hasExistingAddress && !editingAddress}
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={formData.address}
                        onChange={handleChange}
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                        disabled={hasExistingAddress && !editingAddress}
                      />
                    </div>
                    
                    {/* Philippine Geographic Selection */}
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
                      {locationNames.regionName && formData.region && !editingAddress && (
                        <div className="mb-2 text-sm text-gray-600">
                          Current: {locationNames.regionName}
                        </div>
                      )}
                      <div className="relative">
                        <select 
                          id="region" 
                          name="region" 
                          value={formData.region}
                          onChange={handleChange}
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                          disabled={(loading || regions.length === 0) || (hasExistingAddress && !editingAddress)}
                        >
                          <option value="">Select Region</option>
                          {regions.map(region => (
                            <option key={region.code} value={region.code}>{region.name}</option>
                          ))}
                        </select>
                        {loading && regions.length === 0 && (
                          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
                            <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {formData.region && (provinces.length > 0 || formData.province === 'N/A') && (
                      <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-700">Province</label>
                        {locationNames.provinceName && formData.province && !editingAddress && (
                          <div className="mb-2 text-sm text-gray-600">
                            Current: {locationNames.provinceName}
                          </div>
                        )}
                        <div className="relative">
                          {formData.province === 'N/A' ? (
                            <input
                              type="text"
                              value="Not Applicable"
                              disabled
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500"
                            />
                          ) : (
                            <select 
                              id="province" 
                              name="province" 
                              value={formData.province}
                              onChange={handleChange}
                              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                              disabled={loading || (hasExistingAddress && !editingAddress)}
                            >
                              <option value="">Select Province</option>
                              {provinces.map(province => (
                                <option key={province.code} value={province.code}>{province.name}</option>
                              ))}
                            </select>
                          )}
                          {loading && (
                            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
                              <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {((formData.province && cities.length > 0) || (formData.region && provinces.length === 0 && cities.length > 0)) && (
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City/Municipality</label>
                        {locationNames.cityName && formData.city && !editingAddress && (
                          <div className="mb-2 text-sm text-gray-600">
                            Current: {locationNames.cityName}
                          </div>
                        )}
                        <div className="relative">
                          <select 
                            id="city" 
                            name="city" 
                            value={formData.city}
                            onChange={handleChange}
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                            disabled={loading || (hasExistingAddress && !editingAddress)}
                          >
                            <option value="">Select City/Municipality</option>
                            {cities.map(city => (
                              <option key={city.code} value={city.code}>{city.name}</option>
                            ))}
                          </select>
                          {loading && (
                            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
                              <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {formData.city && barangays.length > 0 && (
                      <div>
                        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">Barangay</label>
                        {locationNames.barangayName && formData.barangay && !editingAddress && (
                          <div className="mb-2 text-sm text-gray-600">
                            Current: {locationNames.barangayName}
                          </div>
                        )}
                        <div className="relative">
                          <select 
                            id="barangay" 
                            name="barangay" 
                            value={formData.barangay}
                            onChange={handleChange}
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                            disabled={loading || (hasExistingAddress && !editingAddress)}
                          >
                            <option value="">Select Barangay</option>
                            {barangays.map(barangay => (
                              <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                            ))}
                          </select>
                          {loading && (
                            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
                              <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input 
                        type="text"
                        id="postalCode" 
                        name="postalCode" 
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
                        disabled={hasExistingAddress && !editingAddress}
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Landmark:</label>
                      <textarea
  id="landmark"
  name="landmark"
  value={formData.landmark}
  onChange={handleChange}
  className={`mt-1 block w-full h-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${hasExistingAddress && !editingAddress ? 'bg-gray-100' : ''}`}
  disabled={hasExistingAddress && !editingAddress}
/>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
              
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="gcash">GCash</option>
                    </select>
                  </div>
              
                  {formData.paymentMethod === 'gcash' && (
                    <>
                      <div className="bg-gray-50 rounded-md p-4 flex items-center space-x-3">
                      </div>
                    </>
                  )}
              
                  {formData.paymentMethod === 'cod' && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 text-sm text-yellow-800">
                      You have selected <strong>Cash on Delivery</strong>. Please prepare the exact amount upon delivery.
                    </div>
                  )}
              
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Complete Order
                    </button>
                  </div>
                </form>
              </div>
              
              )}
              
              {step === 3 && (
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Thank you for your order!</h2>
                  <p className="text-gray-600">Your order has been placed and will be processed soon.</p>
                  <p className="text-gray-600">We've sent a confirmation email to {formData.email}</p>
                  <button 
                    type="button"
                    onClick={handleView}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    View Order Details
                  </button>
                </div>
              )}
            </div>
            
            {/* Order Summary Sidebar */}
            <div className="md:w-1/3 bg-gray-50 p-6 md:p-8">
              <CartSummary />
              
              {(step === 1 || step === 2) && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="flex space-x-3">
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              )}
              
              {(step === 1 || step === 2) && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
                  <p className="text-sm text-gray-600">Our customer service team is available 24/7. Feel free to contact us with any questions.</p>
                  <p className="text-sm text-green-600 mt-2 cursor-pointer hover:underline">Contact Support</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}