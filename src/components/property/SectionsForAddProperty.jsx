import { FiPlus, FiTrash2, FiUpload } from "../../icons/index.js";

export const BasicInformationSection = ({ propertyData, handleChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
        Basic Information
      </h2>

      {/* Row 1: Property Name */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Property Name
        </label>
        <input
          type="text"
          name="propertyName"
          value={propertyData.propertyName}
          onChange={handleChange}
          required
          placeholder="Enter property name"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
      </div>

      {/* Row 2: Branch and Phase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Branch
          </label>
          <input
            type="text"
            name="branch"
            value={propertyData.branch}
            onChange={handleChange}
            placeholder="Branch name"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Phase
          </label>
          <input
            type="text"
            name="phase"
            value={propertyData.phase}
            onChange={handleChange}
            placeholder="Phase number/name"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
      </div>

      {/* Row 3: State, City, Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            name="state"
            value={propertyData.state}
            onChange={handleChange}
            placeholder="State"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            name="city"
            value={propertyData.city}
            onChange={handleChange}
            placeholder="City"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={propertyData.location}
            onChange={handleChange}
            required
            placeholder="Property location"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
      </div>

      {/* Row 4: Full Address */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Full Address
        </label>
        <input
          name="address"
          value={propertyData.address}
          onChange={handleChange}
          required
          placeholder="Complete property address"
          rows="3"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
      </div>

      {/* Row 5: Contact Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Primary Contact
          </label>
          <input
            type="text"
            name="contacts.primary"
            value={propertyData.contacts.primary}
            onChange={handleChange}
            placeholder="Primary contact number"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Alternate Contact (Optional)
          </label>
          <input
            type="text"
            name="contacts.alternate"
            value={propertyData.contacts.alternate}
            onChange={handleChange}
            placeholder="Alternate contact number"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
      </div>

      {/* Row 6: Total Floors */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Total Floors
        </label>
        <input
          type="number"
          name="totalFloors"
          min="0"
          value={propertyData.totalFloors}
          onChange={handleChange}
          placeholder="Enter total number of floors"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
        <p className="text-xs text-gray-500">
          Enter the total number of floors in this property (0 for single-level
          properties)
        </p>
      </div>
    </div>
  );
};

export const FinancialDetailsSection = ({
  propertyData,
  handleChange,
  handleDepositChange,
  currentSharingPrice,
  handleSharingPriceChange,
  addSharingPrice,
  removeSharingPrice,
}) => {
  const handleTypeChange = (e) => {
    const value = e.target.value;
    // Remove non-numeric characters and "Sharing" text if present
    const numericValue = value.replace(/\D/g, "").replace(/\s*Sharing\s*/g, "");

    // Update the state with the numeric value + "Sharing"
    handleSharingPriceChange({
      target: {
        name: "type",
        value: numericValue ? `${numericValue} Sharing` : "",
      },
    });
  };

  const handleRazorpayChange = (e) => {
    const { name, value } = e.target;
    handleChange({
      target: {
        name: "razorpayCredentials",
        value: {
          ...propertyData.razorpayCredentials,
          [name]: value,
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
        Financial Details
      </h2>

      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Starting Price (₹)
        </label>
        <input
          type="number"
          min={0}
          onWheel={(e) => e.target.blur()}
          name="startingPrice"
          value={propertyData.startingPrice}
          onChange={handleChange}
          required
          placeholder="Base price per bed"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Refundable Deposit (₹)
          </label>
          <input
            type="number"
            min={0}
            onWheel={(e) => e.target.blur()}
            name="refundable"
            value={propertyData.deposit.refundable}
            onChange={handleDepositChange}
            placeholder="Refundable amount"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Non-Refundable Deposit (₹)
          </label>
          <input
            type="number"
            min={0}
            onWheel={(e) => e.target.blur()}
            name="nonRefundable"
            value={propertyData.deposit.nonRefundable}
            onChange={handleDepositChange}
            placeholder="Non-refundable amount"
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Sharing Prices
        </label>
        <div className="border border-gray-200 p-2 sm:p-3 rounded-lg bg-gray-50">
          <div className="flex flex-col gap-2 mb-2 sm:mb-3">
            <input
              type="text"
              name="type"
              placeholder="Enter number (e.g., 2)"
              value={currentSharingPrice.type}
              onChange={handleTypeChange}
              onWheel={(e) => e.target.blur()}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                min={0}
                name="price"
                placeholder="Price"
                value={currentSharingPrice.price}
                onChange={handleSharingPriceChange}
                onWheel={(e) => e.target.blur()}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
              />
              <button
                type="button"
                onClick={addSharingPrice}
                className="cursor-pointer flex items-center justify-center gap-1 px-3 py-2 text-sm sm:text-base text-white rounded-lg bg-[#4d44b5] hover:bg-[#3a32a0] transition-colors sm:w-auto"
              >
                <FiPlus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Display will now show "2 Sharing" automatically */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(propertyData.sharingPrices).map(([type, price]) => (
              <div
                key={type}
                className="flex items-center gap-1 bg-gray-100 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm text-gray-800"
              >
                <span>
                  {type}: ₹{price}
                </span>
                <button
                  type="button"
                  onClick={() => removeSharingPrice(type)}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Razorpay Credentials Section */}
      <div className="border-t border-gray-200 pt-4 mt-2">
        <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-3">
          Razorpay Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Razorpay Key ID *
            </label>
            <input
              type="text"
              name="keyId"
              value={propertyData.razorpayCredentials?.keyId || ""}
              onChange={handleRazorpayChange}
              required
              placeholder="Enter Razorpay Key ID"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
            />
          </div>

          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Razorpay Key Secret *
            </label>
            <div className="relative">
              <input
                type="password"
                name="keySecret"
                value={propertyData.razorpayCredentials?.keySecret || ""}
                onChange={handleRazorpayChange}
                required
                placeholder="Enter Razorpay Key Secret"
                className="w-full px-3 py-2 pr-10 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector(
                    'input[name="keySecret"]'
                  );
                  if (input.type === "password") {
                    input.type = "text";
                  } else {
                    input.type = "password";
                  }
                }}
                className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          * These credentials are required to process payments through Razorpay.
        </p>
      </div>
    </div>
  );
};

export const AdditionalInformationSection = ({
  propertyData,
  handleChange,
  newAmenity,
  setNewAmenity,
  addAmenity,
  removeAmenity,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
        Additional Information
      </h2>
      {/* Property Title */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Property Title
        </label>
        <input
          type="text"
          name="propertyTitle"
          value={propertyData.propertyTitle}
          onChange={handleChange}
          required
          placeholder="Enter a descriptive title for the property"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Preferred By */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Preferred By
          </label>
          <select
            name="preferredBy"
            value={propertyData.preferredBy}
            onChange={handleChange}
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
          >
            <option value="">Select preference</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Property Type
          </label>
          <select
            name="propertyType"
            value={propertyData.propertyType}
            onChange={handleChange}
            className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5] appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YTU1NjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
          >
            <option value="">Select property type</option>
            <option value="hostel">Hostel</option>
            <option value="apartment">Apartment</option>
            <option value="pg">PG</option>
            <option value="villa">Villa</option>
          </select>
        </div>
      </div>

      {/* Map URL */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Map URL
        </label>
        <input
          type="text"
          name="map"
          value={propertyData.map}
          onChange={handleChange}
          placeholder="Google Maps embed URL"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
        />
      </div>

      <div className="flex flex-col gap-1 sm:gap-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Amenities
        </label>
        <div className="border border-gray-200 p-2 sm:p-3 rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#4d44b5] focus:border-[#4d44b5]"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="cursor-pointer flex items-center justify-center gap-1 px-3 py-2 text-sm sm:text-base text-white rounded-lg bg-[#4d44b5] hover:bg-[#3a32a0] transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {propertyData.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-50 px-2 py-1 mt-3 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm text-blue-800"
              >
                <span>{amenity}</span>
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageUploadingSection = ({
  handleImageUpload,
  removeImage,
  propertyData,
}) => {
  return (
    <div className="flex flex-col gap-4 mt-7">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200"></h2>

      {/* Image Upload Sections */}
      <div className="grid grid-cols-1 gap-4">
        {/* Property Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Property Photos (Rooms, Facilities, etc.)
          </label>
          <div className="flex flex-col items-center justify-center w-full p-[17px] border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              name="propertyPhotos"
              onChange={(e) => handleImageUpload(e, "propertyPhotos")}
              multiple
              accept="image/*"
              className="hidden"
              id="propertyPhotos"
            />
            <label
              htmlFor="propertyPhotos"
              className="cursor-pointer flex flex-col items-center gap-1 text-center"
            >
              <div className="flex items-center gap-2">
                <FiUpload className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  Select property photos
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Upload room images, facilities
              </span>
            </label>
          </div>

          {/* Image Previews */}
          {propertyData.images.propertyPhotos?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                {propertyData.images.propertyPhotos.length} files selected
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {propertyData.images.propertyPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={
                        typeof photo === "string"
                          ? photo
                          : URL.createObjectURL(photo)
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("propertyPhotos", index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Event Photos (Activities at this property)
          </label>
          <div className="flex flex-col items-center justify-center w-full p-[17px] border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              name="eventPhotos"
              onChange={(e) => handleImageUpload(e, "eventPhotos")}
              multiple
              accept="image/*"
              className="hidden"
              id="eventPhotos"
            />
            <label
              htmlFor="eventPhotos"
              className="cursor-pointer flex flex-col items-center gap-1 text-center"
            >
              <div className="flex items-center gap-2">
                <FiUpload className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  Select files
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                Upload event highlights, activities and gatherings
              </span>{" "}
            </label>
          </div>

          {/* Image Previews */}
          {propertyData.images.eventPhotos?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                {propertyData.images.eventPhotos.length} files selected
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {propertyData.images.eventPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={
                        typeof photo === "string"
                          ? photo
                          : URL.createObjectURL(photo)
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("eventPhotos", index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Company Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-gray-700">
            Company Photos (Common images for all properties)
          </label>
          <div className="flex flex-col items-center justify-center w-full p-[17px] border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              name="companyPhotos"
              onChange={(e) => handleImageUpload(e, "companyPhotos")}
              multiple
              accept="image/*"
              className="hidden"
              id="companyPhotos"
            />
            <label
              htmlFor="companyPhotos"
              className="cursor-pointer flex flex-col items-center gap-1 text-center"
            >
              <div className="flex items-center gap-2">
                <FiUpload className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">
                  Select company photos
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Upload common company images
              </span>
            </label>
          </div>

          {/* Image Previews */}
          {propertyData.images.companyPhotos?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                {propertyData.images.companyPhotos.length} files selected
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {propertyData.images.companyPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={
                        typeof photo === "string"
                          ? photo
                          : URL.createObjectURL(photo)
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("companyPhotos", index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
