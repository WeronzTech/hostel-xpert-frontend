import { Modal } from "antd";

const DeleteEmployeeModal = ({ open, onClose, onConfirm, loading }) => {
  return (
    <Modal
      title={"Confirm Deletion"}
      open={open}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Delete"
      okButtonProps={{ danger: true, loading: loading }}
      cancelText="Cancel"
    >
      <p>{"Are you sure you want to delete this employee?"}</p>
    </Modal>
  );
};

export default DeleteEmployeeModal;
