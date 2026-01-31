import { useEffect, useState } from "react";
import { Modal, Typography, Result } from "antd";
import { ExclamationCircleOutlined } from "../../icons/index.js";

const { Paragraph, Text, Title } = Typography;

const SessionExpiredModal = ({ onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + 5000;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setCountdown(0);
        onClose();
        return;
      }

      setCountdown(Math.ceil(remaining / 1000));
      requestAnimationFrame(updateCountdown);
    };

    const animationFrame = requestAnimationFrame(updateCountdown);

    return () => cancelAnimationFrame(animationFrame);
  }, [onClose]);

  return (
    <Modal
      open={true}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      width={420}
      zIndex={9999}
    >
      <Result
        icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
        title={<Title level={3}>Session Expired</Title>}
        subTitle={
          <Paragraph style={{ marginTop: 16 }}>
            For security reasons, your session has expired. You’ll be
            automatically logged out in{" "}
            <Text strong type="danger">
              {countdown}
            </Text>{" "}
            second{countdown !== 1 ? "s" : ""}.
          </Paragraph>
        }
      />
    </Modal>
  );
};

export default SessionExpiredModal;
