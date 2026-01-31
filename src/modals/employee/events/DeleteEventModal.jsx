import { Modal, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventPermissions } from "../../../hooks/employee/useEmployee";

const DeleteEventModal = ({ open, onClose, eventPermission }) => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDeleteEvent = useMutation({
    mutationFn: (id) => deleteEventPermissions(id),
    onSuccess: () => {
      messageApi.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["eventPermissions"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to delete event."
      );
    },
  });

  const handleOk = () => {
    if (eventPermission?._id) {
      handleDeleteEvent.mutate(eventPermission._id);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Confirm Deletion"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleDeleteEvent.isPending}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the event:{" "}
          <strong>{eventPermission?.eventName}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default DeleteEventModal;
