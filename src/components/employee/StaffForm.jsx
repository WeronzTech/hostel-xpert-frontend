import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import PageHeader from "../../components/ui/PageHeader";

const StaffForm = ({loadingProperties, onSubmit, clientId, isSubmitting}) => {
  const navigate = useNavigate();

  // Get properties from Redux store
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties,
  );

  const [currentProperty, setCurrentProperty] = useState(
    selectedProperty || "",
  );

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    contactNumber: "",
    address: "",
    email: "",
    type: "",
    role: "",
    aadhar: "",
    joinDate: "",
    paySchedule: "",
    status: "Active",
    property: currentProperty || "",
    salary: 0,
    salaryStatus: "Pending",
    clientId: clientId,
    photo: null,
    adharFrontImage: null,
    adharBackImage: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    photo: null,
    adharFrontImage: null,
    adharBackImage: null,
  });

  const handleFileChange = (e) => {
    const {name, files} = e.target;
    const file = files[0];

    if (file) {
      setFormData((prev) => ({...prev, [name]: file}));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({...prev, [name]: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;

    if (name === "property") {
      // Handle property selection
      setCurrentProperty(value);
      setFormData((prev) => ({
        ...prev,
        property: value,
      }));
    } else {
      setFormData((prev) => ({...prev, [name]: value}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "name",
      "gender",
      "contactNumber",
      "type",
      "role",
      "joinDate",
      "paySchedule",
      "salary",
      "photo",
      "adharFrontImage",
      "adharBackImage",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Validate property
    if (!formData.property) {
      newErrors.property = "Property is required";
    }

    // Validate salary
    if (formData.salary <= 0) {
      newErrors.salary = "Salary must be greater than 0";
    }

    // Validate contact number
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }

    // Validate email if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "property") {
        // Send property ID directly
        formDataToSend.append("property", value);
      } else if (value instanceof File) {
        formDataToSend.append(key, value);
      } else if (value !== null && value !== undefined) {
        formDataToSend.append(key, value.toString());
      }
    });

    // Debug: Log what we're sending
    console.log("Submitting form data:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    await onSubmit(formDataToSend);
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Add New Staff Member"
        subtitle="Register and manage staff members in the system"
      />

      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-lg sm:rounded-xl shadow-sm p-5 sm:p-6"
        encType="multipart/form-data"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 gap-6 sm:gap-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profile Photo *
                </label>
                <div className="mt-1 flex items-center">
                  <div className="relative rounded-full overflow-hidden h-16 w-16 bg-gray-200">
                    {preview.photo ? (
                      <img
                        src={preview.photo}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label htmlFor="photo-upload" className="ml-5 cursor-pointer">
                    <span className="py-2 px-3 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669]">
                      Change
                    </span>
                    <input
                      id="photo-upload"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {errors.photo && (
                  <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 px-3 py-2 block w-full rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`mt-1 px-3 py-2 block w-full rounded-md ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Aadhar Front Image Upload */}
              <div className="mt-6">
                <label
                  htmlFor="adharFrontImage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhar Front Image *
                </label>
                <div className="mt-1">
                  {preview.adharFrontImage ? (
                    <img
                      src={preview.adharFrontImage}
                      alt="Aadhar front preview"
                      className="h-32 w-full object-contain border rounded-md"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="adharFrontImage"
                    name="adharFrontImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#059669] file:text-white hover:file:bg-[#059669]"
                  />
                </div>
                {errors.adharFrontImage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.adharFrontImage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`mt-1 px-3 py-2 block w-full rounded-md ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  placeholder="Enter 10-digit contact number"
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 px-3 py-2 block w-full rounded-md ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm"
                  placeholder="Enter complete address"
                />
              </div>

              {/* Aadhar Back Image Upload */}
              <div>
                <label
                  htmlFor="adharBackImage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhar Back Image *
                </label>
                <div className="mt-1">
                  {preview.adharBackImage ? (
                    <img
                      src={preview.adharBackImage}
                      alt="Aadhar back preview"
                      className="h-32 w-full object-contain border rounded-md"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="adharBackImage"
                    name="adharBackImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#059669] file:text-white hover:file:bg-[#059669]"
                  />
                </div>
                {errors.adharBackImage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.adharBackImage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Employment Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Staff Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`mt-1 px-3 py-2 block w-full rounded-md ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  >
                    <option value="">Select Type</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role *
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`mt-1 px-3 py-2 block w-full rounded-md ${
                      errors.role ? "border-red-500" : "border-gray-300"
                    } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                    placeholder="Enter staff role"
                  />
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="joinDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Join Date *
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    className={`mt-1 px-3 py-2 block w-full rounded-md ${
                      errors.joinDate ? "border-red-500" : "border-gray-300"
                    } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  />
                  {errors.joinDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.joinDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="paySchedule"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pay Schedule *
                  </label>
                  <select
                    id="paySchedule"
                    name="paySchedule"
                    value={formData.paySchedule}
                    onChange={handleChange}
                    className={`mt-1 px-3 py-2 block w-full rounded-md ${
                      errors.paySchedule ? "border-red-500" : "border-gray-300"
                    } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  >
                    <option value="">Select Schedule</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                  {errors.paySchedule && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.paySchedule}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property & Salary Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Property & Salary
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="property"
                  className="block text-sm font-medium text-gray-700"
                >
                  Property *
                </label>
                <select
                  id="property"
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  className={`mt-1 px-3 py-2 block w-full rounded-md ${
                    errors.property ? "border-red-500" : "border-gray-300"
                  } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  disabled={loadingProperties}
                >
                  <option value="">Select Property</option>
                  {properties &&
                    properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.propertyName}
                      </option>
                    ))}
                </select>
                {loadingProperties && (
                  <p className="mt-1 text-sm text-gray-500">
                    Loading properties...
                  </p>
                )}
                {errors.property && (
                  <p className="mt-1 text-sm text-red-600">{errors.property}</p>
                )}
                {properties &&
                  properties.length === 0 &&
                  !loadingProperties && (
                    <p className="mt-1 text-sm text-yellow-600">
                      No properties available. Please create a property first.
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-700"
                >
                  Salary (₹) *
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`mt-1 px-3 py-2 block w-full rounded-md ${
                    errors.salary ? "border-red-500" : "border-gray-300"
                  } border shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm`}
                  placeholder="Enter salary amount"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="salaryStatus"
                  className="block text-sm font-medium text-gray-700"
                >
                  Salary Status
                </label>
                <select
                  id="salaryStatus"
                  name="salaryStatus"
                  value={formData.salaryStatus}
                  onChange={handleChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="aadhar"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aadhar Number
                </label>
                <input
                  type="text"
                  id="aadhar"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="mt-1 px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#059669] focus:ring-[#059669] sm:text-sm"
                  placeholder="Enter Aadhar number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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
            disabled={isSubmitting || (properties && properties.length === 0)}
            className={`cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#059669] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669] ${
              isSubmitting || (properties && properties.length === 0)
                ? "opacity-75 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
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
                Adding...
              </>
            ) : (
              "Add Staff Member"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
