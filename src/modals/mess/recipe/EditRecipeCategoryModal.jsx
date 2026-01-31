import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Modal, Spin } from "antd";
import { useEffect } from "react";
import { editRecipeCategory } from "../../../hooks/inventory/useInventory";

const EditRecipeCategoryModal = ({ open, onClose, initialData }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({ name: initialData.name });
    }
  }, [initialData, form]);

  const handleEditRecipeCategory = useMutation({
    mutationKey: ["edit-recipe-category"],
    mutationFn: (data) => editRecipeCategory(data),
    onSuccess: () => {
      messageApi.success("Recipe category updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["recipe-category", initialData.kitchenId],
      });
      onClose();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update category.";
      messageApi.error(errorMessage);
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const data = { id: initialData._id, ...values };
      handleEditRecipeCategory.mutate(data);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Recipe Category"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleEditRecipeCategory.isPending}
        okText="Update"
      >
        <Spin spinning={!initialData}>
          <Form form={form} layout="vertical" name="editCategoryForm">
            <Form.Item
              name="name"
              label="Category Name"
              rules={[
                { required: true, message: "Please input the category name!" },
              ]}
            >
              <Input placeholder="e.g., Desserts, Appetizers" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default EditRecipeCategoryModal;
