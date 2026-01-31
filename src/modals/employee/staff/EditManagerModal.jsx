import { useState, useEffect } from "react";
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
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editManager, getAllRoles } from "../../../hooks/employee/useEmployee"; // Assuming updateManager exists

const { Option } = Select;

const EditManagerModal = ({ open, onClose, manager }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileLists, setFileLists] = useState({
    photo: [],
    aadharImage: [],
  });
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  useEffect(() => {
    if (manager) {
      form.setFieldsValue({
        ...manager,
        role: manager.role?._id,
        password: "",
      });

      const newFileLists = {};
      if (manager.photo) {
        newFileLists.photo = [
          { uid: "-1", name: "photo.png", status: "done", url: manager.photo },
        ];
      }
      if (manager.aadhaarImage) {
        newFileLists.aadharImage = [
          {
            uid: "-2",
            name: "aadhar.png",
            status: "done",
            url: manager.aadhaarImage,
          },
        ];
      }
      setFileLists(newFileLists);
    } else {
      form.resetFields();
      setFileLists({ photo: [], aadharImage: [] });
    }
  }, [manager, form]);

  const handleEditManager = useMutation({
    mutationFn: ({ id, data }) => editManager(id, data),
    onSuccess: () => {
      messageApi.success("Manager updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to update manager."
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

      Object.keys(values).forEach((key) => {
        if (values[key] && key !== "password") {
          // Do not send password if unchanged
          formData.append(key, values[key]);
        }
      });
      // Only append password if a new one is entered
      if (values.password) {
        formData.append("password", values.password);
      } else {
        formData.append("password", manager.password);
      }

      if (fileLists.photo?.[0]?.originFileObj) {
        formData.append("photo", fileLists.photo[0].originFileObj);
      }
      if (fileLists.aadharImage?.[0]?.originFileObj) {
        formData.append("aadharImage", fileLists.aadharImage[0].originFileObj);
      }

      handleEditManager.mutate({ id: manager._id, data: formData });
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
      >
        <Form form={form} layout="vertical" name="editManagerForm">
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
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
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
            <Col span={12}>
              <Form.Item name="password" label="New Password (Optional)">
                <Input.Password placeholder="Enter a new password to update" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
          </Row>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item label="Aadhar Card">
                <Upload
                  listType="picture"
                  fileList={fileLists.aadharImage}
                  onChange={(info) => handleFileChange(info, "aadharImage")}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Change Aadhar</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditManagerModal;
