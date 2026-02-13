import {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {addProperty} from "../../redux/propertiesSlice";
import {useNotification} from "../../ui/NotificationContext";
import {
  registerProperty,
  updateProperty,
  getPropertyDetails,
} from "../../hooks/property/useProperty.js";

import {
  BasicInformationSection,
  FinancialDetailsSection,
} from "../../components/property/SectionsForAddProperty.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";

const AddProperty = ({isEdit}) => {
  const {id} = useParams();
  const {user} = useSelector((state) => state.auth);
  const {showNotification} = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [propertyData, setPropertyData] = useState({
    propertyName: "",
    branch: "",
    phase: "",
    state: "",
    city: "",
    contacts: {
      primary: "",
      alternate: "",
    },
    location: "",
    address: "",
    sharingPrices: {},
    deposit: {
      refundable: "",
      nonRefundable: "",
    },
    razorpayCredentials: {
      keyId: "",
      keySecret: "",
    },
    preferredBy: "",
    propertyType: "",

    clientId: user?.id,
    adminName: user.name,
  });

  const [currentSharingPrice, setCurrentSharingPrice] = useState({
    type: "",
    price: "",
  });

  // Load property data in edit mode
  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          setIsLoading(true);
          const data = await getPropertyDetails(id);
          // Ensure razorpayCredentials exists in the loaded data
          setPropertyData({
            ...data,
            razorpayCredentials: data.razorpayCredentials || {
              keyId: "",
              keySecret: "",
            },
          });
        } catch (error) {
          console.error("Error fetching property details:", error);
          showNotification("Failed to load property details", "error");
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [isEdit, id, showNotification]);

  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;

    // Handle nested objects (like contacts, razorpayCredentials)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setPropertyData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      // Handle top-level properties
      setPropertyData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDepositChange = (e) => {
    const {name, value} = e.target;
    setPropertyData((prev) => ({
      ...prev,
      deposit: {
        ...prev.deposit,
        [name]: value,
      },
    }));
  };

  const handleRazorpayChange = (e) => {
    const {name, value} = e.target;
    setPropertyData((prev) => ({
      ...prev,
      razorpayCredentials: {
        ...prev.razorpayCredentials,
        [name]: value,
      },
    }));
  };

  const handleSharingPriceChange = (e) => {
    const {name, value} = e.target;
    setCurrentSharingPrice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSharingPrice = () => {
    if (currentSharingPrice.type && currentSharingPrice.price) {
      setPropertyData((prev) => ({
        ...prev,
        sharingPrices: {
          ...prev.sharingPrices,
          [currentSharingPrice.type]: Number(currentSharingPrice.price),
        },
      }));
      setCurrentSharingPrice({type: "", price: ""});
    }
  };

  const removeSharingPrice = (type) => {
    const newSharingPrices = {...propertyData.sharingPrices};
    delete newSharingPrices[type];
    setPropertyData((prev) => ({
      ...prev,
      sharingPrices: newSharingPrices,
    }));
  };

  // const validateForm = () => {
  //   if (
  //     !propertyData.razorpayCredentials.keyId ||
  //     !propertyData.razorpayCredentials.keySecret
  //   ) {
  //     showNotification("Razorpay Key ID and Key Secret are required", "error");
  //     return false;
  //   }
  //   return true;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   return;
    // }

    setIsLoading(true);
    try {
      const submitData = {
        ...propertyData,
        adminName: user.name,
        clientId: user.id,
        // Ensure razorpayCredentials is properly structured
        razorpayCredentials: {
          keyId: propertyData.razorpayCredentials.keyId,
          keySecret: propertyData.razorpayCredentials.keySecret,
        },
      };

      if (isEdit && id) {
        await updateProperty(id, submitData);
        showNotification("Property updated successfully!", "success");
      } else {
        await registerProperty(submitData);
        dispatch(
          addProperty({name: propertyData.propertyName, _id: propertyData._id}),
        );
        showNotification("Property registered successfully!", "success");
      }
      navigate("/property");
    } catch (error) {
      console.error("Error saving property:", error);
      showNotification(
        error.response?.data?.message ||
          (isEdit ? "Update failed" : "Registration failed"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title={isEdit ? "Edit Property" : "Register New Property"}
        subtitle={
          isEdit
            ? "Update details of the property"
            : "Add and manage residential properties in the system"
        }
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg sm:rounded-xl shadow-sm p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 gap-6 sm:gap-8">
          <BasicInformationSection
            propertyData={propertyData}
            handleChange={handleChange}
          />

          <FinancialDetailsSection
            propertyData={propertyData}
            handleChange={handleChange}
            handleDepositChange={handleDepositChange}
            handleRazorpayChange={handleRazorpayChange}
            currentSharingPrice={currentSharingPrice}
            handleSharingPriceChange={handleSharingPriceChange}
            addSharingPrice={addSharingPrice}
            removeSharingPrice={removeSharingPrice}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer px-4 py-2 sm:px-5 sm:py-2 text-sm sm:text-base bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#059669] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669] ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEdit ? "Updating..." : "Registering..."}
              </>
            ) : isEdit ? (
              "Update Property"
            ) : (
              "Register Property"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
