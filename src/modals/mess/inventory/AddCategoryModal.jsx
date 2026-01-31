import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Modal, Select } from "antd";
import { getAllHeavensProperties } from "../../../hooks/property/useProperty";
import { addCategory } from "../../../hooks/inventory/useInventory";

const { Option } = Select;

const AddCategoryModal = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getAllHeavensProperties(),
    enabled: open,
  });

  const AddCategory = useMutation({
    mutationKey: ["add-category"],
    mutationFn: (categoryData) => addCategory(categoryData),
    onSuccess: (data) => {
      messageApi.success(data.message || "Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message);
    },
  });

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="Add New Category"
        onCancel={onClose}
        confirmLoading={AddCategory.isLoading}
        onOk={() => AddCategory.mutate(form.getFieldsValue())}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="add_category_form">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: "Please enter the category name!" },
            ]}
          >
            <Input placeholder="e.g., Vegetables" />
          </Form.Item>
          <Form.Item
            name="propertyId"
            label="Property"
            rules={[{ required: true, message: "Please select a property!" }]}
          >
            <Select placeholder="Select a property" loading={propertiesLoading}>
              {properties?.map((prop) => (
                <Option key={prop._id} value={prop._id}>
                  {prop.propertyName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddCategoryModal;
