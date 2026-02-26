import {useState, useEffect} from "react";
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
import {editManager, getAllRoles} from "../../../hooks/employee/useEmployee";

const {Option} = Select;

const EditManagerModal = ({kitchens, open, onClose, manager}) => {
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

  // Get all properties from Redux
  const allProperties = useSelector(
    (state) => state.properties.properties || [],
  );
  const properties = allProperties.filter((property) => property._id !== null);

  // Fetch available roles for the dropdown
  const {data: rolesData, isLoading: rolesLoading} = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  // Effect to pre-fill the form when a manager is selected
  useEffect(() => {
    if (manager) {
      // Set manager type from manager data
      setManagerType(manager.managerType || manager.employeeType || "");

      form.setFieldsValue({
        name: manager.name,
        jobTitle: manager.jobTitle,
        email: manager.email,
        phone: manager.phone || manager.contactNumber,
        gender: manager.gender,
        role: manager.role?._id,
        salary: manager.salary,
        address: manager.address,
        selectedmanagerType: manager.managerType || manager.employeeType,
        propertyId: manager.propertyId || [],
        kitchenId: manager.kitchenId || [],
        password: "", // Password field empty by default
      });

      // Set initial file lists from existing URLs
      const newFileLists = {
        photo: [],
        aadharFrontImage: [],
        aadharBackImage: [],
        panCardImage: [],
      };

      if (manager.photo) {
        newFileLists.photo = [
          {
            uid: "-1",
            name: "photo.png",
            status: "done",
            url: manager.photo,
            thumbUrl: manager.photo,
          },
        ];
      }
      if (manager.aadharFrontImage) {
        newFileLists.aadharFrontImage = [
          {
            uid: "-2",
            name: "aadhar_front.png",
            status: "done",
            url: manager.aadharFrontImage,
            thumbUrl: manager.aadharFrontImage,
          },
        ];
      }
      if (manager.aadharBackImage) {
        newFileLists.aadharBackImage = [
          {
            uid: "-3",
            name: "aadhar_back.png",
            status: "done",
            url: manager.aadharBackImage,
            thumbUrl: manager.aadharBackImage,
          },
        ];
      }
      if (manager.panCardImage) {
        newFileLists.panCardImage = [
          {
            uid: "-4",
            name: "pan_card.png",
            status: "done",
            url: manager.panCardImage,
            thumbUrl: manager.panCardImage,
          },
        ];
      }
      setFileLists(newFileLists);
    } else {
      form.resetFields();
      setFileLists({
        photo: [],
        aadharFrontImage: [],
        aadharBackImage: [],
        panCardImage: [],
      });
      setManagerType("");
    }
  }, [manager, form]);

  const handleEditManager = useMutation({
    mutationFn: ({id, data}) => editManager(id, data),
    onSuccess: () => {
      messageApi.success("Manager updated successfully!");
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to update manager.",
      );
    },
  });

  const handleFileChange = ({fileList}, name) => {
    setFileLists((prev) => ({...prev, [name]: fileList.slice(-1)}));
  };

  // Custom filter function for property search
  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const handleManagerTypeChange = (value) => {
    setManagerType(value);
    // Clear the selection fields when changing manager type
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

      // Append manager type
      formData.append("managerType", values.selectedmanagerType);

      // Only append password if a new one is entered
      if (values.password) {
        formData.append("password", values.password);
      }

      // Append files only if they have been changed and exist
      if (fileLists.photo?.[0]?.originFileObj) {
        formData.append("photo", fileLists.photo[0].originFileObj);
      }
      if (fileLists.aadharFrontImage?.[0]?.originFileObj) {
        formData.append(
          "aadharFrontImage",
          fileLists.aadharFrontImage[0].originFileObj,
        );
      }
      if (fileLists.aadharBackImage?.[0]?.originFileObj) {
        formData.append(
          "aadharBackImage",
          fileLists.aadharBackImage[0].originFileObj,
        );
      }
      if (fileLists.panCardImage?.[0]?.originFileObj) {
        formData.append(
          "panCardImage",
          fileLists.panCardImage[0].originFileObj,
        );
      }

      handleEditManager.mutate({id: manager._id, data: formData});
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Manager Details"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleEditManager.isPending}
        okText="Save Changes"
        width={800}
        className="responsive-modal"
      >
        <Form
          form={form}
          layout="vertical"
          name="editManagerForm"
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

          {/* Manager Type Selection */}
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
                  onChange={handleManagerTypeChange}
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
                label="New Password (Optional)"
                help="Leave blank to keep current password"
              >
                <Input.Password placeholder="Enter a new password to update" />
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

          {/* Document Uploads - 4 columns for Photo, Aadhar Front, Aadhar Back, PAN Card */}
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
                  {fileLists.photo.length === 0 ? (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Photo</div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Change</div>
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
                  {fileLists.aadharFrontImage.length === 0 ? (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Aadhar Front</div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Change</div>
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
                  {fileLists.aadharBackImage.length === 0 ? (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Aadhar Back</div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Change</div>
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
                  {fileLists.panCardImage.length === 0 ? (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">PAN Card</div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <UploadOutlined />
                      <div className="upload-text">Change</div>
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

export default EditManagerModal;
