import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Modal } from "antd";
import { addRecipeCategory } from "../../../hooks/inventory/useInventory";

const AddRecipeCategoryModal = ({ open, onClose, kitchenId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddRecipeCategory = useMutation({
    mutationKey: ["add-recipe-category"],
    mutationFn: (data) => addRecipeCategory(data),
    onSuccess: () => {
      messageApi.success("Recipe category created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["recipe-category", kitchenId],
      });
      onClose();
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create category.";
      messageApi.error(errorMessage);
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, kitchenId };
      handleAddRecipeCategory.mutate(data);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Recipe Category"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleAddRecipeCategory.isPending}
        okText="Save"
      >
        <Form form={form} layout="vertical" name="addCategoryForm">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              {
                required: true,
                message: "Please input the recipe category name!",
              },
            ]}
          >
            <Input placeholder="e.g., Desserts, Appetizers" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddRecipeCategoryModal;
