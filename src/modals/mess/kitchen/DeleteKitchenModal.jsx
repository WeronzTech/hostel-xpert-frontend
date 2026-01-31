import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, message, Typography } from "antd";
import { deleteKitchen } from "../../../hooks/inventory/useInventory";

const { Text } = Typography;

const DeleteKitchenModal = ({ open, onClose, kitchenData }) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const deleteKitchenMutation = useMutation({
    mutationFn: (id) => deleteKitchen(id),
    onSuccess: () => {
      messageApi.success("Kitchen deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["kitchens"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to delete kitchen.");
    },
  });

  const handleConfirmDelete = () => {
    if (kitchenData?._id) {
      deleteKitchenMutation.mutate(kitchenData._id);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Confirm Deletion"
        open={open}
        onOk={handleConfirmDelete}
        onCancel={onClose}
        confirmLoading={deleteKitchenMutation.isPending}
        okText="Delete"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Text>
          Are you sure you want to delete the kitchen "
          <Text strong>{kitchenData?.name}</Text>"?
        </Text>
        <br />
        <Text type="danger">This action cannot be undone.</Text>
      </Modal>
    </>
  );
};

export default DeleteKitchenModal;
