import { useState, useEffect } from "react";
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
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { editStaff, getAllRoles } from "../../../hooks/employee/useEmployee";

const { Option } = Select;

const EditStaffModal = ({ open, onClose, staff }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharFrontImage: [],
    aadharBackImage: [],
  });
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  // Effect to pre-fill the form when a staff member is selected
  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        ...staff,
        dob: staff.dob ? dayjs(staff.dob) : null,
        joinDate: staff.joinDate ? dayjs(staff.joinDate) : null,
        role: staff.role?._id,
      });

      // Set initial file lists from existing URLs
      const newFileLists = {};
      if (staff.photo) {
        newFileLists.photo = [
          { uid: "-1", name: "photo.png", status: "done", url: staff.photo },
        ];
      }
      if (staff.aadharFrontImage) {
        newFileLists.aadharFrontImage = [
          {
            uid: "-2",
            name: "aadhar_front.png",
            status: "done",
            url: staff.aadharFrontImage,
          },
        ];
      }
      if (staff.aadharBackImage) {
        newFileLists.aadharBackImage = [
          {
            uid: "-3",
            name: "aadhar_back.png",
            status: "done",
            url: staff.aadharBackImage,
          },
        ];
      }
      setFileLists(newFileLists);
    } else {
      form.resetFields();
      setFileLists({ photo: [], aadharFrontImage: [], aadharBackImage: [] });
    }
  }, [staff, form]);

  const handleEditStaff = useMutation({
    mutationFn: ({ id, data }) => editStaff(id, data),
    onSuccess: () => {
      messageApi.success("Staff updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to update staff."
      );
    },
  });

  const handleFileChange = ({ fileList }, name) => {
    setFileLists((prev) => ({ ...prev, [name]: fileList.slice(-1) }));
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
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      formData.append("propertyId", staff?.propertyId);

      // Append new files if they have been changed
      if (fileLists.photo?.[0]?.originFileObj) {
        formData.append("photo", fileLists.photo[0].originFileObj);
      }
      if (fileLists.aadharFrontImage?.[0]?.originFileObj) {
        formData.append(
          "aadharFrontImage",
          fileLists.aadharFrontImage[0].originFileObj
        );
      }
      if (fileLists.aadharBackImage?.[0]?.originFileObj) {
        formData.append(
          "aadharBackImage",
          fileLists.aadharBackImage[0].originFileObj
        );
      }

      handleEditStaff.mutate({ id: staff._id, data: formData });
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Employee Details"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleEditStaff.isPending}
        okText="Save Changes"
        width={800}
      >
        <Form form={form} layout="vertical" name="editStaffForm">
          {/* Form fields are identical to AddStaffModal, so they are omitted for brevity but should be included here */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ required: true, type: "email" }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select placeholder="Select role" loading={rolesLoading}>
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
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter monthly salary"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="joinDate"
                label="Join Date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Photo">
                <Upload
                  listType="picture"
                  fileList={fileLists.photo}
                  onChange={(info) => handleFileChange(info, "photo")}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Change Photo</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Aadhar Front">
                <Upload
                  listType="picture"
                  fileList={fileLists.aadharFrontImage}
                  onChange={(info) =>
                    handleFileChange(info, "aadharFrontImage")
                  }
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Change Front</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Aadhar Back">
                <Upload
                  listType="picture"
                  fileList={fileLists.aadharBackImage}
                  onChange={(info) => handleFileChange(info, "aadharBackImage")}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Change Back</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditStaffModal;
