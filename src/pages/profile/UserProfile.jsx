import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Divider,
  Button,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  EditOutlined,
} from "@ant-design/icons";
import PageHeader from "../../components/common/PageHeader";
import SubscriptionSection from "../../modals/profile/SubscriptionSection";
import { useQuery } from "@tanstack/react-query";
import { getClientByEmail } from "../../hooks/client/useClient";
import EditProfileModal from "../../modals/profile/EditProfileModal";

const { Title, Text } = Typography;

const UserProfile = () => {
  // Get current user from Redux store
  const { user } = useSelector((state) => state.auth);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Determine if user is Admin/Client (Adjust this logic based on how your roles are named in Redux)
  // Example: If the user has a companyName, they are likely the main Admin/Client
  const isAdmin = user?.role?.roleName === "admin" || !!user?.companyName;

  const { data: clientData } = useQuery({
    queryKey: ["client-details", user?.email],
    queryFn: () => getClientByEmail(user?.email),
    enabled: isAdmin && !!user?.email,
  });
  console.log("Fetched client data:", user);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader
        title="My Profile"
        breadcrumb={[{ title: "Home" }, { title: "Profile" }]}
      />

      <Row gutter={[24, 24]}>
        {/* Basic Profile Details */}
        <Col xs={24} md={8}>
          <Card style={{ textAlign: "center", height: "100%" }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#059669", marginBottom: 16 }}
            />
            <Title level={4}>{clientData?.data?.name || "User Name"}</Title>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              {user?.role?.name?.toUpperCase() || "STAFF"}
            </Text>

            <Tag color={clientData?.data?.isVerified ? "success" : "warning"}>
              {clientData?.data?.isVerified ? "Verified Account" : "Unverified"}
            </Tag>
            <div style={{ marginTop: 24 }}>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
                block
              >
                Edit Profile
              </Button>
            </div>
          </Card>
        </Col>

        {/* Contact & Company Details */}
        <Col xs={24} md={16}>
          <Card title="Account Details" style={{ height: "100%" }}>
            <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item
                label={
                  <>
                    <MailOutlined /> Email
                  </>
                }
              >
                {clientData?.data?.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> Contact
                  </>
                }
              >
                {clientData?.data?.contact || "N/A"}
              </Descriptions.Item>

              {/* Only show Company details if they exist */}
              {clientData?.data?.companyName && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Descriptions.Item
                    label={
                      <>
                        <BankOutlined /> Organization
                      </>
                    }
                  >
                    {clientData?.data?.companyName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {clientData?.data?.address
                      ? `${clientData?.data.address.street || ""}, ${clientData?.data.address.city || ""}, ${clientData?.data.address.state || ""} ${clientData?.data.address.zipCode || ""}`
                      : "Address not provided"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Conditionally Render Subscription & License Section for Admins ONLY */}
      {isAdmin && <SubscriptionSection user={clientData?.data} />}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
      />
    </div>
  );
};

export default UserProfile;
