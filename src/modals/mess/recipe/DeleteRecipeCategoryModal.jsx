import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRecipeCategory } from "../../../hooks/inventory/useInventory";
import { Button, message, Modal } from "antd";

const DeleteRecipeCategoryModal = ({ open, onClose, category }) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  console.log("Category", category);

  const handleDeleteRecipeCategory = useMutation({
    mutationKey: ["delete-recipe-category"],
    mutationFn: (data) => deleteRecipeCategory(data),
    onSuccess: () => {
      messageApi.success("Recipe category deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["recipe-category", category.kitchenId],
      });
      onClose();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete category.";
      messageApi.error(errorMessage);
    },
  });

  const handleDelete = () => {
    if (category) {
      handleDeleteRecipeCategory.mutate(category._id);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Delete Recipe Category"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={handleDeleteRecipeCategory.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
      >
        {category ? (
          <p>
            Are you sure you want to delete the category "
            <strong>{category.name}</strong>"? This action cannot be undone.
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </>
  );
};

export default DeleteRecipeCategoryModal;
