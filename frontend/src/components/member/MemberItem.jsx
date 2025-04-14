import React, { useEffect, useState } from "react";
import { checkAuth } from "../../middleware/auth";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { fetchItems } from "../../middleware/items";
import Navbar from "./Navbar";

const ItemsPage = () => {
  // Authentication State
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    error: null,
  });

  // Items and Filtering State
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const initialFormState = {
    name: "",
    price: "",
    description: "",
    category: "beverages",
    inStock: true,
    images: [], // Changed from single image to images array
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // For showing image previews

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: 1,
    customerName: "",
    email: "",
    address: "",
  });

  // Image Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Constants
  const categories = ["all", "beverages", "snacks", "food", "supplements"];
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Initial Data Load
  useEffect(() => {
    checkAuth(setAuthState);
    fetchItems(setItems);
  }, []);

  // Helper function to get complete image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/default-product-image.jpg"; // Default image if none provided
    if (imageUrl.startsWith("http")) return imageUrl; // If URL is already a full URL, return as is
    return `${API_BASE_URL}${imageUrl}`; // If it's a relative path, prepend the base API URL
  };

  // Filter Items
  const filteredItems =
    items?.data?.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    }) || [];

  // Handle file input change for multiple images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 images max
      const selectedFiles = files.slice(0, 5);
      
      // Create preview URLs for the images
      const newImagePreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prevUrls => [...prevUrls, ...newImagePreviewUrls]);
      
      // Update form data with the selected files
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...selectedFiles].slice(0, 5),
      });
    }
  };

  // Remove image from preview and form data
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Clean up the URL object
    newPreviewUrls.splice(index, 1);
    
    setFormData({
      ...formData,
      images: newImages,
    });
    setImagePreviewUrls(newPreviewUrls);
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (type !== "file") { // File inputs are handled separately
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();
      const memberId = authState.user?._id;

      // Append all form fields except images
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") {
          formDataToSubmit.append(key, value);
        }
      });

      // Append each image file with the key "images"
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          formDataToSubmit.append("images", image);
        });
      }
      
      formDataToSubmit.append("memberId", memberId);

      const response = await fetch(`${API_BASE_URL}/api/item/create-item`, {
        method: "POST",
        body: formDataToSubmit,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create item");

      // Refresh items list
      fetchItems(setItems);
      setIsFormOpen(false);
      setFormData(initialFormState);
      setImagePreviewUrls([]);
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();

      // Append all form fields except images
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") {
          formDataToSubmit.append(key, value);
        }
      });

      // Append each image file with the key "images"
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          formDataToSubmit.append("images", image);
        });
      }

      // Send PUT request to the backend
      const response = await fetch(
        `${API_BASE_URL}/api/item/update-item/${editingItem._id}`,
        {
          method: "PUT",
          body: formDataToSubmit,
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to update item");

      // Refresh items list and reset form
      fetchItems(setItems);
      setIsEditing(false);
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData(initialFormState);
      setImagePreviewUrls([]);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/item/delete-item/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to delete item");

        // Refresh items list
        fetchItems(setItems);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      inStock: item.inStock,
      images: [], // Reset images when editing
    });
    
    // If item has existing images, create preview URLs for them
    if (item.images && item.images.length > 0) {
      const existingImagePreviews = item.images.map(img => getImageUrl(img));
      setImagePreviewUrls(existingImagePreviews);
    } else if (item.imageUrl) {
      // For backward compatibility with old items that only have imageUrl
      setImagePreviewUrls([getImageUrl(item.imageUrl)]);
    } else {
      setImagePreviewUrls([]);
    }
    
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setFormData(initialFormState);
    setImagePreviewUrls([]);
    setIsFormOpen(true);
  };

  // Image carousel navigation
  const nextImage = (item) => {
    const imageList = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
    setCurrentImageIndex((prevIndex) => 
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (item) => {
    const imageList = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  // Purchase Handlers
  const openPurchaseModal = (item) => {
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
    setPurchaseForm({
      quantity: 1,
      customerName: "",
      email: "",
      address: "",
    });
    setCurrentImageIndex(0); // Reset to first image
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        itemId: selectedItem._id,
        quantity: purchaseForm.quantity,
        customerName: purchaseForm.customerName,
        email: purchaseForm.email,
        address: purchaseForm.address,
        totalAmount: selectedItem.price * purchaseForm.quantity,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create order");

      alert(
        `Thank you for your purchase!\n\nOrder Details:\n${
          purchaseForm.quantity
        }x ${selectedItem.name}\nTotal: ₱${(
          selectedItem.price * purchaseForm.quantity
        ).toLocaleString()}`
      );
      setIsPurchaseModalOpen(false);
      setPurchaseForm({
        quantity: 1,
        customerName: "",
        email: "",
        address: "",
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to process order. Please try again.");
    }
  };
  
  const admin = "admin";
  // Check if user is an admin
  const isAdmin = admin === "admin" || authState.user?.isAdmin;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="bg-emerald-600 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center">
              Products{" "}
            </h1>
            <p className="text-emerald-100 text-center text-lg">
              Show your products
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Controls */}
          {isAdmin && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Product Management
                </h2>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={20} />
                  Add New Product
                </button>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-4 py-2 pl-10 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-emerald-500"
                size={20}
              />
            </div>

            <div className="flex gap-4 items-center">
              <Filter size={20} className="text-emerald-600" />
              <select
                className="px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              // Determine image sources - use images array if available, fall back to imageUrl
              const imageSources = item.images && item.images.length > 0 
                ? item.images 
                : [item.imageUrl];
              
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl hover:bg-slate-100 hover:shadow-lg transition-shadow shadow-xl duration-300 border border-emerald-100"
                >
                  <div className="relative">
                    {/* Image carousel */}
                    <img
                      src={getImageUrl(imageSources[currentImageIndex] || imageSources[0])}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    
                    {/* Image navigation arrows - only show if multiple images */}
                    {imageSources.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(item);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} className="text-gray-800" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(item);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} className="text-gray-800" />
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          {currentImageIndex + 1} / {imageSources.length}
                        </div>
                      </>
                    )}
                    
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                        item.inStock
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-emerald-600">
                        ₱{item.price.toLocaleString()}
                      </span>
                      
                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors"
                            title="Edit Item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                        {item.category}
                      </span>
                      <button
                        onClick={() => openPurchaseModal(item)}
                        disabled={!item.inStock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          item.inStock
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        } transition-colors`}
                      >
                        <ShoppingBag size={16} />
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Items Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Create/Edit Item Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {isEditing ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={isEditing ? handleUpdate : handleCreate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₱)*
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category*
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        required
                      >
                        {categories
                          .filter((cat) => cat !== "all")
                          .map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images {isEditing ? "" : "*"}
                      </label>
                      <input
                        type="file"
                        name="images"
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required={!isEditing && imagePreviewUrls.length === 0}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload up to 5 images (max 5MB each). {isEditing && "Upload new images to replace current ones."}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="inStock"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="inStock"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Item is in stock
                      </label>
                    </div>
                  </div>

                  {/* Image previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h4>
                      <div className="grid grid-cols-5 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full object-cover rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      {isEditing ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Purchase Modal */}
          {isPurchaseModalOpen && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedItem.name}
                  </h3>
                  <button
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Product image carousel in purchase modal */}
                <div className="relative mb-4">
                  {/* Determine image sources for selected item */}
                  {(() => {
                    const imageSources = selectedItem.images && selectedItem.images.length > 0 
                      ? selectedItem.images 
                      : [selectedItem.imageUrl];
                      
                    return (
                      <>
                        <img
                          src={getImageUrl(imageSources[currentImageIndex] || imageSources[0])}
                          alt={selectedItem.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        
                        {/* Only show navigation controls if there are multiple images */}
                        {imageSources.length > 1 && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentImageIndex(prev => 
                                  prev === 0 ? imageSources.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100"
                            >
                              <ChevronLeft size={20} className="text-gray-800" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentImageIndex(prev => 
                                  prev === imageSources.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100"
                            >
                              <ChevronRight size={20} className="text-gray-800" />
                            </button>
                            
                            {/* Image indicator dots */}
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                              {imageSources.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentImageIndex(idx);
                                  }}
                                  className={`h-2 w-2 rounded-full ${
                                    currentImageIndex === idx 
                                      ? "bg-emerald-500" 
                                      : "bg-gray-300"
                                  }`}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                <form onSubmit={handlePurchase}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={purchaseForm.quantity}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={purchaseForm.customerName}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            customerName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={purchaseForm.email}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={purchaseForm.address}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            address: e.target.value,
                          })
                        }
                        required
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ₱
                          {(
                            selectedItem.price * purchaseForm.quantity
                          ).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={20} />
                        Confirm Purchase
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemsPage;