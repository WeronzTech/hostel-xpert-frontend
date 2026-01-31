import { Modal, Typography } from "antd";

const { Text } = Typography;

const ConfirmationModal = ({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  variant = "primary", // "primary" | "danger" | "default"
  confirmLoading = false,
}) => {
  const okButtonProps = {
    type: variant === "default" ? "default" : "primary",
    danger: variant === "danger",
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      maskClosable={false}
      okButtonProps={okButtonProps}
    >
      <p className="font-semibold text-base text-gray-600 block leading-relaxed">{message}</p>
    </Modal>
  );
};

export default ConfirmationModal;
