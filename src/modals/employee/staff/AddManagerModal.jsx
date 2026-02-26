import {useState} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
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

const AddManagerModal = ({kitchens, open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharFrontImage: [],
    aadharBackImage: [],
    panCardImage: [],
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [managerType, setManagerType] = useState("");

  // Get all properties from Redux and filter out "All Properties" option
  const allProperties = useSelector(
    (state) => state.properties.properties || [],
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
      setFileLists({
        photo: [],
        aadharFrontImage: [],
        aadharBackImage: [],
        panCardImage: [],
      });
      setManagerType("");
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

  const handlemanagerTypeChange = (value) => {
    setManagerType(value);
    // Clear the selection fields when changing employee type
    form.setFieldsValue({
      propertyId: undefined,
      kitchenId: undefined,
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      // Append all form values to FormData
      Object.keys(values).forEach((key) => {
        if (values[key]) {
          if (key === "propertyId" || key === "kitchenId") {
            // Handle multiple property/kitchen IDs
            if (Array.isArray(values[key])) {
              values[key].forEach((id) => {
                formData.append(key, id);
              });
            }
          } else if (key !== "selectedmanagerType") {
            formData.append(key, values[key]);
          }
        }
      });

      // Append employee type
      formData.append("managerType", managerType);

      // Append files only if they exist (not required anymore)
      if (fileLists.photo?.length > 0) {
        formData.append("photo", fileLists.photo[0].originFileObj);
      }
      if (fileLists.aadharFrontImage?.length > 0) {
        formData.append(
          "aadharFrontImage",
          fileLists.aadharFrontImage[0].originFileObj,
        );
      }
      if (fileLists.aadharBackImage?.length > 0) {
        formData.append(
          "aadharBackImage",
          fileLists.aadharBackImage[0].originFileObj,
        );
      }
      if (fileLists.panCardImage?.length > 0) {
        formData.append(
          "panCardImage",
          fileLists.panCardImage[0].originFileObj,
        );
      }

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
        className="responsive-modal"
      >
        <Form
          form={form}
          layout="vertical"
          name="addManagerForm"
          className="responsive-form"
        >
          {/* Row 1: Name, Job Title, Email */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{required: true, message: "Please enter full name"}]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[{required: true, message: "Please enter job title"}]}
              >
                <Input placeholder="Enter job title" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
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
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="selectedmanagerType"
                label="Manager Type"
                rules={[
                  {required: true, message: "Please select manager type"},
                ]}
              >
                <Select
                  placeholder="Select manager type"
                  onChange={handlemanagerTypeChange}
                >
                  <Option value="Property">Property Manager</Option>
                  <Option value="Kitchen">Kitchen Manager</Option>
                  <Option value="Property & Kitchen">
                    Both (Property & Kitchen)
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Property Selection */}
          {(managerType === "Property" ||
            managerType === "Property & Kitchen") && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24}>
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
              </Col>
            </Row>
          )}

          {/* Kitchen Selection */}
          {(managerType === "Kitchen" ||
            managerType === "Property & Kitchen") && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24}>
                <Form.Item
                  name="kitchenId"
                  label="Kitchens"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one kitchen",
                    },
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
                    {kitchens?.map((kitchen) => (
                      <Option key={kitchen._id} value={kitchen._id}>
                        {kitchen.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Row: Phone, Gender, Role */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="phone"
                label="Contact Number"
                rules={[
                  {required: true, message: "Please enter contact number"},
                ]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{required: true, message: "Please select gender"}]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{required: true, message: "Please select role"}]}
              >
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

          {/* Row: Password and Salary */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{required: true, message: "Please enter password"}]}
              >
                <Input.Password placeholder="Enter a secure password" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{required: true, message: "Please enter salary"}]}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="Enter monthly salary"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Address - Full Width */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{required: true, message: "Please enter address"}]}
              >
                <Input.TextArea rows={2} placeholder="Enter full address" />
              </Form.Item>
            </Col>
          </Row>

          {/* Document Uploads - Now 4 columns for Photo, Aadhar Front, Aadhar Back, PAN Card */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item label="Profile Photo">
                <Upload
                  listType="picture-card"
                  fileList={fileLists.photo}
                  onChange={(info) => handleFileChange(info, "photo")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="responsive-upload"
                >
                  {fileLists.photo.length === 0 && (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Photo</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG (Max: 5MB)</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item label="Aadhar Front">
                <Upload
                  listType="picture-card"
                  fileList={fileLists.aadharFrontImage}
                  onChange={(info) =>
                    handleFileChange(info, "aadharFrontImage")
                  }
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="responsive-upload"
                >
                  {fileLists.aadharFrontImage.length === 0 && (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Aadhar Front</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG (Max: 5MB)</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item label="Aadhar Back">
                <Upload
                  listType="picture-card"
                  fileList={fileLists.aadharBackImage}
                  onChange={(info) => handleFileChange(info, "aadharBackImage")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="responsive-upload"
                >
                  {fileLists.aadharBackImage.length === 0 && (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Aadhar Back</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG (Max: 5MB)</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item label="PAN Card">
                <Upload
                  listType="picture-card"
                  fileList={fileLists.panCardImage}
                  onChange={(info) => handleFileChange(info, "panCardImage")}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="responsive-upload"
                >
                  {fileLists.panCardImage.length === 0 && (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">PAN Card</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG (Max: 5MB)</div>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Add custom CSS for responsive upload buttons */}
        <style jsx>{`
          :global(.responsive-upload .ant-upload-select) {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1/1;
          }
          :global(.responsive-upload .ant-upload-list-item) {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1/1;
          }
          :global(.upload-content) {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
          }
          :global(.upload-text) {
            margin-top: 4px;
            font-size: 12px;
            text-align: center;
            white-space: nowrap;
          }
          :global(.upload-hint) {
            font-size: 11px;
            color: #999;
            margin-top: 4px;
            text-align: center;
          }
          @media (max-width: 768px) {
            :global(.responsive-modal .ant-modal-body) {
              padding: 16px;
            }
            :global(.upload-text) {
              font-size: 10px;
              white-space: normal;
            }
          }
        `}</style>
      </Modal>
    </>
  );
};

export default AddManagerModal;
