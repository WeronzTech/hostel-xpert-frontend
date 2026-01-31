import {useEffect} from "react";
import {Modal, message, Typography, Grid, Tag, Avatar, List, Space} from "antd";
import {useQuery} from "@tanstack/react-query";
import {getRoomOccupants} from "../../../hooks/property/useProperty";

const {Text, Title} = Typography;
const {useBreakpoint} = Grid;

const RoomOccupantsModal = ({roomId, visible, onClose}) => {
  const screens = useBreakpoint();
  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ["roomOccupants", roomId],
    queryFn: () => getRoomOccupants(roomId),
    enabled: !!visible && !!roomId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (visible && roomId) {
      refetch();
    }
  }, [visible, roomId]);

  useEffect(() => {
    if (visible && isError && error) {
      message.error(error.message || "Failed to fetch room occupants.");
    }
  }, [visible, isError, error]);

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const occupants = data?.occupants?.filter((o) => o.occupantDetails) || [];
  console.log(occupants);
  const getUserTypeTag = (userType) => {
    if (!userType) return <Tag color="orange">Daily</Tag>;
    const lowerType = userType.toLowerCase();
    if (lowerType === "student" || lowerType === "worker")
      return <Tag color="blue">Monthly</Tag>;
    if (lowerType === "dailyrent") return <Tag color="orange">Daily</Tag>;
    return <Tag color="orange">Daily</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    if (!status) return <Tag color="red">N/A</Tag>;
    const lowerStatus = status.toLowerCase();
    return lowerStatus === "paid" ? (
      <Tag color="green">Paid</Tag>
    ) : (
      <Tag color="red">Pending</Tag>
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderListItem = (occupant) => {
    const {occupantDetails} = occupant;
    return (
      <List.Item
        style={{
          padding: "12px 0",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Avatar
          style={{
            backgroundColor:
              occupantDetails.userType === "student" ||
              occupantDetails.userType === "worker"
                ? "#1890ff"
                : "#fa8c16",
          }}
        >
          {getInitials(occupantDetails.name)}
        </Avatar>
        <div style={{flex: 1, minWidth: 0}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong ellipsis style={{maxWidth: "60%"}}>
              {occupantDetails.name || "N/A"}
            </Text>
            <div style={{marginLeft: 8}}>
              {getPaymentStatusTag(occupantDetails.paymentStatus)}
            </div>
          </div>
          <Space size={[8, 16]} style={{marginTop: 4}}>
            {getUserTypeTag(occupantDetails.userType)}
            <Text type="secondary">{occupantDetails.contact || "N/A"}</Text>
          </Space>
        </div>
      </List.Item>
    );
  };

  return (
    <Modal
      title={
        <Title level={4} style={{marginBottom: 0}}>
          Room Occupants
        </Title>
      }
      open={visible}
      centered
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={screens.lg ? 600 : screens.md ? 500 : "90%"}
      bodyStyle={{
        padding: screens.xs ? "8px 0" : "16px 8px",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {isLoading && (
        <div style={{textAlign: "center", padding: "24px"}}>
          <Text>Loading occupants...</Text>
        </div>
      )}

      {!isLoading && occupants.length === 0 && (
        <div style={{textAlign: "center", padding: "24px"}}>
          <Text type="secondary">No occupants found for this room.</Text>
        </div>
      )}

      {!isLoading && occupants.length > 0 && (
        <List
          size="small"
          dataSource={occupants}
          renderItem={renderListItem}
          pagination={
            occupants.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: false,
                  simple: true,
                  style: {marginTop: "16px"},
                }
              : false
          }
        />
      )}
    </Modal>
  );
};

export default RoomOccupantsModal;
