import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Typography,
  Badge,
} from "antd";
import {
  CrownOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PlanSelectionModal from "../../modals/profile/PlanSelectionModal";
import PaymentHistoryModal from "../../modals/profile/PaymentHistoryModal";

const { Title, Text } = Typography;

const SubscriptionSection = ({ user }) => {
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  console.log("User subscription data:", user);

  // Safely extract subscription and license info
  const subscription = user?.subscription || {};
  const isPermanent = user?.isLicensePermanent;
  const licenseNumber = user?.licenseNumber || "Pending";

  const statusColor = subscription?.status === "active" ? "success" : "error";
  const endDate = subscription?.endDate
    ? dayjs(subscription.endDate).format("DD MMM YYYY")
    : "N/A";

  return (
    <>
      <Card
        title={
          <>
            <CrownOutlined style={{ color: "#d4af37", marginRight: 8 }} />{" "}
            Subscription & Licensing
          </>
        }
        style={{ marginTop: 24, borderColor: "#e5e7eb" }}
        extra={
          <Space>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setHistoryModalVisible(true)}
            >
              Payment History
            </Button>
            <Button type="primary" onClick={() => setPlanModalVisible(true)}>
              Upgrade / Renew
            </Button>
          </Space>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="License Number">
            <Space>
              <Text copyable strong>
                {licenseNumber}
              </Text>
              <Tag color={isPermanent ? "blue" : "orange"}>
                {isPermanent ? "Permanent" : "Temporary"}
              </Tag>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Subscription Status">
            <Badge
              status={statusColor}
              text={
                <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                  {subscription?.status || "None"}
                </span>
              }
            />
          </Descriptions.Item>

          <Descriptions.Item label="Current Plan">
            {subscription?.planId?.name || "No Active Plan"}
          </Descriptions.Item>

          <Descriptions.Item label="Valid Until">{endDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modals */}
      <PlanSelectionModal
        visible={planModalVisible}
        onClose={() => setPlanModalVisible(false)}
        clientId={user?._id || user?.id}
      />
      <PaymentHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        clientId={user?._id || user?.id}
      />
    </>
  );
};

export default SubscriptionSection;
