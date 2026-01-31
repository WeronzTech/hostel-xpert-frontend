import {Modal, Button, Typography} from "antd";

const {Text} = Typography;

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  className = "",
  residentName, // <- add this prop
}) => {
  return (
    <Modal
      open={isOpen}
      title={
        <span className="text-lg font-semibold text-gray-800">{title}</span>
      }
      onCancel={onCancel}
      onOk={onConfirm}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" danger onClick={onConfirm}>
          Confirm
        </Button>,
      ]}
      centered
      wrapClassName={className}
      maskClosable={false}
    >
      <Text
        type="secondary"
        className="text-base text-gray-700 block leading-relaxed"
      >
        {message ? (
          message
        ) : (
          <>
            Are you sure you want to vacate <Text strong>{residentName}</Text>?
          </>
        )}
      </Text>
    </Modal>
  );
};

export default ConfirmModal;
