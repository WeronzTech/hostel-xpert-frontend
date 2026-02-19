import {useState} from "react";
import {Modal, Form, Input, Switch, Button, List, Popconfirm} from "antd";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";

const PRIMARY_COLOR = "#059669";

const LeaveCategoryModal = ({
  visible,
  onCancel,
  categories,
  onCreateCategory,
  onDeleteCategory,
  loading,
  propertyId,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onCreateCategory({
        ...values,
        propertyId,
      });
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    onDeleteCategory(id);
  };

  return (
    <Modal
      title="Manage Leave Categories"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{required: true, message: "Please enter category name"}]}
        >
          <Input placeholder="e.g., Sick Leave, Casual Leave, Annual Leave" />
        </Form.Item>

        <Form.Item
          name="autoApprove"
          label="Auto Approve"
          valuePropName="checked"
          initialValue={false}
          tooltip="If enabled, leave requests under this category will be automatically approved"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleSubmit}
            loading={submitting || loading}
            style={{backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR}}
            block
          >
            Add Category
          </Button>
        </Form.Item>
      </Form>

      <div style={{marginTop: 24}}>
        <h4 style={{marginBottom: 16}}>Existing Categories</h4>
        <List
          dataSource={categories}
          loading={loading}
          locale={{emptyText: "No categories found"}}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Delete Category"
                  description="Are you sure you want to delete this category?"
                  onConfirm={() => handleDelete(item._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <span>
                    Auto Approve:{" "}
                    <span
                      style={{color: item.autoApprove ? "#52c41a" : "#f5222d"}}
                    >
                      {item.autoApprove ? "Yes" : "No"}
                    </span>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

export default LeaveCategoryModal;
