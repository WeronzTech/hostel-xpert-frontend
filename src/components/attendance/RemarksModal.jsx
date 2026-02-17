import {Modal, Space, Input} from "antd";
import {CommentOutlined, ExclamationCircleOutlined} from "@ant-design/icons";

const {TextArea} = Input;
const PRIMARY_COLOR = "#059669";

const RemarksModal = ({
  visible,
  onCancel,
  onOk,
  studentName,
  remarksText,
  onRemarksChange,
  loading,
}) => {
  return (
    <Modal
      centered
      title={
        <Space>
          <CommentOutlined style={{color: PRIMARY_COLOR}} />
          <span>Remarks - {studentName}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText="Save Remarks"
      confirmLoading={loading}
      destroyOnClose
    >
      <div style={{marginTop: 16}}>
        <TextArea
          rows={4}
          value={remarksText}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Enter remarks for this attendance record..."
          maxLength={200}
          showCount
        />
        <div style={{marginTop: 8, color: "#666", fontSize: "12px"}}>
          <ExclamationCircleOutlined style={{marginRight: 4}} />
          Remarks will be saved with the current attendance status
        </div>
      </div>
    </Modal>
  );
};

export default RemarksModal;
