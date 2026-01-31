import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Button,
  message,
  Spin,
  Grid,
} from "antd";
import {UploadOutlined} from "../../icons/index.js";
import {getUsers} from "../../hooks/users/useUser.js";

const {TextArea} = Input;
const {useBreakpoint} = Grid;

const userGroups = [
  {label: "Mess Only", value: "mess"},
  {label: "Monthly", value: "monthly"},
  {label: "Daily Rent", value: "daily"},
];

const AlertNotficationModal = ({open, onClose, onSubmit}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState({visible: false, image: ""});
  const [rentType, setRentType] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const modalWidth = isMobile ? 320 : 520;
  const previewWidth = isMobile ? 320 : 600;

  // 🟢 Use Query for fetching users
  const {
    data: usersData = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users", rentType],
    queryFn: async () => {
      if (!rentType) return [];
      const response = await getUsers({rentType, all: true});
      return response?.data || [];
    },
    enabled: !!rentType, // Only fetch when rentType is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // 🟢 Show error message if users fetch fails
  if (usersError) {
    console.error("Failed to fetch users:", usersError);
    message.error("Failed to load users");
  }

  // 🟢 Handle Rent Type Change (used only to filter users)
  const handleUserGroupChange = (value) => {
    setRentType(value);
    form.setFieldsValue({users: []});
  };

  // 🟢 Submit form data
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.users || values.users.length === 0) {
        message.error("Please select at least one user");
        return;
      }

      const image = fileList.length > 0 ? fileList[0] : null;

      // ✅ Do not send userGroup — only send userId & image
      onSubmit({...values, image, userGroup: undefined});
      form.resetFields();
      setFileList([]);
      setPreview({visible: false, image: ""});
      setRentType(null);
    } catch {
      message.error("Please fill all required fields");
    }
  };

  // 🟢 Handle Cancel
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreview({visible: false, image: ""});
    setRentType(null);
    onClose();
  };

  // 🟢 Upload Handlers
  const handleUploadChange = ({fileList}) => setFileList(fileList.slice(-1));

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file.originFileObj);
      });
    }
    setPreview({visible: true, image: file.url || file.preview});
  };

  return (
    <>
      <Modal
        title="Send Alert Notification"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Send"
        cancelText="Cancel"
        width={modalWidth}
        styles={{body: {maxHeight: "70vh", overflowY: "auto", padding: 12}}}
      >
        <Form
          layout="vertical"
          form={form}
          name="alertNotificationForm"
          initialValues={{users: []}}
        >
          {/* Title */}
          <Form.Item
            name="title"
            label="Title"
            rules={[{required: true, message: "Title is required"}]}
          >
            <Input placeholder="Enter notification title" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label="Description"
            rules={[{required: true, message: "Description is required"}]}
          >
            <TextArea placeholder="Enter notification description" rows={4} />
          </Form.Item>

          {/* Rent Type - only for filtering users */}
          <Form.Item
            name="userGroup"
            label="Select Rent Type"
            rules={[{required: true, message: "Please select a rent type"}]}
          >
            <Select
              placeholder="Select rent type"
              options={userGroups}
              onChange={handleUserGroupChange}
            />
          </Form.Item>

          {/* Users */}
          <Form.Item
            name="users"
            label="Select User"
            rules={[{required: true, message: "Please select a user"}]}
          >
            <Select
              placeholder={
                rentType ? "Select a user" : "First select rent type"
              }
              options={usersData.map((user) => ({
                label: `${user.name} (${user.email})`,
                value: String(user._id),
              }))}
              showSearch
              optionFilterProp="label"
              loading={loadingUsers}
              notFoundContent={
                loadingUsers ? (
                  <Spin size="small" />
                ) : rentType ? (
                  "No users found"
                ) : (
                  "Select a rent type first"
                )
              }
              disabled={!rentType || loadingUsers}
            />
          </Form.Item>

          {/* Upload Image */}
          <Form.Item name="image" label="Image">
            <Upload
              name="alertNotificationImage"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept="image/*"
              onPreview={handlePreview}
              showUploadList={{showPreviewIcon: true}}
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
        onCancel={() => setPreview({visible: false, image: ""})}
        centered
        width={previewWidth}
      >
        <img
          alt="Preview"
          style={{width: "100%", borderRadius: 4}}
          src={preview.image}
        />
      </Modal>
    </>
  );
};

export default AlertNotficationModal;
