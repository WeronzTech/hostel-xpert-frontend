import {FiPlus, FiTrash2} from "../../icons/index.js";
import {Input, Select, Button, Row, Col, Typography, InputNumber} from "antd";
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";

const {Title, Text} = Typography;

export const BasicInformationSection = ({propertyData, handleChange}) => {
  const handleInputChange = (e) => {
    handleChange(e);
  };

  const handleSelectChange = (value, name) => {
    handleChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Title
        level={4}
        className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200"
      >
        Basic Information
      </Title>

      {/* Row 1: Property Name - Required */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          <Text className="text-xs sm:text-sm font-medium text-gray-700">
            Property Name
          </Text>
          <span className="text-red-500 text-sm">*</span>
        </div>
        <Input
          name="propertyName"
          value={propertyData.propertyName}
          onChange={handleInputChange}
          required
          placeholder="Enter property name"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
          size="large"
        />
      </div>

      {/* Row 2: Branch and Phase */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              Branch
            </Text>
            <Input
              name="branch"
              value={propertyData.branch}
              onChange={handleInputChange}
              placeholder="Branch name"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              Phase
            </Text>
            <Input
              type="text"
              name="phase"
              value={propertyData.phase}
              onChange={handleInputChange}
              placeholder="Phase number/name"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
      </Row>

      {/* Row 3: State, City, Location - Location Required */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              State
            </Text>
            <Input
              name="state"
              value={propertyData.state}
              onChange={handleInputChange}
              placeholder="State"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              City
            </Text>
            <Input
              name="city"
              value={propertyData.city}
              onChange={handleInputChange}
              placeholder="City"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-xs sm:text-sm font-medium text-gray-700">
                Location
              </Text>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Input
              name="location"
              value={propertyData.location}
              onChange={handleInputChange}
              required
              placeholder="Property location"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
      </Row>

      {/* Row 4: Full Address - Required */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          <Text className="text-xs sm:text-sm font-medium text-gray-700">
            Full Address
          </Text>
          <span className="text-red-500 text-sm">*</span>
        </div>
        <Input
          name="address"
          value={propertyData.address}
          onChange={handleInputChange}
          required
          placeholder="Complete property address"
          className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
          size="large"
        />
      </div>

      {/* Row 5: Contact Numbers - Primary Contact Required */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-xs sm:text-sm font-medium text-gray-700">
                Primary Contact
              </Text>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Input
              name="contacts.primary"
              value={propertyData.contacts?.primary}
              onChange={handleInputChange}
              required
              placeholder="Primary contact number"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              Alternate Contact
              <span className="text-gray-400 text-xs ml-1">(Optional)</span>
            </Text>
            <Input
              name="contacts.alternate"
              value={propertyData.contacts?.alternate}
              onChange={handleInputChange}
              placeholder="Alternate contact number"
              className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
              size="large"
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Preferred By - Required */}
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-xs sm:text-sm font-medium text-gray-700">
                Preferred By
              </Text>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Select
              name="preferredBy"
              value={propertyData.preferredBy}
              onChange={(value) => handleSelectChange(value, "preferredBy")}
              placeholder="Select preference"
              className="w-full"
              size="large"
              popupClassName="text-sm sm:text-base"
              dropdownStyle={{fontSize: "14px"}}
            >
              <Select.Option value="">Select preference</Select.Option>
              <Select.Option value="Ladies">Ladies</Select.Option>
              <Select.Option value="Gents">Gents</Select.Option>
              <Select.Option value="Co-living">Co-living</Select.Option>
            </Select>
          </div>
        </Col>

        {/* Property Type - Required */}
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-xs sm:text-sm font-medium text-gray-700">
                Property Type
              </Text>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Select
              name="propertyType"
              value={propertyData.propertyType}
              onChange={(value) => handleSelectChange(value, "propertyType")}
              placeholder="Select property type"
              className="w-full"
              size="large"
              popupClassName="text-sm sm:text-base"
              dropdownStyle={{fontSize: "14px"}}
            >
              <Select.Option value="">Select property type</Select.Option>
              <Select.Option value="Hostel">Hostel</Select.Option>
              <Select.Option value="PG">PG</Select.Option>
              <Select.Option value="Hostel & PG">Hostel & PG</Select.Option>
            </Select>
          </div>
        </Col>
      </Row>
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
  const handleRazorpayChange = (e) => {
    const {name, value} = e.target;
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

  // Check if there are any sharing prices
  const hasSharingPrices =
    Object.keys(propertyData.sharingPrices || {}).length > 0;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <Title
        level={4}
        className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200"
      >
        Financial Details
      </Title>

      {/* Deposit Fields */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              Refundable Deposit (₹) <span className="text-red-500">*</span>
            </Text>
            <InputNumber
              min={0}
              name="refundable"
              required
              value={propertyData.deposit?.refundable}
              onChange={(value) =>
                handleDepositChange({
                  target: {
                    name: "refundable",
                    value,
                  },
                })
              }
              placeholder="Enter refundable amount"
              className="!w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669] [&_.ant-input-number-input]:px-0 [&_.ant-input-number-input]:py-2 [&_.ant-input-number-handler-wrap]:hidden"
              size="large"
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
              style={{width: "100%"}}
              status={
                !propertyData.deposit?.refundable &&
                propertyData.deposit?.refundable !== 0
                  ? "error"
                  : ""
              }
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Text className="text-xs sm:text-sm font-medium text-gray-700">
              Non-Refundable Deposit (₹) <span className="text-red-500">*</span>
            </Text>
            <InputNumber
              min={0}
              name="nonRefundable"
              required
              value={propertyData.deposit?.nonRefundable}
              onChange={(value) =>
                handleDepositChange({
                  target: {
                    name: "nonRefundable",
                    value,
                  },
                })
              }
              placeholder="Enter non-refundable amount"
              className="!w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669] [&_.ant-input-number-input]:px-0 [&_.ant-input-number-input]:py-2 [&_.ant-input-number-handler-wrap]:hidden"
              size="large"
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\₹\s?|(,*)/g, "")}
              style={{width: "100%"}}
              status={
                !propertyData.deposit?.nonRefundable &&
                propertyData.deposit?.nonRefundable !== 0
                  ? "error"
                  : ""
              }
            />
          </div>
        </Col>
      </Row>

      {/* Sharing Prices Section */}
      <div className="flex flex-col gap-3">
        <Text className="text-xs sm:text-sm font-medium text-gray-700">
          Sharing Prices <span className="text-red-500">*</span>
        </Text>

        {/* Add New Sharing - Simple Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <Select
              value={
                currentSharingPrice.type === "Co-Living" ? "coliving" : "custom"
              }
              onChange={(value) => {
                if (value === "coliving") {
                  handleSharingPriceChange({
                    target: {
                      name: "type",
                      value: "Co-Living",
                    },
                  });
                } else {
                  handleSharingPriceChange({
                    target: {
                      name: "type",
                      value: "",
                    },
                  });
                }
              }}
              className="w-[120px]"
              size="large"
              defaultValue="custom"
            >
              <Select.Option value="custom">Custom</Select.Option>
              <Select.Option value="coliving">Co-Living</Select.Option>
            </Select>

            {currentSharingPrice.type === "Co-Living" ? (
              <div className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 flex items-center">
                Co-Living (2 Sharing)
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Enter number"
                required={!hasSharingPrices} // Only required if no sharing prices exist
                value={currentSharingPrice.type?.replace(" Sharing", "") || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleSharingPriceChange({
                    target: {
                      name: "type",
                      value: value ? `${value} Sharing` : "",
                    },
                  });
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669]"
                size="large"
                suffix={<span className="text-xs text-gray-400">Sharing</span>}
                status={
                  !hasSharingPrices &&
                  !currentSharingPrice.type &&
                  currentSharingPrice.price
                    ? "error"
                    : ""
                }
              />
            )}
          </div>

          <InputNumber
            min={0}
            name="price"
            placeholder="Price"
            required={!hasSharingPrices} // Only required if no sharing prices exist
            value={currentSharingPrice.price}
            onChange={(value) =>
              handleSharingPriceChange({
                target: {
                  name: "price",
                  value,
                },
              })
            }
            className="!w-full sm:!w-[150px] [&_.ant-input-number-handler-wrap]:hidden"
            size="large"
            formatter={(value) => `₹ ${value}`}
            parser={(value) => value.replace(/\₹\s?/g, "")}
            style={{width: "100%"}}
            status={
              !hasSharingPrices &&
              !currentSharingPrice.price &&
              currentSharingPrice.type
                ? "error"
                : ""
            }
          />
          <Button
            type="primary"
            onClick={addSharingPrice}
            disabled={!currentSharingPrice.type || !currentSharingPrice.price}
            className="flex items-center justify-center gap-1 px-4 py-2 text-sm text-white rounded-lg bg-[#059669] hover:bg-[#047857] disabled:bg-gray-300 disabled:cursor-not-allowed sm:w-[80px]"
            icon={<FiPlus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>

        {/* Display sharing prices - Simple Tags */}
        {hasSharingPrices ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(propertyData.sharingPrices || {}).map(
              ([type, price]) => (
                <div
                  key={type}
                  className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-md text-sm"
                >
                  {type === "Co-Living" ? (
                    <>
                      <span className="font-medium text-gray-700">
                        Co-Living:
                      </span>
                      <span className="text-gray-900">₹{price}</span>
                      <span className="text-xs text-gray-500">(2 Sharing)</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-gray-700">{type}:</span>
                      <span className="text-gray-900">₹{price}</span>
                    </>
                  )}
                  <button
                    onClick={() => removeSharingPrice(type)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-xs text-red-400 py-1">
            At least one sharing price is required.
          </p>
        )}
      </div>

      {/* Razorpay Credentials Section - NOT Required */}
      <div className="border-t border-gray-200 pt-4 mt-2">
        <Title
          level={5}
          className="text-md sm:text-lg font-semibold text-gray-800 mb-3"
        >
          Razorpay Credentials{" "}
          <span className="text-gray-400 text-sm font-normal">(Optional)</span>
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="flex flex-col gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <Text className="text-xs sm:text-sm font-medium text-gray-700">
                  Razorpay Key ID
                </Text>
              </div>
              <Input
                name="keyId"
                value={propertyData.razorpayCredentials?.keyId || ""}
                onChange={handleRazorpayChange}
                placeholder="Enter Razorpay Key ID (Optional)"
                className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
                size="large"
              />
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="flex flex-col gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <Text className="text-xs sm:text-sm font-medium text-gray-700">
                  Razorpay Key Secret
                </Text>
              </div>
              <Input.Password
                name="keySecret"
                value={propertyData.razorpayCredentials?.keySecret || ""}
                onChange={handleRazorpayChange}
                placeholder="Enter Razorpay Key Secret (Optional)"
                className="px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#059669] focus:border-[#059669]"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </div>
          </Col>
        </Row>

        <Text type="secondary" className="text-xs mt-3 block italic">
          These credentials are optional. You can add them later to enable
          payment processing through Razorpay.
        </Text>
      </div>
    </div>
  );
};
