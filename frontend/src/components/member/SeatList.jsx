import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const Seatlist = () => {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionName, setSelectedRegionName] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedBarangayName, setSelectedBarangayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Current view state (region, province, city, barangay)
  const [currentView, setCurrentView] = useState("region");
const position = localStorage.getItem("owner")
  // Fetch all regions on initial load
  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://psgc.gitlab.io/api/regions/");
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
    setLoading(false);
   
  };

  // Fetch provinces for selected region
  const fetchProvincesByRegion = async (regionCode) => {
      setLoading(true);
      if(position === "e-Senator"){
        setLoading(false);
   
        return
        }
    try {
      const response = await fetch("https://psgc.gitlab.io/api/provinces/");
      const allProvinces = await response.json();
      // Filter provinces by the selected region
      const filteredProvinces = allProvinces.filter(
        (province) => province.regionCode === regionCode
      );
      setProvinces(filteredProvinces);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
    setLoading(false);
  };

  // Fetch cities for selected province
  const fetchCities = async (provinceCode) => {
    if(position === "e-Governor"){
        setLoading(false);
   
        return
        }
    setLoading(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`
      );
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
    setLoading(false);
  };

  // Fetch barangays for selected city
  const fetchBarangays = async (cityCode) => {
    if(position === "e-Mayor"){
      setLoading(false);
 
      return
      }

    setLoading(true);
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`
      );
      const data = await response.json();
      setBarangays(data);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
    setLoading(false);
  };

  // Load regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Event Handlers
  const handleRegionSelect = (region) => {
    setSelectedRegion(region.code);
    setSelectedRegionName(region.name);
    setSelectedProvince("");
    setSelectedProvinceName("");
    setSelectedCity("");
    setSelectedCityName("");
    setSelectedBarangay("");
    setSelectedBarangayName("");
    setProvinces([]);
    setCities([]);
    setBarangays([]);
        fetchProvincesByRegion(region.code);
    setCurrentView("province");
  };

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province.code);
    setSelectedProvinceName(province.name);
    setSelectedCity("");
    setSelectedCityName("");
    setSelectedBarangay("");
    setSelectedBarangayName("");
    setCities([]);
    setBarangays([]);
    if(position === "e-Senator"){

      setCurrentView("Summary");
    }

    fetchCities(province.code);
    setCurrentView("city");
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city.code);
    setSelectedCityName(city.name);
    setSelectedBarangay("");
    setSelectedBarangayName("");
    setBarangays([]);
    
    fetchBarangays(city.code);
    setCurrentView("barangay");
  };

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay.code);
    setSelectedBarangayName(barangay.name);
    setCurrentView("summary");
  };

  const goBack = () => {
    if (currentView === "province") {
      setCurrentView("region");
      setSelectedRegion("");
      setSelectedRegionName("");
    } else if (currentView === "city") {
      setCurrentView("province");
      setSelectedCity("");
      setSelectedCityName("");
    } else if (currentView === "barangay") {
      setCurrentView("city");
      setSelectedBarangay("");
      setSelectedBarangayName("");
    } else if (currentView === "summary") {
      setCurrentView("barangay");
    }
  };

  // Helper for card grid rendering
  const renderCardGrid = (items, onSelect) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {items.map((item) => (
          <div
            key={item.code}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-green-50 hover:border-green-500 cursor-pointer transition-colors"
            onClick={() => onSelect(item)}
          >
            <h3 className="font-medium text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.code}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render breadcrumb navigation
  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center space-x-2 text-sm mb-4 ">
        <button 
          className={`${selectedRegionName ? 'text-green-600 hover:underline' : 'text-gray-400'}`}
          onClick={() => selectedRegionName && setCurrentView("region")}
          disabled={!selectedRegionName}
        >
          {selectedRegionName || "Region"}
        </button>
        
        {selectedRegionName && (
          <>
            <span className="text-gray-400">/</span>
            <button 
              className={`${selectedProvinceName ? 'text-green-600 hover:underline' : 'text-gray-400'}`}
              onClick={() => selectedProvinceName && setCurrentView("province")}
              disabled={!selectedProvinceName}
            >
              {selectedProvinceName || "Province"}
            </button>
          </>
        )}
        
        {selectedProvinceName && (
          <>
            <span className="text-gray-400">/</span>
            <button 
              className={`${selectedCityName ? 'text-green-600 hover:underline' : 'text-gray-400'}`}
              onClick={() => selectedCityName && setCurrentView("city")}
              disabled={!selectedCityName}
            >
              {selectedCityName || "City/Municipality"}
            </button>
          </>
        )}
        
        {selectedCityName && (
          <>
            <span className="text-gray-400">/</span>
            <button 
              className={`${selectedBarangayName ? 'text-green-600 hover:underline' : 'text-gray-400'}`}
              onClick={() => selectedBarangayName && setCurrentView("barangay")}
              disabled={!selectedBarangayName}
            >
              {selectedBarangayName || "Barangay"}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Location Selector</h2>
      
      {renderBreadcrumb()}
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-green-500" />
        </div>
      )}
      
      {!loading && (
        <>
          {currentView === "region" && (
            <div>
              <h3 className="text-lg font-medium mb-2">Select Region</h3>
              {renderCardGrid(regions, handleRegionSelect)}
            </div>
          )}
          
          {currentView === "province" && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Select Province in {selectedRegionName}
              </h3>
              {renderCardGrid(provinces, handleProvinceSelect)}
            </div>
          )}
          
          {currentView === "city" && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Select City/Municipality in {selectedProvinceName}
              </h3>
              {renderCardGrid(cities, handleCitySelect)}
            </div>
          )}
          
          {currentView === "barangay" && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Select Barangay in {selectedCityName}
              </h3>
              {renderCardGrid(barangays, handleBarangaySelect)}
            </div>
          )}
          
          {position === "e-Senator" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Selected Spot </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Region:</span> {selectedRegionName}</p>
                {/* <p><span className="font-medium">Province:</span> {selectedProvinceName}</p>
                <p><span className="font-medium">City/Municipality:</span> {selectedCityName}</p>
                <p><span className="font-medium">Barangay:</span> {selectedBarangayName}</p> */}
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => console.log("Location selected:", {
                  region: { code: selectedRegion, name: selectedRegionName },
                  province: { code: selectedProvince, name: selectedProvinceName },
                  city: { code: selectedCity, name: selectedCityName },
                  barangay: { code: selectedBarangay, name: selectedBarangayName }
                })}
              >
                Confirm Selection
              </button>
            </div>
          )}
          {position === "e-Governor" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Selected Spot </h3>
              <div className="space-y-2">
                {/* <p><span className="font-medium">Region:</span> {selectedRegionName}</p> */}
                <p><span className="font-medium">Province:</span> {selectedProvinceName}</p>
                {/* <p><span className="font-medium">City/Municipality:</span> {selectedCityName}</p>
                <p><span className="font-medium">Barangay:</span> {selectedBarangayName}</p> */}
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => console.log("Location selected:", {
                  region: { code: selectedRegion, name: selectedRegionName },
                  province: { code: selectedProvince, name: selectedProvinceName },
                  city: { code: selectedCity, name: selectedCityName },
                  barangay: { code: selectedBarangay, name: selectedBarangayName }
                })}
              >
                Confirm Selection
              </button>
            </div>
          )}
          {position === "e-Mayor" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Selected Spot </h3>
              <div className="space-y-2">
                 <p><span className="font-medium">City/Municipality:</span> {selectedCityName}</p>
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => console.log("Location selected:", {
                  region: { code: selectedRegion, name: selectedRegionName },
                  province: { code: selectedProvince, name: selectedProvinceName },
                  city: { code: selectedCity, name: selectedCityName },
                  barangay: { code: selectedBarangay, name: selectedBarangayName }
                })}
              >
                Confirm Selection
              </button>
            </div>
          )}
          {position === "e-Captain" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Selected Spot </h3>
              <div className="space-y-2">
                 <p><span className="font-medium">Barangay:</span> {selectedBarangayName}</p>
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                onClick={() => console.log("Location selected:", {
                  region: { code: selectedRegion, name: selectedRegionName },
                  province: { code: selectedProvince, name: selectedProvinceName },
                  city: { code: selectedCity, name: selectedCityName },
                  barangay: { code: selectedBarangay, name: selectedBarangayName }
                })}
              >
                Confirm Selection
              </button>
            </div>
          )}
          
          {currentView !== "region" && (
            <button 
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={goBack}
            >
              Go Back
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Seatlist;