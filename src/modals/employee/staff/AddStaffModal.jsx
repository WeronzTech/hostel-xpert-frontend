import {useState} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Row,
  Col,
  InputNumber,
  message,
} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import {addStaff} from "../../../hooks/employee/useEmployee";

const {Option} = Select;

const AddStaffModal = ({kitchens, open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharFrontImage: [],
    aadharBackImage: [],
    panCardImage: [],
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [employeeType, setEmployeeType] = useState("");

  // Get all properties from Redux and filter out "All Properties" option
  const allProperties = useSelector(
    (state) => state.properties.properties || [],
  );
  const properties = allProperties.filter((property) => property._id !== null);

  const createdBy = useSelector((state) => state.auth.user?.id);

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
        panCardImage: [],
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
        className="responsive-modal" // Add custom class for responsive styling
      >
        <Form
          form={form}
          layout="vertical"
          name="addStaffForm"
          className="responsive-form"
        >
          {/* Desktop: 3 columns, Mobile: 1 column */}
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
                name="contactNumber"
                label="Contact Number"
                rules={[{required: true}]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
          </Row>

          {/* Employee Type Selection - Full width on mobile */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="selectedEmployeeType"
                label="Employee Type"
                rules={[
                  {required: true, message: "Please select employee type"},
                ]}
              >
                <Select
                  placeholder="Select employee type"
                  onChange={handleEmployeeTypeChange}
                >
                  <Option value="Property">Property Employee</Option>
                  <Option value="Kitchen">Kitchen Employee</Option>
                  <Option value="Property & Kitchen">
                    Both (Property & Kitchen)
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Property Selection (shown for property or both) */}
          {(employeeType === "Property" ||
            employeeType === "Property & Kitchen") && (
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

          {/* Kitchen Selection (shown for kitchen or both) */}
          {(employeeType === "Kitchen" ||
            employeeType === "Property & Kitchen") && (
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
                    {kitchens.map((kitchen) => (
                      <Option key={kitchen._id} value={kitchen._id}>
                        {kitchen.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Desktop: 3 columns (1/3, 2/3), Mobile: Stack vertically */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={8}>
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

            <Col xs={24} sm={24} md={16} lg={16}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{required: true}]}
              >
                <Input placeholder="Enter full address" />
              </Form.Item>
            </Col>
          </Row>

          {/* Desktop: 2 columns, Mobile: Stack vertically */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={12}>
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

            <Col xs={24} sm={24} md={12} lg={12}>
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
          {/* Desktop: 4 columns, Mobile: 2 columns (2 rows of 2) */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item
                label="Profile Photo"
                validateStatus={fileLists.photo.length === 0 ? "error" : ""}
              >
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
                <div className="upload-hint">JPG, PNG</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item
                label="Aadhar Front"
                validateStatus={
                  fileLists.aadharFrontImage.length === 0 ? "error" : ""
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
                  className="responsive-upload"
                >
                  {fileLists.aadharFrontImage.length === 0 && (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Aadhar Front</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item
                label="Aadhar Back"
                validateStatus={
                  fileLists.aadharBackImage.length === 0 ? "error" : ""
                }
              >
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
                <div className="upload-hint">JPG, PNG</div>
              </Form.Item>
            </Col>

            <Col xs={12} sm={12} md={6} lg={6}>
              <Form.Item
                label="PAN Card"
                validateStatus={
                  fileLists.panCardImage.length === 0 ? "error" : ""
                }
              >
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
                      <div className="upload-text">PAN</div>
                    </div>
                  )}
                </Upload>
                <div className="upload-hint">JPG, PNG</div>
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

export default AddStaffModal;
