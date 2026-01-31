// import {
//   Button,
//   Card,
//   DatePicker,
//   Form,
//   Input,
//   Row,
//   Col,
//   Typography,
//   InputNumber,
//   ConfigProvider,
// } from "antd";
// import {CloseOutlined} from "../../../icons";
// import dayjs from "dayjs";
// import {redButton} from "../../../data/common/color";
// import {useNavigate} from "react-router-dom";

// export const PaymentTermsStep = ({
//   formData,
//   handleChange,
//   handleReject,
//   isRejoin,
// }) => {
//   const navigate = useNavigate();
//   console.log(formData);
//   // Handle number inputs to prevent wheel from changing values
//   const handleNumberInput = (e) => {
//     e.target.blur();
//   };

//   // Disabled date function for date pickers
//   const disabledDate = (current, startDate, endDate, isStartDate) => {
//     if (isStartDate) {
//       // For start date, disable dates after the selected end date (if any)
//       return endDate && current && current > dayjs(endDate).endOf("day");
//     } else {
//       // For end date, disable dates before the selected start date (if any)
//       return startDate && current && current < dayjs(startDate).startOf("day");
//     }
//   };

//   // Custom handleChange for DatePicker using dayjs
//   const handleDateChange = (name, date, dateString) => {
//     handleChange({
//       target: {
//         name,
//         value: dateString,
//       },
//     });

//     let startDate, endDate, rent;

//     if (formData.userType === "dailyRent") {
//       const details = formData.stayDetails || {};
//       rent = details.dailyRent || 0;

//       // Figure out which date was changed
//       if (name === "stayDetails.checkInDate") {
//         startDate = dateString;
//         endDate = details.checkOutDate;
//       } else if (name === "stayDetails.checkOutDate") {
//         startDate = details.checkInDate;
//         endDate = dateString;
//       }

//       if (startDate && endDate) {
//         const days = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
//         if (days > 0) {
//           handleChange({
//             target: {
//               name: "stayDetails.noOfDays",
//               value: days,
//             },
//           });
//           if (rent) {
//             handleChange({
//               target: {
//                 name: "financialDetails.totalAmount",
//                 value: days * rent,
//               },
//             });
//           }
//         }
//       }
//     } else if (formData.userType === "messOnly") {
//       const details = formData.messDetails || {};
//       rent = details.rent || 0;

//       if (name === "messDetails.messStartDate") {
//         startDate = dateString;
//         endDate = details.messEndDate;
//       } else if (name === "messDetails.messEndDate") {
//         startDate = details.messStartDate;
//         endDate = dateString;
//       }

//       if (startDate && endDate) {
//         const days = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
//         if (days > 0) {
//           handleChange({
//             target: {
//               name: "messDetails.noOfDays",
//               value: days,
//             },
//           });
//           if (rent) {
//             handleChange({
//               target: {
//                 name: "financialDetails.totalAmount",
//                 value: days * rent,
//               },
//             });
//           }
//         }
//       }
//     }
//   };

//   // Handle rent amount changes
//   const handleRentChange = (value, name) => {
//     handleChange({
//       target: {
//         name,
//         value,
//       },
//     });

//     setTimeout(() => {
//       if (formData.userType === "dailyRent" && formData.stayDetails?.noOfDays) {
//         handleChange({
//           target: {
//             name: "financialDetails.totalAmount",
//             value: value * formData.stayDetails.noOfDays,
//           },
//         });
//       } else if (
//         formData.userType === "messOnly" &&
//         formData.messDetails?.noOfDays
//       ) {
//         handleChange({
//           target: {
//             name: "financialDetails.totalAmount",
//             value: value * formData.messDetails.noOfDays,
//           },
//         });
//       }
//     }, 0);
//   };

//   return (
//     <Card>
//       <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
//         <Typography.Title level={4} style={{margin: 0}}>
//           Payment Terms
//         </Typography.Title>
//         {isRejoin ? (
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
//         )}
//       </Row>

//       <Form layout="vertical">
//         {formData.userType === "dailyRent" ? (
//           <>
//             <Row gutter={16}>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Check-in Date">
//                   <DatePicker
//                     style={{width: "100%"}}
//                     value={
//                       formData.stayDetails?.checkInDate
//                         ? dayjs(formData.stayDetails.checkInDate)
//                         : null
//                     }
//                     onChange={(date, dateString) =>
//                       handleDateChange(
//                         "stayDetails.checkInDate",
//                         date,
//                         dateString
//                       )
//                     }
//                     disabledDate={(current) =>
//                       disabledDate(
//                         current,
//                         null,
//                         formData.stayDetails?.checkOutDate,
//                         true
//                       )
//                     }
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Check-out Date">
//                   <DatePicker
//                     style={{width: "100%"}}
//                     value={
//                       formData.stayDetails?.checkOutDate
//                         ? dayjs(formData.stayDetails.checkOutDate)
//                         : null
//                     }
//                     onChange={(date, dateString) =>
//                       handleDateChange(
//                         "stayDetails.checkOutDate",
//                         date,
//                         dateString
//                       )
//                     }
//                     disabledDate={(current) =>
//                       disabledDate(
//                         current,
//                         formData.stayDetails?.checkInDate,
//                         null,
//                         false
//                       )
//                     }
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>
//             <Row gutter={16}>
//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label={`Daily Rent (₹) ${
//                     formData.stayDetails?.noOfDays
//                       ? `for ${formData.stayDetails.noOfDays} days`
//                       : ""
//                   }`}
//                 >
//                   <InputNumber
//                     style={{width: "100%"}}
//                     value={formData.stayDetails?.dailyRent}
//                     onChange={(value) =>
//                       handleRentChange(value, "stayDetails.dailyRent")
//                     }
//                     onWheel={handleNumberInput}
//                     min={0}
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Total Amount (₹)">
//                   <Input
//                     style={{width: "100%"}}
//                     value={formData.financialDetails?.totalAmount || 0}
//                     readOnly
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>
//           </>
//         ) : formData.userType === "messOnly" ? (
//           <>
//             <Row gutter={16}>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Mess Start Date">
//                   <DatePicker
//                     style={{width: "100%"}}
//                     value={
//                       formData.messDetails?.messStartDate
//                         ? dayjs(formData.messDetails.messStartDate)
//                         : null
//                     }
//                     onChange={(date, dateString) =>
//                       handleDateChange(
//                         "messDetails.messStartDate",
//                         date,
//                         dateString
//                       )
//                     }
//                     disabledDate={(current) =>
//                       disabledDate(
//                         current,
//                         null,
//                         formData.messDetails?.messEndDate,
//                         true
//                       )
//                     }
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Mess End Date">
//                   <DatePicker
//                     style={{width: "100%"}}
//                     value={
//                       formData.messDetails?.messEndDate
//                         ? dayjs(formData.messDetails.messEndDate)
//                         : null
//                     }
//                     onChange={(date, dateString) =>
//                       handleDateChange(
//                         "messDetails.messEndDate",
//                         date,
//                         dateString
//                       )
//                     }
//                     disabledDate={(current) =>
//                       disabledDate(
//                         current,
//                         formData.messDetails?.messStartDate,
//                         null,
//                         false
//                       )
//                     }
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>
//             <Row gutter={16}>
//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label={`Mess Rent (₹) ${
//                     formData.messDetails?.noOfDays
//                       ? `for ${formData.messDetails.noOfDays} days`
//                       : ""
//                   }`}
//                 >
//                   <InputNumber
//                     style={{width: "100%"}}
//                     value={formData.messDetails?.rent}
//                     onChange={(value) =>
//                       handleRentChange(value, "messDetails.rent")
//                     }
//                     onWheel={handleNumberInput}
//                     min={0}
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} md={12}>
//                 <Form.Item label="Total Amount (₹)">
//                   <Input
//                     style={{width: "100%"}}
//                     value={formData.financialDetails?.totalAmount || 0}
//                     readOnly
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>
//           </>
//         ) : (
//           // Regular user type
//           <Row gutter={16}>
//             <Col xs={24} md={12}>
//               <Form.Item label="Monthly Rent (₹)">
//                 <Input
//                   type="number"
//                   name="rentAmount"
//                   value={formData.rentAmount}
//                   onChange={handleChange}
//                   onWheel={handleNumberInput}
//                 />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="Refundable Deposit (₹)">
//                 <Input
//                   type="number"
//                   name="refundableDeposit"
//                   value={formData.refundableDeposit}
//                   onChange={handleChange}
//                   onWheel={handleNumberInput}
//                 />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="Non-Refundable Deposit (₹)">
//                 <Input
//                   type="number"
//                   name="nonRefundableDeposit"
//                   value={formData.nonRefundableDeposit}
//                   onChange={handleChange}
//                   onWheel={handleNumberInput}
//                 />
//               </Form.Item>
//             </Col>
//             <Col xs={24} md={12}>
//               <Form.Item label="Join Date">
//                 <DatePicker
//                   style={{width: "100%"}}
//                   value={formData.joinDate ? dayjs(formData.joinDate) : null}
//                   onChange={(date, dateString) =>
//                     handleChange({
//                       target: {
//                         name: "joinDate",
//                         value: dateString,
//                       },
//                     })
//                   }
//                 />
//               </Form.Item>
//             </Col>
//           </Row>
//         )}
//       </Form>
//     </Card>
//   );
// };
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  Typography,
  InputNumber,
  ConfigProvider,
  Select,
  Space,
} from "antd";
import {CloseOutlined} from "../../../icons";
import dayjs from "dayjs";
import {redButton} from "../../../data/common/color";
import {useNavigate} from "react-router-dom";

export const PaymentTermsStep = ({
  formData,
  handleChange,
  handleReject,
  isRejoin,
}) => {
  const navigate = useNavigate();
  console.log(formData);
  
  // Handle number inputs to prevent wheel from changing values
  const handleNumberInput = (e) => {
    e.target.blur();
  };

  // Disabled date function for date pickers
  const disabledDate = (current, startDate, endDate, isStartDate) => {
    if (isStartDate) {
      // For start date, disable dates after the selected end date (if any)
      return endDate && current && current > dayjs(endDate).endOf("day");
    } else {
      // For end date, disable dates before the selected start date (if any)
      return startDate && current && current < dayjs(startDate).startOf("day");
    }
  };

  // Custom handleChange for DatePicker using dayjs
  const handleDateChange = (name, date, dateString) => {
    handleChange({
      target: {
        name,
        value: dateString,
      },
    });

    let startDate, endDate, rent;

    if (formData.userType === "dailyRent") {
      const details = formData.stayDetails || {};
      rent = details.dailyRent || 0;

      // Figure out which date was changed
      if (name === "stayDetails.checkInDate") {
        startDate = dateString;
        endDate = details.checkOutDate;
      } else if (name === "stayDetails.checkOutDate") {
        startDate = details.checkInDate;
        endDate = dateString;
      }

      if (startDate && endDate) {
        const days = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
        if (days > 0) {
          handleChange({
            target: {
              name: "stayDetails.noOfDays",
              value: days,
            },
          });
          if (rent) {
            handleChange({
              target: {
                name: "financialDetails.totalAmount",
                value: days * rent,
              },
            });
          }
        }
      }
    } else if (formData.userType === "messOnly") {
      const details = formData.messDetails || {};
      rent = details.rent || 0;

      if (name === "messDetails.messStartDate") {
        startDate = dateString;
        endDate = details.messEndDate;
      } else if (name === "messDetails.messEndDate") {
        startDate = details.messStartDate;
        endDate = dateString;
      }

      if (startDate && endDate) {
        const days = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
        if (days > 0) {
          handleChange({
            target: {
              name: "messDetails.noOfDays",
              value: days,
            },
          });
          if (rent) {
            handleChange({
              target: {
                name: "financialDetails.totalAmount",
                value: days * rent,
              },
            });
          }
        }
      }
    }
  };

  // Handle rent amount changes
  const handleRentChange = (value, name) => {
    handleChange({
      target: {
        name,
        value,
      },
    });

    setTimeout(() => {
      if (formData.userType === "dailyRent" && formData.stayDetails?.noOfDays) {
        handleChange({
          target: {
            name: "financialDetails.totalAmount",
            value: value * formData.stayDetails.noOfDays,
          },
        });
      } else if (
        formData.userType === "messOnly" &&
        formData.messDetails?.noOfDays
      ) {
        handleChange({
          target: {
            name: "financialDetails.totalAmount",
            value: value * formData.messDetails.noOfDays,
          },
        });
      }
    }, 0);
  };

  // Handle bus required selection
  const handleBusRequiredChange = (value) => {
    handleChange({
      target: {
        name: "busRequired",
        value,
      },
    });
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
        <Typography.Title level={4} style={{margin: 0}}>
          Payment Terms
        </Typography.Title>
        {isRejoin ? (
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
        )}
      </Row>

      <Form layout="vertical">
        {formData.userType === "dailyRent" ? (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Check-in Date">
                  <DatePicker
                    style={{width: "100%"}}
                    value={
                      formData.stayDetails?.checkInDate
                        ? dayjs(formData.stayDetails.checkInDate)
                        : null
                    }
                    onChange={(date, dateString) =>
                      handleDateChange(
                        "stayDetails.checkInDate",
                        date,
                        dateString
                      )
                    }
                    disabledDate={(current) =>
                      disabledDate(
                        current,
                        null,
                        formData.stayDetails?.checkOutDate,
                        true
                      )
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Check-out Date">
                  <DatePicker
                    style={{width: "100%"}}
                    value={
                      formData.stayDetails?.checkOutDate
                        ? dayjs(formData.stayDetails.checkOutDate)
                        : null
                    }
                    onChange={(date, dateString) =>
                      handleDateChange(
                        "stayDetails.checkOutDate",
                        date,
                        dateString
                      )
                    }
                    disabledDate={(current) =>
                      disabledDate(
                        current,
                        formData.stayDetails?.checkInDate,
                        null,
                        false
                      )
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={`Daily Rent (₹) ${
                    formData.stayDetails?.noOfDays
                      ? `for ${formData.stayDetails.noOfDays} days`
                      : ""
                  }`}
                >
                  <InputNumber
                    style={{width: "100%"}}
                    value={formData.stayDetails?.dailyRent}
                    onChange={(value) =>
                      handleRentChange(value, "stayDetails.dailyRent")
                    }
                    onWheel={handleNumberInput}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Total Amount (₹)">
                  <Input
                    style={{width: "100%"}}
                    value={formData.financialDetails?.totalAmount || 0}
                    readOnly
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : formData.userType === "messOnly" ? (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Mess Start Date">
                  <DatePicker
                    style={{width: "100%"}}
                    value={
                      formData.messDetails?.messStartDate
                        ? dayjs(formData.messDetails.messStartDate)
                        : null
                    }
                    onChange={(date, dateString) =>
                      handleDateChange(
                        "messDetails.messStartDate",
                        date,
                        dateString
                      )
                    }
                    disabledDate={(current) =>
                      disabledDate(
                        current,
                        null,
                        formData.messDetails?.messEndDate,
                        true
                      )
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Mess End Date">
                  <DatePicker
                    style={{width: "100%"}}
                    value={
                      formData.messDetails?.messEndDate
                        ? dayjs(formData.messDetails.messEndDate)
                        : null
                    }
                    onChange={(date, dateString) =>
                      handleDateChange(
                        "messDetails.messEndDate",
                        date,
                        dateString
                      )
                    }
                    disabledDate={(current) =>
                      disabledDate(
                        current,
                        formData.messDetails?.messStartDate,
                        null,
                        false
                      )
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={`Mess Rent (₹) ${
                    formData.messDetails?.noOfDays
                      ? `for ${formData.messDetails.noOfDays} days`
                      : ""
                  }`}
                >
                  <InputNumber
                    style={{width: "100%"}}
                    value={formData.messDetails?.rent}
                    onChange={(value) =>
                      handleRentChange(value, "messDetails.rent")
                    }
                    onWheel={handleNumberInput}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Total Amount (₹)">
                  <Input
                    style={{width: "100%"}}
                    value={formData.financialDetails?.totalAmount || 0}
                    readOnly
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          // Regular user type (student or regular)
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Monthly Rent (₹)">
                  <Input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    onWheel={handleNumberInput}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Refundable Deposit (₹)">
                  <Input
                    type="number"
                    name="refundableDeposit"
                    value={formData.refundableDeposit}
                    onChange={handleChange}
                    onWheel={handleNumberInput}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Non-Refundable Deposit (₹)">
                  <Input
                    type="number"
                    name="nonRefundableDeposit"
                    value={formData.nonRefundableDeposit}
                    onChange={handleChange}
                    onWheel={handleNumberInput}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Join Date">
                  <DatePicker
                    style={{width: "100%"}}
                    value={formData.joinDate ? dayjs(formData.joinDate) : null}
                    onChange={(date, dateString) =>
                      handleChange({
                        target: {
                          name: "joinDate",
                          value: dateString,
                        },
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            
            {/* Bus Fee Section for Students */}
            {(formData.userType === "student" || formData.userType === "Student") && (
              <>
                <Row gutter={16} style={{marginTop: 16}}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Is Bus Required?">
                      <Select
                        style={{width: "100%"}}
                        value={formData.busRequired}
                        onChange={handleBusRequiredChange}
                        options={[
                          {value: "yes", label: "Yes"},
                          {value: "no", label: "No"},
                        ]}
                        placeholder="Select option"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                {/* Show bus fee fields if bus is required */}
                {formData.busRequired === "yes" && (
                  <Space direction="vertical" style={{width: "100%", marginTop: 16}}>
                    <Typography.Title level={5}>Bus Fee Details</Typography.Title>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item label="Yearly Bus Fee (₹)">
                          <InputNumber
                            style={{width: "100%"}}
                            name="busYearlyAmount"
                            value={formData.busYearlyAmount}
                            onChange={(value) => 
                              handleChange({
                                target: {
                                  name: "busYearlyAmount",
                                  value,
                                },
                              })
                            }
                            onWheel={handleNumberInput}
                            min={0}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Validity Start Date">
                          <DatePicker
                            style={{width: "100%"}}
                            value={formData.busValidityStartDate ? dayjs(formData.busValidityStartDate) : null}
                            onChange={(date, dateString) =>
                              handleChange({
                                target: {
                                  name: "busValidityStartDate",
                                  value: dateString,
                                },
                              })
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="Validity End Date">
                          <DatePicker
                            style={{width: "100%"}}
                            value={formData.busValidityEndDate ? dayjs(formData.busValidityEndDate) : null}
                            onChange={(date, dateString) =>
                              handleChange({
                                target: {
                                  name: "busValidityEndDate",
                                  value: dateString,
                                },
                              })
                            }
                            disabledDate={(current) =>
                              formData.busValidityStartDate && 
                              current && 
                              current < dayjs(formData.busValidityStartDate).startOf("day")
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Space>
                )}
              </>
            )}
          </>
        )}
      </Form>
    </Card>
  );
};