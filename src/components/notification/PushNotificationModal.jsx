import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Button,
  message,
  Grid,
} from "antd";
import { UploadOutlined } from "../../icons/index.js";

const { TextArea } = Input;
const { useBreakpoint } = Grid;

const userGroups = [
  { label: "Mess Only", value: "messOnly" },
  { label: "Students", value: "studentOnly" },
  { label: "Workers", value: "workerOnly" },
  { label: "Daily Rent", value: "dailyRentOnly" },
];

const PushNotificationModal = ({ open, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState({ visible: false, image: "" });

  const screens = useBreakpoint(); // Detect screen size
  const isMobile = !screens.md; // md = 768px breakpoint

  const modalWidth = isMobile ? 320 : 520; // or 90% if you want full width
  const previewWidth = isMobile ? 320 : 600;

  // Function to rest modal
  const resetModal = () => {
    form.resetFields();
    setFileList([]);
    setPreview({ visible: false, image: "" });
  };

  // Function to handle modal submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const imageFile = fileList.length > 0 ? fileList[0].originFileObj : null;

      await onSubmit({ ...values, image: imageFile, resetModal });
      form.resetFields();
      setFileList([]);
      setPreview({ visible: false, image: "" });
    } catch {
      message.error(`Please fill all required fields`);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreview({ visible: false, image: "" });
    onClose();
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1));
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file.originFileObj);
      });
    }

    setPreview({
      visible: true,
      image: file.url || file.preview,
    });
  };

  return (
    <>
      <Modal
        title="Create Push Notification"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{ loading }}
        modalRender={(modal) => modal}
        width={modalWidth}
        styles={{
          body: {
            padding: 2,
            maxHeight: "70vh",
            overflowY: "auto",
          },
        }}
      >
        <Form
          layout="vertical"
          form={form}
          name="pushNotificationForm"
          initialValues={{ users: [] }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter notification title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea placeholder="Enter notification description" rows={4} />
          </Form.Item>

          <Form.Item
            name="users"
            label="Select User Groups"
            rules={[
              { required: true, message: "Please select at least one group" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select user groups to notify"
              options={userGroups}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            rules={[
              {
                validator: () => {
                  if (fileList.length === 0) {
                    return Promise.reject("Please upload an image");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept="image/*"
              onPreview={handlePreview}
              showUploadList={{ showPreviewIcon: true }}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={preview.visible}
        title="Preview Image"
        footer={null}
        onCancel={() => setPreview({ visible: false, image: "" })}
        centered
        width={previewWidth}
      >
        <img
          alt="Preview"
          style={{ width: "100%", borderRadius: 4 }}
          src={preview.image}
        />
      </Modal>
    </>
  );
};

export default PushNotificationModal;
