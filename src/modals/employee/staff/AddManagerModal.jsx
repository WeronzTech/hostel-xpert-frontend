// import {useState} from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   Select,
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
// import {addManager, getAllRoles} from "../../../hooks/employee/useEmployee";

// const {Option} = Select;

// const AddManagerModal = ({open, onClose}) => {
//   const [form] = Form.useForm();
//   const queryClient = useQueryClient();
//   const [fileLists, setFileLists] = useState({
//     photo: [],
//     aadharImage: [],
//   });
//   const [messageApi, contextHolder] = message.useMessage();

//   // Get all properties from Redux and filter out "All Properties" option
//   const allProperties = useSelector(
//     (state) => state.properties.properties || []
//   );
//   const properties = allProperties.filter((property) => property._id !== null);

//   // Fetch available roles for the dropdown
//   const {data: rolesData, isLoading: rolesLoading} = useQuery({
//     queryKey: ["roles"],
//     queryFn: () => getAllRoles(),
//   });

//   // Custom filter function for property search
//   const filterOption = (input, option) => {
//     return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
//   };

//   // Mutation for registering the manager
//   const handleAddManager = useMutation({
//     mutationFn: (data) => addManager(data),
//     onSuccess: (data) => {
//       messageApi.success({
//         content: `${data.message}`,
//         duration: 3,
//       });
//       queryClient.invalidateQueries({queryKey: ["staff-list"]});
//       onClose();
//       form.resetFields();
//       setFileLists({photo: [], aadharImage: []});
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

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();
//       const formData = new FormData();

//       // Append all form values to FormData
//       Object.keys(values).forEach((key) => {
//         if (values[key]) {
//           if (key === "propertyId") {
//             // Handle multiple property IDs
//             values[key].forEach((id) => {
//               formData.append("propertyId", id);
//             });
//           } else {
//             formData.append(key, values[key]);
//           }
//         }
//       });

//       // Append files
//       if (fileLists.photo.length > 0) {
//         formData.append("photo", fileLists.photo[0].originFileObj);
//       }
//       if (fileLists.aadharImage.length > 0) {
//         formData.append("aadharImage", fileLists.aadharImage[0].originFileObj);
//       }

//       handleAddManager.mutate(formData);
//     } catch (info) {
//       console.log("Validate Failed:", info);
//     }
//   };

//   return (
//     <>
//       {contextHolder}
//       <Modal
//         title="Register New Manager"
//         open={open}
//         onOk={handleOk}
//         onCancel={onClose}
//         confirmLoading={handleAddManager.isPending}
//         okText="Register Manager"
//         width={800}
//       >
//         <Form form={form} layout="vertical" name="addManagerForm">
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

//           {/* Property Selection */}
//           <Form.Item
//             name="propertyId"
//             label="Properties"
//             rules={[
//               {required: true, message: "Please select at least one property"},
//             ]}
//           >
//             <Select
//               mode="multiple"
//               placeholder="Select properties"
//               allowClear
//               showSearch
//               filterOption={filterOption}
//               optionFilterProp="children"
//             >
//               {properties.map((property) => (
//                 <Option key={property._id} value={property._id}>
//                   {property.name}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="phone"
//                 label="Contact Number"
//                 rules={[{required: true}]}
//               >
//                 <Input placeholder="Enter contact number" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
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
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="password"
//                 label="Password"
//                 rules={[{required: true}]}
//               >
//                 <Input.Password placeholder="Enter a secure password" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
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
//           </Row>

//           <Form.Item name="address" label="Address" rules={[{required: true}]}>
//             <Input.TextArea rows={2} placeholder="Enter full address" />
//           </Form.Item>

//           <Row gutter={16}>
//             <Col span={12}>
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
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item label="Photo">
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
//             <Col span={12}>
//               <Form.Item label="Aadhar Card">
//                 <Upload
//                   listType="picture"
//                   fileList={fileLists.aadharImage}
//                   onChange={(info) => handleFileChange(info, "aadharImage")}
//                   beforeUpload={() => false}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Aadhar</Button>
//                 </Upload>
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default AddManagerModal;
import {useState} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
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
import {addManager, getAllRoles} from "../../../hooks/employee/useEmployee";

const {Option} = Select;

const AddManagerModal = ({open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharImage: [],
    panCardImage: [], // New state for PAN card image
  });
  const [messageApi, contextHolder] = message.useMessage();

  // Get all properties from Redux and filter out "All Properties" option
  const allProperties = useSelector(
    (state) => state.properties.properties || []
  );
  const properties = allProperties.filter((property) => property._id !== null);

  // Fetch available roles for the dropdown
  const {data: rolesData, isLoading: rolesLoading} = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  // Custom filter function for property search
  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  // Mutation for registering the manager
  const handleAddManager = useMutation({
    mutationFn: (data) => addManager(data),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
      onClose();
      form.resetFields();
      setFileLists({photo: [], aadharImage: [], panCardImage: []}); // Reset PAN image too
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

  // Custom validator for file uploads
  const validateFileUpload = (rule, value, callback) => {
    const fieldName = rule.field;
    let fieldLabel = "";

    switch (fieldName) {
      case "photo":
        fieldLabel = "Photo";
        break;
      case "aadharImage":
        fieldLabel = "Aadhar Card";
        break;
      case "panCardImage":
        fieldLabel = "PAN Card";
        break;
      default:
        fieldLabel = "Document";
    }

    if (!fileLists[fieldName] || fileLists[fieldName].length === 0) {
      callback(`${fieldLabel} is required`);
    } else {
      callback();
    }
  };

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

      if (fileLists.aadharImage.length === 0) {
        messageApi.error({
          content: "Aadhar Card is required",
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
          if (key === "propertyId") {
            // Handle multiple property IDs
            values[key].forEach((id) => {
              formData.append("propertyId", id);
            });
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Append files
      formData.append("photo", fileLists.photo[0].originFileObj);
      formData.append("aadharImage", fileLists.aadharImage[0].originFileObj);
      formData.append("panCardImage", fileLists.panCardImage[0].originFileObj); // Append PAN image

      handleAddManager.mutate(formData);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Register New Manager"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleAddManager.isPending}
        okText="Register Manager"
        width={800}
      >
        <Form form={form} layout="vertical" name="addManagerForm">
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

          {/* Property Selection */}
          <Form.Item
            name="propertyId"
            label="Properties"
            rules={[
              {required: true, message: "Please select at least one property"},
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Contact Number"
                rules={[{required: true}]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{required: true}]}
              >
                <Input.Password placeholder="Enter a secure password" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          </Row>

          <Form.Item name="address" label="Address" rules={[{required: true}]}>
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
                  placeholder="Enter PAN card number"
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

          {/* Document Uploads - Now in 3 columns for better layout */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Profile Photo"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateFileUpload({field: "photo"}, value),
                  },
                ]}
                validateStatus={fileLists.photo.length === 0 ? "error" : ""}
                help={
                  fileLists.photo.length === 0
                    ? "Profile photo is required"
                    : ""
                }
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
                  style={{fontSize: "12px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG (Max: 5MB)
                </div>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Aadhar Card"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateFileUpload({field: "aadharImage"}, value),
                  },
                ]}
                validateStatus={
                  fileLists.aadharImage.length === 0 ? "error" : ""
                }
                help={
                  fileLists.aadharImage.length === 0
                    ? "Aadhar Card is required"
                    : ""
                }
              >
                <Upload
                  listType="picture-card"
                  fileList={fileLists.aadharImage}
                  onChange={(info) => handleFileChange(info, "aadharImage")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*,.pdf"
                >
                  {fileLists.aadharImage.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{marginTop: 8}}>Upload Aadhar</div>
                    </div>
                  )}
                </Upload>
                <div
                  style={{fontSize: "12px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG, PDF (Max: 5MB)
                </div>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="PAN Card Image"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateFileUpload({field: "panCardImage"}, value),
                  },
                ]}
                validateStatus={
                  fileLists.panCardImage.length === 0 ? "error" : ""
                }
                help={
                  fileLists.panCardImage.length === 0
                    ? "PAN Card Image is required"
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
                  style={{fontSize: "12px", color: "#999", marginTop: "4px"}}
                >
                  JPG, PNG (Max: 5MB)
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

export default AddManagerModal;
