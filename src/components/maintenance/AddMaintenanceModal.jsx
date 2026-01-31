import {useState} from "react";
import {Modal, Form, Input, Select, Upload, Button, message, Image} from "antd";
import {CameraOutlined, DeleteOutlined} from "@ant-design/icons";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {createMaintenance} from "../../hooks/property/useProperty";

const {TextArea} = Input;

const COMMON_ISSUES = [
  "Leaking Faucet",
  "Broken AC",
  "Electrical Problem",
  "Plumbing Issue",
  "Door Lock Problem",
  "Window Repair",
  "Paint Damage",
  "Furniture Repair",
  "Appliance Malfunction",
  "Pest Control",
  "Other",
];

const AddMaintenanceModal = ({open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState([]);
  const [customIssue, setCustomIssue] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const {user} = useSelector((state) => state.auth);
  const {properties, selectedProperty} = useSelector(
    (state) => state.properties
  );

  const propertyOptions = properties.map((prop) => ({
    label: prop.name,
    value: prop.id,
  }));

  const {mutate, isPending} = useMutation({
    mutationFn: (formData) => createMaintenance(formData),
    onSuccess: () => {
      message.success("Maintenance request created successfully!");
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ["maintenance", selectedProperty?.id, "Pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["maintenanceCount", selectedProperty?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-requests"],
      });
      onClose();
      form.resetFields();
      setFileList([]);
      setCustomIssue(false);
      setImagePreview(null);
    },
    onError: (error) => {
      message.error(error.message || "Failed to create maintenance request");
    },
  });

  const handleFileChange = ({file}) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setFileList([file]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFileList([]);
  };

  const handleIssueChange = (value) => {
    if (value === "Other") {
      setCustomIssue(true);
      form.setFieldsValue({issue: ""});
    } else {
      setCustomIssue(false);
      form.setFieldsValue({issue: value});
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      // Required fields
      formData.append("reportedBy", user.id);
      formData.append("userName", user.name);
      formData.append("issue", values.issue);
      formData.append("description", values.description);
      formData.append("propertyId", values.propertyId || selectedProperty?.id);

      // Optional image upload
      if (fileList.length > 0 && fileList[0]) {
        formData.append("issueImage", fileList[0]);
      }

      // Debugging
      console.log("Submitting form data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      mutate(formData);
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Please fill in all required fields");
    }
  };

  return (
    <Modal
      centered
      title={
        selectedProperty?.id ? (
          <>
            New Maintenance Request in{" "}
            <strong>
              {selectedProperty.name.replace(/^Heavens Living -\s*/, "")}
            </strong>
          </>
        ) : (
          "New Maintenance Request"
        )
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isPending}
      okText="Submit Request"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {!selectedProperty?.id && (
          <Form.Item
            name="propertyId"
            label="Property"
            rules={[{required: true, message: "Please select a property"}]}
          >
            <Select
              placeholder="Select property"
              options={propertyOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}

        <Form.Item
          name="issue"
          label="Issue Type"
          rules={[
            {required: true, message: "Please select or describe the issue"},
          ]}
        >
          {!customIssue ? (
            <Select
              placeholder="Select common issue"
              onChange={handleIssueChange}
              options={COMMON_ISSUES.map((issue) => ({
                value: issue,
                label: issue,
              }))}
              showSearch
            />
          ) : (
            <Input placeholder="Describe the issue" autoFocus />
          )}
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{required: true, message: "Please provide details"}]}
        >
          <TextArea
            rows={4}
            placeholder="Describe the issue in detail..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label="Upload Photo (Optional)">
          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Issue preview"
                width={200}
                className="rounded"
              />
              <Button
                icon={<DeleteOutlined />}
                shape="circle"
                danger
                size="small"
                className="absolute -top-2 -right-2"
                onClick={removeImage}
              />
            </div>
          ) : (
            <Upload
              accept="image/*"
              capture="environment"
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileChange({file});
                return false; // Prevent auto upload
              }}
            >
              <Button icon={<CameraOutlined />}>Take Photo</Button>
            </Upload>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Add photo of the issue (optional)
          </p>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMaintenanceModal;
