import {
  Row,
  Col,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Alert,
  Button,
} from "antd";
import dayjs from "dayjs";
import {useQuery} from "@tanstack/react-query";
import {getAvailableRoomsByProperty} from "../../../hooks/property/useProperty";
import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {ExtendStayModal} from "../../checkout/ExtendStayModal";

const PAYMENT_STATUSES = [
  {value: "pending", label: "Pending"},
  {value: "paid", label: "Paid"},
];

const ResidentStayDetails = ({resident, form}) => {
  const {properties} = useSelector((state) => state.properties);
  const userType = resident?.userType || "student";
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    resident?.stayDetails?.propertyId
  );
  const [selectedSharingType, setSelectedSharingType] = useState(
    resident?.stayDetails?.sharingType
  );
  const [extendModalVisible, setExtendModalVisible] = useState(false);

  const toValidDayjs = (value) => {
    if (!value) return null;

    if (dayjs.isDayjs(value) && value.isValid()) return value;

    if (value instanceof Date) return dayjs(value);

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  };

  // Initialize form with proper date values
  // useEffect(() => {
  //   if (resident && form) {
  //     const initialValues = {
  //       stayDetails: {
  //         ...resident.stayDetails,
  //         checkInDate: toValidDayjs(resident.stayDetails?.checkInDate),
  //         checkOutDate: toValidDayjs(
  //           resident.stayDetails?.extendDate ||
  //             resident.stayDetails?.checkOutDate
  //         ),
  //         joinDate: toValidDayjs(resident.stayDetails?.joinDate),
  //       },
  //       messDetails: {
  //         ...resident.messDetails,
  //         messStartDate: toValidDayjs(resident.messDetails?.messStartDate),
  //         messEndDate: toValidDayjs(resident.messDetails?.messEndDate),
  //       },
  //     };

  //     console.log("Form Initial Values:", initialValues);
  //     form.setFieldsValue(initialValues);
  //   }
  // }, [resident, form]);

  // Initialize form with proper date values
  useEffect(() => {
    if (resident && form) {
      const stayDetails = resident.stayDetails || {};
      const messDetails = resident.messDetails || {};

      const initialValues = {
        stayDetails: {
          ...stayDetails,
          checkInDate: toValidDayjs(stayDetails.checkInDate),
          // Always use extendDate if available, otherwise use checkOutDate
          checkOutDate: toValidDayjs(
            stayDetails.extendDate || stayDetails.checkOutDate
          ),
          joinDate: toValidDayjs(stayDetails.joinDate),
        },
        messDetails: {
          ...messDetails,
          messStartDate: toValidDayjs(messDetails.messStartDate),
          messEndDate: toValidDayjs(messDetails.messEndDate),
        },
      };

      console.log("Form Initial Values:", initialValues);

      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(initialValues);
      }, 0);
    }
  }, [resident, form]);

  // Fetch available rooms when property is selected
  const {
    data: availableRoomsData,
    isLoading: loadingRooms,
    error: roomsError,
  } = useQuery({
    queryKey: ["available-rooms", selectedPropertyId],
    queryFn: () => getAvailableRoomsByProperty(selectedPropertyId),
    enabled: !!selectedPropertyId,
    staleTime: 1000 * 60 * 5,
  });

  const availableRooms = availableRoomsData?.rooms || [];
  const availableSharingTypes = [
    ...new Set(availableRooms.map((room) => room.sharingType).filter(Boolean)),
  ];

  // Handle property change
  const handlePropertyChange = (propertyId) => {
    const selectedProperty = properties.find(
      (property) => property._id === propertyId
    );

    setSelectedPropertyId(propertyId);
    setSelectedSharingType(undefined);

    form.setFieldsValue({
      stayDetails: {
        propertyId,
        propertyName: selectedProperty?.name || "",
        sharingType: undefined,
        roomNumber: undefined,
      },
    });
  };

  // Handle sharing type change
  const handleSharingTypeChange = (type) => {
    setSelectedSharingType(type);
    form.setFieldsValue({
      stayDetails: {
        sharingType: type,
        roomNumber: undefined,
      },
    });
  };

  const handleRoomChange = (roomId) => {
    const selectedRoom = availableRooms.find((room) => room._id === roomId);

    form.setFieldsValue({
      stayDetails: {
        roomNumber: selectedRoom?.roomNo,
        roomId: selectedRoom?._id,
        propertyId: selectedRoom?.propertyId,
      },
    });
  };

  // Calculate date differences for daily rent and mess
  const calculateDateDifferences = () => {
    const stayDetails = form.getFieldValue("stayDetails") || {};
    const messDetails = form.getFieldValue("messDetails") || {};
    let stayDays = 0;
    let noOfDays = 0;
    let totalAmount = 0;

    // Calculate stay days and amount for dailyRent
    if (
      userType === "dailyRent" &&
      stayDetails.checkInDate &&
      stayDetails.checkOutDate
    ) {
      stayDays =
        dayjs(stayDetails.checkOutDate)
          .startOf("day")
          .diff(dayjs(stayDetails.checkInDate).startOf("day"), "day") + 1;

      totalAmount += stayDays * (stayDetails.dailyRent || 0);
      form.setFieldsValue({
        stayDetails: {
          ...stayDetails,
          noOfDays: stayDays,
        },
      });
    }

    // Calculate mess days and amount for messOnly
    if (
      userType === "messOnly" &&
      messDetails.messStartDate &&
      messDetails.messEndDate
    ) {
      noOfDays =
        dayjs(messDetails.messEndDate).diff(
          dayjs(messDetails.messStartDate),
          "day"
        ) + 1;
      totalAmount += noOfDays * (messDetails.rent || 0);
      form.setFieldsValue({
        messDetails: {
          ...messDetails,
          noOfDays: noOfDays,
        },
      });
    }

    // Update total amount if either calculation was done
    if (stayDays > 0 || noOfDays > 0) {
      form.setFieldsValue({
        financialDetails: {
          totalAmount: totalAmount,
        },
      });
    }
  };

  // Date disable functions
  const disabledCheckInDate = (current) => {
    const checkOut = form.getFieldValue(["stayDetails", "checkOutDate"]);
    return checkOut ? current && current > dayjs(checkOut) : false;
  };

  // const disabledCheckOutDate = (current) => {
  //   const checkIn = form.getFieldValue(["stayDetails", "checkInDate"]);
  //   return checkIn ? current && current < dayjs(checkIn) : false;
  // };
  const disabledCheckOutDate = (current) => {
    const checkIn = form.getFieldValue(["stayDetails", "checkInDate"]);
    if (!checkIn) return false;

    return current.isBefore(dayjs(checkIn).startOf("day"));
  };

  const disabledMessStartDate = (current) => {
    const messEnd = form.getFieldValue(["messDetails", "messEndDate"]);
    return messEnd ? current && current > dayjs(messEnd) : false;
  };

  const disabledMessEndDate = (current) => {
    const messStart = form.getFieldValue(["messDetails", "messStartDate"]);
    return messStart ? current && current < dayjs(messStart) : false;
  };

  // Property options
  const propertyOptions = properties
    .filter((property) => property._id)
    .map((property) => ({
      value: property._id,
      label: property.name,
    }));

  // Kitchen options (for messOnly)
  const kitchenOptions = Array.isArray(resident?.messDetails?.kitchenName)
    ? resident.messDetails.kitchenName.map((name) => ({
        value: name,
        label: name,
      }))
    : [];

  const hasPendingBalance =
    resident?.financialDetails?.pendingAmount !==
    resident?.financialDetails?.totalAmount;

  // Common form items with consistent 4-field layout
  const renderPropertyFields = () => (
    <>
      <Col xs={24} sm={12} md={12} lg={6} xl={6} className="mt-2">
        <Form.Item
          label={<span className="text-base">Property Name</span>}
          name={["stayDetails", "propertyId"]}
          rules={[{required: true, message: "Please select property"}]}
        >
          <Select
            size="large"
            placeholder="Select property"
            options={propertyOptions}
            showSearch
            optionFilterProp="label"
            onChange={handlePropertyChange}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
        <Form.Item
          label={<span className="text-base">Sharing Type</span>}
          name={["stayDetails", "sharingType"]}
          rules={[{required: true, message: "Please select sharing type"}]}
        >
          <Select
            size="large"
            placeholder="Select sharing type"
            options={availableSharingTypes.map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
            }))}
            showSearch
            onChange={handleSharingTypeChange}
            loading={loadingRooms}
            disabled={!selectedPropertyId}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
        <Form.Item
          label={<span className="text-base">Room Number</span>}
          name={["stayDetails", "roomNumber"]}
          rules={[{required: true, message: "Please select room number"}]}
        >
          <Select
            size="large"
            placeholder="Select room number"
            options={availableRooms
              .filter((room) => room.sharingType === selectedSharingType)
              .map((room) => ({value: room._id, label: room.roomNo}))}
            showSearch
            loading={loadingRooms}
            disabled={!selectedSharingType}
            onChange={handleRoomChange}
          />
        </Form.Item>
      </Col>

      {userType === "dailyRent" ? (
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Check-in Date</span>}
            name={["stayDetails", "checkInDate"]}
            rules={[{required: true, message: "Please select date"}]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD-MM-YYYY"
              disabled={hasPendingBalance}
              disabledDate={disabledCheckInDate}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
        </Col>
      ) : (
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Join Date</span>}
            name={["stayDetails", "joinDate"]}
            rules={[{required: true, message: "Please select date"}]}
          >
            <DatePicker size="large" className="w-full" format="DD-MM-YYYY" />
          </Form.Item>
        </Col>
      )}
    </>
  );

  const renderDailyRentFields = () => (
    <>
      {/* First row for daily rent */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Check-out Date</span>}
            name={["stayDetails", "checkOutDate"]}
            rules={[{required: true, message: "Please select check-out date"}]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD-MM-YYYY"
              disabled={hasPendingBalance}
              disabledDate={disabledCheckOutDate}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
          {hasPendingBalance && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setExtendModalVisible(true);
              }}
              type="primary"
            >
              Extend Check Out Date
            </Button>
          )}
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Number of Days</span>}
            name={["stayDetails", "noOfDays"]}
          >
            <InputNumber size="large" className="w-full" readOnly />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Rent/Day (₹)</span>}
            name={["stayDetails", "dailyRent"]}
            rules={[{required: true, message: "Please enter amount"}]}
          >
            <InputNumber
              size="large"
              className="w-full"
              placeholder="Enter amount"
              min={0}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Total Amount (₹)</span>}
            name={["financialDetails", "totalAmount"]}
          >
            <InputNumber
              size="large"
              className="w-full"
              readOnly
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Second row for payment status */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Payment Status</span>}
            name="paymentStatus"
            rules={[{required: true, message: "Please select payment status"}]}
          >
            <Select
              size="large"
              placeholder="Select status"
              options={PAYMENT_STATUSES}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}></Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}></Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}></Col>
      </Row>
    </>
  );

  const renderMessOnlyFields = () => (
    <>
      {/* First row for mess details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Kitchen Name</span>}
            name={["messDetails", "selectedKitchen"]}
            rules={[{required: true, message: "Please select kitchen"}]}
          >
            <Select
              size="large"
              placeholder="Select kitchen"
              options={kitchenOptions}
              showSearch
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Mess Stary Date</span>}
            name={["messDetails", "messStartDate"]}
            rules={[{required: true, message: "Please select start date"}]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD-MM-YYYY"
              disabledDate={disabledMessStartDate}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Mess End Date</span>}
            name={["messDetails", "messEndDate"]}
            rules={[{required: true, message: "Please select end date"}]}
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD-MM-YYYY"
              disabledDate={disabledMessEndDate}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Number of Days</span>}
            name={["messDetails", "noOfDays"]}
          >
            <InputNumber size="large" className="w-full" readOnly />
          </Form.Item>
        </Col>
      </Row>

      {/* Second row for payment details */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Rate/Day (₹)</span>}
            name={["messDetails", "rent"]}
            rules={[{required: true, message: "Please enter amount"}]}
          >
            <InputNumber
              size="large"
              className="w-full"
              placeholder="Enter amount"
              min={0}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              onChange={calculateDateDifferences}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Total Amount (₹)</span>}
            name={["financialDetails", "totalAmount"]}
          >
            <InputNumber
              size="large"
              className="w-full"
              readOnly
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Payment Status</span>}
            name="paymentStatus"
            rules={[{required: true, message: "Please select payment status"}]}
          >
            <Select
              size="large"
              placeholder="Select status"
              options={PAYMENT_STATUSES}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}></Col>
      </Row>
    </>
  );

  const renderStudentWorkerFields = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Monthly Rent (₹)</span>}
            name={["stayDetails", "monthlyRent"]}
            rules={[{required: true, message: "Please enter amount"}]}
          >
            <InputNumber
              size="large"
              className="w-full"
              placeholder="Enter amount"
              min={0}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Refundable Deposit (₹)</span>}
            name={["stayDetails", "refundableDeposit"]}
            rules={[{required: true, message: "Please enter deposit amount"}]}
          >
            <InputNumber
              size="large"
              className="w-full"
              placeholder="Enter amount"
              min={0}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Non-Refundable (₹)</span>}
            name={["stayDetails", "nonRefundableDeposit"]}
          >
            <InputNumber
              size="large"
              className="w-full"
              placeholder="Enter amount"
              min={0}
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>{" "}
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Deposit Status</span>}
            name={["stayDetails", "depositStatus"]}
            rules={[{required: true, message: "Please select deposit status"}]}
          >
            <Select
              size="large"
              placeholder="Select status"
              options={PAYMENT_STATUSES}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Payment Status</span>}
            name="paymentStatus"
            rules={[{required: true, message: "Please select payment status"}]}
          >
            <Select
              size="large"
              placeholder="Select status"
              options={PAYMENT_STATUSES}
            />
          </Form.Item>
        </Col>{" "}
      </Row>
    </>
  );

  // Main render
  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
        {userType === "dailyRent"
          ? "Stay Details (Daily Rent)"
          : userType === "messOnly"
          ? "Mess Details"
          : "Stay Details"}
      </h3>

      {/* Property Fields - Always shown for all user types except messOnly */}
      {userType !== "messOnly" && (
        <Row gutter={[16, 16]}>{renderPropertyFields()}</Row>
      )}

      {/* Conditional rendering based on user type */}
      {userType === "dailyRent" && renderDailyRentFields()}
      {userType === "messOnly" && renderMessOnlyFields()}
      {(userType === "student" || userType === "worker") &&
        renderStudentWorkerFields()}

      <ExtendStayModal
        visible={extendModalVisible}
        onCancel={() => setExtendModalVisible(false)}
        userId={resident?._id}
        currentCheckOutDate={resident?.stayDetails?.checkOutDate}
        extendDate={resident?.stayDetails?.extendDate}
        currentRent={resident?.stayDetails?.dailyRent}
        userType={resident?.userType}
      />
    </div>
  );
};

export default ResidentStayDetails;
