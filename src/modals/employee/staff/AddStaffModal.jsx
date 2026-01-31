// import {useState} from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   Select,
//   DatePicker,
//   Upload,
//   Button,
//   Row,
//   Col,
//   InputNumber,
//   message,
// } from "antd";
// import {UploadOutlined} from "@ant-design/icons";
// import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
// import {useSelector} from "react-redux";
// import dayjs from "dayjs";
// import {addStaff, getAllRoles} from "../../../hooks/employee/useEmployee";

// const {Option} = Select;

// const AddStaffModal = ({kitchens, open, onClose}) => {
//   const [form] = Form.useForm();
//   const queryClient = useQueryClient();
//   const [fileLists, setFileLists] = useState({
//     photo: [],
//     aadharFrontImage: [],
//     aadharBackImage: [],
//   });
//   const [messageApi, contextHolder] = message.useMessage();
//   const [employeeType, setEmployeeType] = useState("");

//   // Get all properties from Redux and filter out "All Properties" option
//   const allProperties = useSelector(
//     (state) => state.properties.properties || []
//   );
//   const properties = allProperties.filter((property) => property._id !== null);

//   const createdBy = useSelector((state) => state.auth.user?.id);

//   const {data: rolesData, isLoading: rolesLoading} = useQuery({
//     queryKey: ["roles"],
//     queryFn: () => getAllRoles(),
//   });

//   const addStaffMutation = useMutation({
//     mutationFn: (data) => addStaff(data),
//     onSuccess: (data) => {
//       messageApi.success({
//         content: `${data.message}`,
//         duration: 3,
//       });
//       queryClient.invalidateQueries({queryKey: ["staff-list"]});
//       onClose();
//       form.resetFields();
//       setFileLists({photo: [], aadharFrontImage: [], aadharBackImage: []});
//       setEmployeeType("");
//     },
//     onError: (error) => {
//       messageApi.error({
//         content: `${error.message}`,
//         duration: 3,
//       });
//     },
//   });

//   const handleFileChange = ({fileList}, name) => {
//     setFileLists((prev) => ({...prev, [name]: fileList.slice(-1)}));
//   };

//   // Custom filter function for property search
//   const filterOption = (input, option) => {
//     return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
//   };

//   const handleEmployeeTypeChange = (value) => {
//     setEmployeeType(value);
//     // Clear the selection fields when changing employee type
//     form.setFieldsValue({
//       propertyId: undefined,
//       kitchenId: undefined,
//     });
//   };

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();
//       const formData = new FormData();

//       // Append all form values to FormData
//       Object.keys(values).forEach((key) => {
//         if (values[key]) {
//           if (key === "dob" || key === "joinDate") {
//             formData.append(key, dayjs(values[key]).toISOString());
//           } else if (key === "propertyId" || key === "kitchenId") {
//             // Handle multiple property/kitchen IDs
//             values[key].forEach((id) => {
//               formData.append(key, id);
//             });
//           } else {
//             formData.append(key, values[key]);
//           }
//         }
//       });

//       // Append employee type
//       formData.append("employeeType", employeeType);

//       // Append files
//       if (fileLists.photo.length > 0)
//         formData.append("photo", fileLists.photo[0].originFileObj);
//       if (fileLists.aadharFrontImage.length > 0)
//         formData.append(
//           "aadharFrontImage",
//           fileLists.aadharFrontImage[0].originFileObj
//         );
//       if (fileLists.aadharBackImage.length > 0)
//         formData.append(
//           "aadharBackImage",
//           fileLists.aadharBackImage[0].originFileObj
//         );

//       // Append createdBy
//       formData.append("createdBy", createdBy);

//       addStaffMutation.mutate(formData);
//     } catch (info) {
//       console.log("Validate Failed:", info);
//     }
//   };

//   return (
//     <>
//       {contextHolder}
//       <Modal
//         title="Add New Employee"
//         open={open}
//         onOk={handleOk}
//         onCancel={onClose}
//         confirmLoading={addStaffMutation.isPending}
//         okText="Save Employee"
//         width={800}
//       >
//         <Form form={form} layout="vertical" name="addStaffForm">
//           <Row gutter={16}>
//             <Col span={8}>
//               <Form.Item
//                 name="name"
//                 label="Full Name"
//                 rules={[{required: true, message: "Please enter full name"}]}
//               >
//                 <Input placeholder="Enter full name" />
//               </Form.Item>
//             </Col>

//             <Col span={8}>
//               <Form.Item
//                 name="jobTitle"
//                 label="Job Title"
//                 rules={[{required: true, message: "Please enter job title"}]}
//               >
//                 <Input placeholder="Enter job title" />
//               </Form.Item>
//             </Col>

//             <Col span={8}>
//               <Form.Item
//                 name="email"
//                 label="Email Address"
//                 rules={[
//                   {required: true, message: "Please enter email"},
//                   {
//                     type: "email",
//                     message: "Please enter a valid email address",
//                   },
//                 ]}
//               >
//                 <Input placeholder="Enter email address" />
//               </Form.Item>
//             </Col>
//           </Row>

//           {/* Employee Type Selection */}
//           <Form.Item
//             name="selectedEmployeeType"
//             label="Employee Type"
//             rules={[{required: true, message: "Please select employee type"}]}
//           >
//             <Select
//               placeholder="Select employee type"
//               onChange={handleEmployeeTypeChange}
//             >
//               <Option value="property">Property Employee</Option>
//               <Option value="kitchen">Kitchen Employee</Option>
//               <Option value="both">Both (Property & Kitchen)</Option>
//             </Select>
//           </Form.Item>

//           {/* Property Selection (shown for property or both) */}
//           {(employeeType === "property" || employeeType === "both") && (
//             <Form.Item
//               name="propertyId"
//               label="Properties"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select at least one property",
//                 },
//               ]}
//             >
//               <Select
//                 mode="multiple"
//                 placeholder="Select properties"
//                 allowClear
//                 showSearch
//                 filterOption={filterOption}
//                 optionFilterProp="children"
//               >
//                 {properties.map((property) => (
//                   <Option key={property._id} value={property._id}>
//                     {property.name}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           )}

//           {/* Kitchen Selection (shown for kitchen or both) */}
//           {(employeeType === "kitchen" || employeeType === "both") && (
//             <Form.Item
//               name="kitchenId"
//               label="Kitchens"
//               rules={[
//                 {required: true, message: "Please select at least one kitchen"},
//               ]}
//             >
//               <Select
//                 mode="multiple"
//                 placeholder="Select kitchens"
//                 allowClear
//                 showSearch
//                 filterOption={filterOption}
//                 optionFilterProp="children"
//               >
//                 {kitchens.map((kitchen) => (
//                   <Option key={kitchen._id} value={kitchen._id}>
//                     {kitchen.name}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           )}

//           <Row gutter={16}>
//             <Col span={8}>
//               <Form.Item
//                 name="gender"
//                 label="Gender"
//                 rules={[{required: true}]}
//               >
//                 <Select placeholder="Select gender">
//                   <Option value="Male">Male</Option>
//                   <Option value="Female">Female</Option>
//                   <Option value="Other">Other</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="dob"
//                 label="Date of Birth"
//                 rules={[{required: true}]}
//               >
//                 <DatePicker style={{width: "100%"}} />
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="contactNumber"
//                 label="Contact Number"
//                 rules={[{required: true}]}
//               >
//                 <Input placeholder="Enter contact number" />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Form.Item name="address" label="Address" rules={[{required: true}]}>
//             <Input.TextArea rows={2} placeholder="Enter full address" />
//           </Form.Item>
//           <Row gutter={16}>
//             <Col span={8}>
//               <Form.Item name="role" label="Role" rules={[{required: true}]}>
//                 <Select
//                   placeholder="Select role"
//                   loading={rolesLoading}
//                   showSearch
//                   filterOption={(input, option) =>
//                     option.children
//                       .toLowerCase()
//                       .indexOf(input.toLowerCase()) >= 0
//                   }
//                 >
//                   {rolesData?.map((role) => (
//                     <Option key={role._id} value={role._id}>
//                       {role.roleName}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="salary"
//                 label="Salary"
//                 rules={[{required: true}]}
//               >
//                 <InputNumber
//                   style={{width: "100%"}}
//                   placeholder="Enter monthly salary"
//                 />
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="joinDate"
//                 label="Join Date"
//                 rules={[{required: true}]}
//               >
//                 <DatePicker style={{width: "100%"}} />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16}>
//             <Col span={8}>
//               <Form.Item label="Photo" rules={[{required: true}]}>
//                 <Upload
//                   listType="picture"
//                   fileList={fileLists.photo}
//                   onChange={(info) => handleFileChange(info, "photo")}
//                   beforeUpload={() => false}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Photo</Button>
//                 </Upload>
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item label="Aadhar Front" rules={[{required: true}]}>
//                 <Upload
//                   listType="picture"
//                   fileList={fileLists.aadharFrontImage}
//                   onChange={(info) =>
//                     handleFileChange(info, "aadharFrontImage")
//                   }
//                   beforeUpload={() => false}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Front</Button>
//                 </Upload>
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item label="Aadhar Back" rules={[{required: true}]}>
//                 <Upload
//                   listType="picture"
//                   fileList={fileLists.aadharBackImage}
//                   onChange={(info) => handleFileChange(info, "aadharBackImage")}
//                   beforeUpload={() => false}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Back</Button>
//                 </Upload>
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default AddStaffModal;
import {useState} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Row,
  Col,
  InputNumber,
  message,
} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import {addStaff, getAllRoles} from "../../../hooks/employee/useEmployee";

const {Option} = Select;

const AddStaffModal = ({kitchens, open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharFrontImage: [],
    aadharBackImage: [],
    panCardImage: [], // New state for PAN card image
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [employeeType, setEmployeeType] = useState("");

  // Get all properties from Redux and filter out "All Properties" option
  const allProperties = useSelector(
    (state) => state.properties.properties || []
  );
  const properties = allProperties.filter((property) => property._id !== null);

  const createdBy = useSelector((state) => state.auth.user?.id);

  const {data: rolesData, isLoading: rolesLoading} = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  // Custom validator for PAN card number format
  const validatePAN = (rule, value, callback) => {
    if (!value) {
      callback();
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(value.toUpperCase())) {
      callback("Please enter a valid PAN card number (Format: ABCDE1234F)");
    } else {
      callback();
    }
  };

  const addStaffMutation = useMutation({
    mutationFn: (data) => addStaff(data),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
      onClose();
      form.resetFields();
      setFileLists({
        photo: [],
        aadharFrontImage: [],
        aadharBackImage: [],
        panCardImage: [], // Reset PAN image too
      });
      setEmployeeType("");
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleFileChange = ({fileList}, name) => {
    setFileLists((prev) => ({...prev, [name]: fileList.slice(-1)}));
  };

  // Custom filter function for property search
  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const handleEmployeeTypeChange = (value) => {
    setEmployeeType(value);
    // Clear the selection fields when changing employee type
    form.setFieldsValue({
      propertyId: undefined,
      kitchenId: undefined,
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Validate file uploads
      if (fileLists.photo.length === 0) {
        messageApi.error({
          content: "Photo is required",
          duration: 3,
        });
        return;
      }

      if (fileLists.aadharFrontImage.length === 0) {
        messageApi.error({
          content: "Aadhar Front Image is required",
          duration: 3,
        });
        return;
      }

      if (fileLists.aadharBackImage.length === 0) {
        messageApi.error({
          content: "Aadhar Back Image is required",
          duration: 3,
        });
        return;
      }

      if (fileLists.panCardImage.length === 0) {
        messageApi.error({
          content: "PAN Card Image is required",
          duration: 3,
        });
        return;
      }

      const formData = new FormData();

      // Append all form values to FormData
      Object.keys(values).forEach((key) => {
        if (values[key]) {
          if (key === "dob" || key === "joinDate") {
            formData.append(key, dayjs(values[key]).toISOString());
          } else if (key === "propertyId" || key === "kitchenId") {
            // Handle multiple property/kitchen IDs
            values[key].forEach((id) => {
              formData.append(key, id);
            });
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append employee type
      formData.append("employeeType", employeeType);

      // Append files
      formData.append("photo", fileLists.photo[0].originFileObj);
      formData.append(
        "aadharFrontImage",
        fileLists.aadharFrontImage[0].originFileObj
      );
      formData.append(
        "aadharBackImage",
        fileLists.aadharBackImage[0].originFileObj
      );
      formData.append("panCardImage", fileLists.panCardImage[0].originFileObj); // Append PAN image

      // Append createdBy
      formData.append("createdBy", createdBy);

      addStaffMutation.mutate(formData);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Employee"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={addStaffMutation.isPending}
        okText="Save Employee"
        width={800}
      >
        <Form form={form} layout="vertical" name="addStaffForm">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{required: true, message: "Please enter full name"}]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[{required: true, message: "Please enter job title"}]}
              >
                <Input placeholder="Enter job title" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  {required: true, message: "Please enter email"},
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          {/* Employee Type Selection */}
          <Form.Item
            name="selectedEmployeeType"
            label="Employee Type"
            rules={[{required: true, message: "Please select employee type"}]}
          >
            <Select
              placeholder="Select employee type"
              onChange={handleEmployeeTypeChange}
            >
              <Option value="property">Property Employee</Option>
              <Option value="kitchen">Kitchen Employee</Option>
              <Option value="both">Both (Property & Kitchen)</Option>
            </Select>
          </Form.Item>

          {/* Property Selection (shown for property or both) */}
          {(employeeType === "property" || employeeType === "both") && (
            <Form.Item
              name="propertyId"
              label="Properties"
              rules={[
                {
                  required: true,
                  message: "Please select at least one property",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select properties"
                allowClear
                showSearch
                filterOption={filterOption}
                optionFilterProp="children"
              >
                {properties.map((property) => (
                  <Option key={property._id} value={property._id}>
                    {property.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Kitchen Selection (shown for kitchen or both) */}
          {(employeeType === "kitchen" || employeeType === "both") && (
            <Form.Item
              name="kitchenId"
              label="Kitchens"
              rules={[
                {required: true, message: "Please select at least one kitchen"},
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select kitchens"
                allowClear
                showSearch
                filterOption={filterOption}
                optionFilterProp="children"
              >
                {kitchens.map((kitchen) => (
                  <Option key={kitchen._id} value={kitchen._id}>
                    {kitchen.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{required: true}]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{required: true}]}
              >
                <DatePicker style={{width: "100%"}} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{required: true}]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="panNumber"
                label="PAN Card Number"
                rules={[
                  {
                    validator: validatePAN,
                  },
                ]}
              >
                <Input
                  placeholder="Enter PAN number"
                  style={{width: "100%"}}
                  maxLength={10}
                  onChange={(e) => {
                    // Auto convert to uppercase
                    const value = e.target.value.toUpperCase();
                    form.setFieldValue("panNumber", value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address" rules={[{required: true}]}>
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="role" label="Role" rules={[{required: true}]}>
                <Select
                  placeholder="Select role"
                  loading={rolesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {rolesData?.map((role) => (
                    <Option key={role._id} value={role._id}>
                      {role.roleName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{required: true}]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="Enter monthly salary"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="joinDate"
                label="Join Date"
                rules={[{required: true}]}
              >
                <DatePicker style={{width: "100%"}} />
              </Form.Item>
            </Col>
          </Row>

          {/* Document Uploads Section */}
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Profile Photo"
                required
                validateStatus={fileLists.photo.length === 0 ? "error" : ""}
                help={fileLists.photo.length === 0 ? "Photo is required" : ""}
              >
                <Upload
                  listType="picture-card"
                  fileList={fileLists.photo}
                  onChange={(info) => handleFileChange(info, "photo")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileLists.photo.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{marginTop: 8}}>Upload Photo</div>
                    </div>
                  )}
                </Upload>
                <div
                  style={{fontSize: "11px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG
                </div>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Aadhar Front"
                required
                validateStatus={
                  fileLists.aadharFrontImage.length === 0 ? "error" : ""
                }
                help={
                  fileLists.aadharFrontImage.length === 0
                    ? "Front image is required"
                    : ""
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={fileLists.aadharFrontImage}
                  onChange={(info) =>
                    handleFileChange(info, "aadharFrontImage")
                  }
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileLists.aadharFrontImage.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{marginTop: 8}}>Aadhar Front</div>
                    </div>
                  )}
                </Upload>
                <div
                  style={{fontSize: "11px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG
                </div>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Aadhar Back"
                required
                validateStatus={
                  fileLists.aadharBackImage.length === 0 ? "error" : ""
                }
                help={
                  fileLists.aadharBackImage.length === 0
                    ? "Back image is required"
                    : ""
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={fileLists.aadharBackImage}
                  onChange={(info) => handleFileChange(info, "aadharBackImage")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileLists.aadharBackImage.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{marginTop: 8}}>Aadhar Back</div>
                    </div>
                  )}
                </Upload>
                <div
                  style={{fontSize: "11px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG
                </div>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="PAN Card Image"
                required
                validateStatus={
                  fileLists.panCardImage.length === 0 ? "error" : ""
                }
                help={
                  fileLists.panCardImage.length === 0
                    ? "PAN image is required"
                    : ""
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={fileLists.panCardImage}
                  onChange={(info) => handleFileChange(info, "panCardImage")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileLists.panCardImage.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{marginTop: 8}}>Upload PAN</div>
                    </div>
                  )}
                </Upload>
                <div
                  style={{fontSize: "11px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG
                </div>
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "16px",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <strong>Note:</strong> All documents are required. Maximum file size
            for each document is 5MB.
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddStaffModal;
