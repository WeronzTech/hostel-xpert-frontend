// import {
//   Button,
//   Card,
//   Descriptions,
//   Typography,
//   Grid,
//   ConfigProvider,
//   Tag,
// } from "antd";
// import {CloseOutlined} from "@ant-design/icons";
// import dayjs from "dayjs";
// import {redButton} from "../../../data/common/color";
// import {useNavigate} from "react-router-dom";

// const {useBreakpoint} = Grid;

// export const ConfirmationStep = ({
//   formData,
//   handleReject,
//   isMessOnly,
//   isDailyRent,
//   isRejoin,
// }) => {
//   const navigate = useNavigate();
//   const screens = useBreakpoint();

//   const isMobile = !screens.md;
//   const descriptionColumn = isMobile ? 1 : 2;
//   const labelWidth = isMobile ? "100px" : "180px";
//   const titleLevel = isMobile ? 4 : 4;

//   // Helper function to get the appropriate section title
//   const getPropertySectionTitle = () => {
//     if (isMessOnly) return "Kitchen Information";
//     if (isDailyRent) return "Stay Information";
//     return "Property Information";
//   };

//   // Helper to get the appropriate date label
//   const getDateLabel = () => {
//     if (isMessOnly) return "Period";
//     if (isDailyRent) return "Period";
//     return "Check-in";
//   };

//   // Helper to format date range
//   const formatDateRange = (startDate, endDate) => {
//     if (!startDate || !endDate) return "Not specified";
//     return `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format(
//       "DD MMM YYYY"
//     )}`;
//   };

//   // Calculate total amount based on user type
//   const getTotalAmount = () => {
//     if (isDailyRent) {
//       return Number(formData.financialDetails?.totalAmount) || 0;
//     }
//     if (isMessOnly) {
//       return Number(formData.financialDetails?.totalAmount) || 0;
//     }

//     return (
//       Number(formData.refundableDeposit) +
//         Number(formData.nonRefundableDeposit) || 0
//     );
//   };

//   const renderMealTypes = (mealTypes) => {
//     if (!mealTypes || mealTypes.length === 0) return "Not specified";

//     return (
//       <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
//         {mealTypes.map((meal) => (
//           <Tag color="blue" key={meal}>
//             {meal.charAt(0).toUpperCase() + meal.slice(1)}
//           </Tag>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <Card
//       title={
//         <Typography.Title level={titleLevel} style={{margin: 0}}>
//           Confirmation
//         </Typography.Title>
//       }
//       extra={
//         isRejoin ? (
//           <Button
//             type="text"
//             icon={<CloseOutlined />}
//             onClick={() => navigate(-1)}
//           />
//         ) : (
//           <ConfigProvider theme={redButton}>
//             <Button
//               onClick={handleReject}
//               type="primary"
//               icon={<CloseOutlined />}
//             >
//               Reject
//             </Button>
//           </ConfigProvider>
//         )
//       }
//       headStyle={{padding: isMobile ? "12px" : "16px"}}
//       bodyStyle={{padding: isMobile ? "12px" : "16px"}}
//     >
//       {/* Personal Information Section */}
//       <Card
//         title="Personal Information"
//         style={{marginBottom: 24}}
//         headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
//         bodyStyle={{padding: 0}}
//       >
//         <Descriptions
//           column={descriptionColumn}
//           bordered
//           size="small"
//           labelStyle={{
//             width: labelWidth,
//             background: "#f8f9fa",
//             fontWeight: 500,
//           }}
//         >
//           <Descriptions.Item label="Full Name" span={descriptionColumn}>
//             <Typography.Text strong>{formData.name}</Typography.Text>
//           </Descriptions.Item>
//           <Descriptions.Item label="Contact">
//             <Typography.Text>{formData.contact}</Typography.Text>
//           </Descriptions.Item>
//           <Descriptions.Item label="Email">
//             <Typography.Text>{formData.email}</Typography.Text>
//           </Descriptions.Item>
//         </Descriptions>
//       </Card>

//       {/* Property/Kitchen/Stay Information Section */}
//       <Card
//         title={getPropertySectionTitle()}
//         style={{marginBottom: 24}}
//         headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
//         bodyStyle={{padding: 0}}
//       >
//         <Descriptions
//           column={descriptionColumn}
//           bordered
//           size="small"
//           labelStyle={{
//             width: labelWidth,
//             background: "#f8f9fa",
//             fontWeight: 500,
//           }}
//         >
//           <Descriptions.Item
//             label={
//               isMessOnly ? "Kitchen" : isDailyRent ? "Property" : "Property"
//             }
//             span={descriptionColumn}
//           >
//             <Typography.Text strong>
//               {isMessOnly ? formData.kitchen : formData.property}
//             </Typography.Text>
//           </Descriptions.Item>

//           {isMessOnly && (
//             <Descriptions.Item label="Meals" span={descriptionColumn}>
//               {renderMealTypes(formData.messDetails?.mealType)}
//             </Descriptions.Item>
//           )}

//           {!isMessOnly && !isDailyRent && (
//             <Descriptions.Item label="Room">
//               <Typography.Text>
//                 {formData.roomNumber
//                   ? `Room ${formData.roomNumber} (${formData.sharingType})`
//                   : "Not assigned"}
//               </Typography.Text>
//             </Descriptions.Item>
//           )}

//           <Descriptions.Item label={getDateLabel()}>
//             <Typography.Text>
//               {isDailyRent
//                 ? formatDateRange(
//                     formData.stayDetails?.checkInDate,
//                     formData.stayDetails?.checkOutDate
//                   )
//                 : isMessOnly
//                 ? formatDateRange(
//                     formData.messDetails?.messStartDate,
//                     formData.messDetails?.messEndDate
//                   )
//                 : formData.joinDate
//                 ? dayjs(formData.joinDate).format("DD MMM YYYY")
//                 : "Not specified"}
//             </Typography.Text>
//           </Descriptions.Item>

//           {(isDailyRent || isMessOnly) && (
//             <Descriptions.Item label="Duration">
//               <Typography.Text>
//                 {isDailyRent
//                   ? `${formData.stayDetails?.noOfDays || 0} days`
//                   : `${formData.messDetails?.noOfDays || 0} days`}
//               </Typography.Text>
//             </Descriptions.Item>
//           )}
//         </Descriptions>
//       </Card>

//       {/* Payment Section */}
//       <Card
//         title="Payment Summary"
//         headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
//         bodyStyle={{padding: 0}}
//       >
//         <Descriptions
//           column={descriptionColumn}
//           bordered
//           size="small"
//           labelStyle={{
//             width: labelWidth,
//             background: "#f8f9fa",
//             fontWeight: 500,
//           }}
//         >
//           {isDailyRent ? (
//             <>
//               <Descriptions.Item label="Daily Rent">
//                 <Typography.Text strong>
//                   ₹{formData.stayDetails?.dailyRent || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label="Total Amount">
//                 <Typography.Text strong>
//                   ₹{formData.financialDetails?.totalAmount || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//             </>
//           ) : isMessOnly ? (
//             <>
//               <Descriptions.Item label="Mess Rent">
//                 <Typography.Text strong>
//                   ₹{formData.messDetails?.rent || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label="Total Amount">
//                 <Typography.Text strong>
//                   ₹{formData.financialDetails?.totalAmount || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//             </>
//           ) : (
//             <>
//               <Descriptions.Item label="Monthly Rent">
//                 <Typography.Text strong>
//                   ₹{formData.rentAmount || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label="Refundable Deposit">
//                 <Typography.Text>
//                   ₹{formData.refundableDeposit || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label="Non-Refundable">
//                 <Typography.Text>
//                   ₹{formData.nonRefundableDeposit || "0"}
//                 </Typography.Text>
//               </Descriptions.Item>
//               <Descriptions.Item label="Total Deposit">
//                 <Typography.Text strong>₹{getTotalAmount()}</Typography.Text>
//               </Descriptions.Item>
//             </>
//           )}
//         </Descriptions>
//       </Card>

//       <Typography.Text
//         type="secondary"
//         style={{
//           display: "block",
//           marginTop: 16,
//           fontSize: isMobile ? 12 : 14,
//         }}
//       >
//         Please review all information before submitting.
//       </Typography.Text>
//     </Card>
//   );
// };
import {
  Button,
  Card,
  Descriptions,
  Typography,
  Grid,
  ConfigProvider,
  Tag,
} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {redButton} from "../../../data/common/color";
import {useNavigate} from "react-router-dom";

const {useBreakpoint} = Grid;

export const ConfirmationStep = ({
  formData,
  handleReject,
  isMessOnly,
  isDailyRent,
  isRejoin,
}) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const descriptionColumn = isMobile ? 1 : 2;
  const labelWidth = isMobile ? "100px" : "180px";
  const titleLevel = isMobile ? 4 : 4;

  // Check if user is a student
  const isStudent =
    formData.userType === "student" || formData.userType === "Student";

  // Helper function to get the appropriate section title
  const getPropertySectionTitle = () => {
    if (isMessOnly) return "Kitchen Information";
    if (isDailyRent) return "Stay Information";
    return "Property Information";
  };

  // Helper to get the appropriate date label
  const getDateLabel = () => {
    if (isMessOnly) return "Period";
    if (isDailyRent) return "Period";
    return "Check-in";
  };

  // Helper to format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "Not specified";
    return `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format(
      "DD MMM YYYY"
    )}`;
  };

  // Helper to format bus validity date range
  const formatBusValidity = () => {
    if (!formData.busValidityStartDate || !formData.busValidityEndDate)
      return "Not specified";
    return `${dayjs(formData.busValidityStartDate).format(
      "DD MMM YYYY"
    )} - ${dayjs(formData.busValidityEndDate).format("DD MMM YYYY")}`;
  };

  // Calculate total amount based on user type
  const getTotalAmount = () => {
    if (isDailyRent) {
      return Number(formData.financialDetails?.totalAmount) || 0;
    }
    if (isMessOnly) {
      return Number(formData.financialDetails?.totalAmount) || 0;
    }

    let totalDeposit =
      Number(formData.refundableDeposit || 0) +
      Number(formData.nonRefundableDeposit || 0);

    // Add bus fee for students if required
    if (isStudent && formData.busRequired === "yes") {
      totalDeposit += Number(formData.busYearlyAmount || 0);
    }

    return totalDeposit + Number(formData.rentAmount);
  };

  // Calculate total payment summary for regular users (including bus fee if applicable)
  const getTotalPaymentSummary = () => {
    if (isDailyRent || isMessOnly) return null;

    const items = [
      {label: "Monthly Rent", value: formData.rentAmount || "0"},
      {label: "Refundable Deposit", value: formData.refundableDeposit || "0"},
      {
        label: "Non-Refundable",
        value: formData.nonRefundableDeposit || "0",
      },
    ];

    // Add bus fee if student and bus is required
    if (isStudent && formData.busRequired === "yes") {
      items.push({
        label: "Bus Fee",
        value: formData.busYearlyAmount || "0",
      });
    }

    return items;
  };

  const renderMealTypes = (mealTypes) => {
    if (!mealTypes || mealTypes.length === 0) return "Not specified";

    return (
      <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
        {mealTypes.map((meal) => (
          <Tag color="blue" key={meal}>
            {meal.charAt(0).toUpperCase() + meal.slice(1)}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <Card
      title={
        <Typography.Title level={titleLevel} style={{margin: 0}}>
          Confirmation
        </Typography.Title>
      }
      extra={
        isRejoin ? (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate(-1)}
          />
        ) : (
          <ConfigProvider theme={redButton}>
            <Button
              onClick={handleReject}
              type="primary"
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
          </ConfigProvider>
        )
      }
      headStyle={{padding: isMobile ? "12px" : "16px"}}
      bodyStyle={{padding: isMobile ? "12px" : "16px"}}
    >
      {/* Personal Information Section */}
      <Card
        title="Personal Information"
        style={{marginBottom: 24}}
        headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
        bodyStyle={{padding: 0}}
      >
        <Descriptions
          column={descriptionColumn}
          bordered
          size="small"
          labelStyle={{
            width: labelWidth,
            background: "#f8f9fa",
            fontWeight: 500,
          }}
        >
          <Descriptions.Item label="Full Name" span={descriptionColumn}>
            <Typography.Text strong>{formData.name}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Contact">
            <Typography.Text>{formData.contact}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Typography.Text>{formData.email}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      {/* Property/Kitchen/Stay Information Section */}
      <Card
        title={getPropertySectionTitle()}
        style={{marginBottom: 24}}
        headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
        bodyStyle={{padding: 0}}
      >
        <Descriptions
          column={descriptionColumn}
          bordered
          size="small"
          labelStyle={{
            width: labelWidth,
            background: "#f8f9fa",
            fontWeight: 500,
          }}
        >
          <Descriptions.Item
            label={
              isMessOnly ? "Kitchen" : isDailyRent ? "Property" : "Property"
            }
            span={descriptionColumn}
          >
            <Typography.Text strong>
              {isMessOnly ? formData.kitchen : formData.property}
            </Typography.Text>
          </Descriptions.Item>

          {isMessOnly && (
            <Descriptions.Item label="Meals" span={descriptionColumn}>
              {renderMealTypes(formData.messDetails?.mealType)}
            </Descriptions.Item>
          )}

          {!isMessOnly && !isDailyRent && (
            <Descriptions.Item label="Room">
              <Typography.Text>
                {formData.roomNumber
                  ? `Room ${formData.roomNumber} (${formData.sharingType})`
                  : "Not assigned"}
              </Typography.Text>
            </Descriptions.Item>
          )}

          <Descriptions.Item label={getDateLabel()}>
            <Typography.Text>
              {isDailyRent
                ? formatDateRange(
                    formData.stayDetails?.checkInDate,
                    formData.stayDetails?.checkOutDate
                  )
                : isMessOnly
                ? formatDateRange(
                    formData.messDetails?.messStartDate,
                    formData.messDetails?.messEndDate
                  )
                : formData.joinDate
                ? dayjs(formData.joinDate).format("DD MMM YYYY")
                : "Not specified"}
            </Typography.Text>
          </Descriptions.Item>

          {(isDailyRent || isMessOnly) && (
            <Descriptions.Item label="Duration">
              <Typography.Text>
                {isDailyRent
                  ? `${formData.stayDetails?.noOfDays || 0} days`
                  : `${formData.messDetails?.noOfDays || 0} days`}
              </Typography.Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      {/* Bus Fee Section (only for students who require bus) */}
      {isStudent && formData.busRequired === "yes" && (
        <Card
          title="Bus Service Details"
          style={{marginBottom: 24}}
          headStyle={{
            padding: isMobile ? "12px" : "16px",
            background: "#f8f9fa",
          }}
          bodyStyle={{padding: 0}}
        >
          <Descriptions
            column={descriptionColumn}
            bordered
            size="small"
            labelStyle={{
              width: labelWidth,
              background: "#f8f9fa",
              fontWeight: 500,
            }}
          >
            <Descriptions.Item label="Yearly Bus Fee">
              <Typography.Text strong>
                ₹{formData.busYearlyAmount || "0"}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Validity Period" span={descriptionColumn}>
              <Typography.Text>{formatBusValidity()}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      {/* Payment Section */}
      <Card
        title="Payment Summary"
        headStyle={{padding: isMobile ? "12px" : "16px", background: "#f8f9fa"}}
        bodyStyle={{padding: 0}}
      >
        <Descriptions
          column={descriptionColumn}
          bordered
          size="small"
          labelStyle={{
            width: labelWidth,
            background: "#f8f9fa",
            fontWeight: 500,
          }}
        >
          {isDailyRent ? (
            <>
              <Descriptions.Item label="Daily Rent">
                <Typography.Text strong>
                  ₹{formData.stayDetails?.dailyRent || "0"}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Typography.Text strong>
                  ₹{formData.financialDetails?.totalAmount || "0"}
                </Typography.Text>
              </Descriptions.Item>
            </>
          ) : isMessOnly ? (
            <>
              <Descriptions.Item label="Mess Rent">
                <Typography.Text strong>
                  ₹{formData.messDetails?.rent || "0"}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Typography.Text strong>
                  ₹{formData.financialDetails?.totalAmount || "0"}
                </Typography.Text>
              </Descriptions.Item>
            </>
          ) : (
            <>
              {/* Display individual payment items for regular users */}
              {getTotalPaymentSummary()?.map((item, index) => (
                <Descriptions.Item key={index} label={item.label}>
                  <Typography.Text
                    strong={
                      item.label.includes("Rent") || item.label === "Bus Fee"
                    }
                  >
                    ₹{item.value}
                  </Typography.Text>
                </Descriptions.Item>
              ))}

              {/* Show total deposit including bus fee if applicable */}
              <Descriptions.Item label="Total Amount">
                <Typography.Text strong>₹{getTotalAmount()}</Typography.Text>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      <Typography.Text
        type="secondary"
        style={{
          display: "block",
          marginTop: 16,
          fontSize: isMobile ? 12 : 14,
        }}
      >
        Please review all information before submitting.
      </Typography.Text>
    </Card>
  );
};
