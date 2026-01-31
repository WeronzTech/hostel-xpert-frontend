import { Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoles } from "../../../hooks/employee/useEmployee";

const DeleteRoleModal = ({ open, onClose, role }) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDeleteRole = useMutation({
    mutationFn: () => deleteRoles(role._id),
    onSuccess: () => {
      messageApi.success(`Role "${role.roleName}" deleted successfully!`);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to delete role."
      );
    },
  });

  const handleConfirmDelete = () => {
    handleDeleteRole.mutate();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Confirm Deletion"
        open={open}
        onOk={handleConfirmDelete}
        onCancel={onClose}
        okText="Delete"
        okButtonProps={{ danger: true, loading: handleDeleteRole.isPending }}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete the role "
          <strong>{role?.roleName}</strong>"? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default DeleteRoleModal;
