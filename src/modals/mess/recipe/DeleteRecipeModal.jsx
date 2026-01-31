import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, message } from "antd";
import { deleteRecipe } from "../../../hooks/inventory/useInventory";

const DeleteRecipeModal = ({ open, onClose, recipe }) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteRecipe(recipe._id),
    onSuccess: () => {
      messageApi.success("Recipe deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      onClose();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete recipe.";
      messageApi.error(errorMessage);
    },
  });

  return (
    <>
      {contextHolder}
      <Modal
        title="Delete Recipe"
        open={open}
        onOk={mutate}
        onCancel={onClose}
        okText="Delete"
        okButtonProps={{ danger: true }}
        confirmLoading={isPending}
      >
        <p>
          Are you sure you want to delete the recipe "{recipe?.name}"? This
          action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default DeleteRecipeModal;
