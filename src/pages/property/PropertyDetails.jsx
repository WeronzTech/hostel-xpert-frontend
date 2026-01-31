import {useParams, useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  Card,
  Typography,
  Spin,
  Tag,
  Descriptions,
  Divider,
  message,
  Tabs,
  Progress,
  Avatar,
  List,
  Badge,
  Button,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  SafetyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {ActionButton, PageHeader, StatsGrid} from "../../components";
import {getPropertyDetails} from "../../hooks/property/useProperty";
import {FaBed, FaUniversity, FaUserCheck} from "react-icons/fa";
import {purpleButton} from "../../data/common/color";

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const PropertyDetails = () => {
  const {id} = useParams();
  const navigate = useNavigate();

  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["propertyDetails", id],
    queryFn: () => getPropertyDetails(id),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  if (isError) {
    message.error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to load property details"
    );
    return (
      <Text type="danger" className="flex justify-center items-center h-screen">
        Could not load property details
      </Text>
    );
  }
  if (!property)
    return (
      <Text
        type="secondary"
        className="flex justify-center items-center h-screen"
      >
        No property found
      </Text>
    );

  const {
    _id,
    propertyName,
    propertyTitle,
    location,
    totalBeds,
    occupiedBeds,
    startingPrice,
    deposit,
    sharingPrices,
    propertyType,
    contacts,
    amenities,
    createdAt,
    updatedAt,
  } = property;

  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const featureList = [
    {icon: <WifiOutlined />, text: "High-Speed WiFi"},
    {icon: <CarOutlined />, text: "Parking Space"},
    {icon: <CoffeeOutlined />, text: "Cafeteria"},
    {icon: <SafetyOutlined />, text: "24/7 Security"},
    ...(amenities || []).map((amenity) => ({
      icon: <CheckCircleOutlined />,
      text: amenity,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Property Header */}
      <PageHeader title={propertyName} subtitle={propertyTitle} />

      {/* Stats Overview */}
      <StatsGrid
        stats={[
          {
            title: "Total Beds",
            value: totalBeds,
            icon: <FaBed className="text-xl" />,
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Occupied Beds",
            value: `${occupiedBeds}`,
            icon: <FaBed className="text-xl" />,
            color: "bg-purple-100 text-purple-600",
          },
          {
            title: "Occupancy Rate",
            value: `${occupancyRate}%`,
            icon: <FaUserCheck className="text-xl" />,
            color: "bg-green-100 text-green-600",
          },
          {
            title: "Deposit",
            value: `₹${
              (deposit?.refundable || 0) + (deposit?.nonRefundable || 0)
            }`,
            icon: <FaUniversity className="text-xl" />,
            color: "bg-orange-100 text-orange-600",
          },
        ]}
      />

      {/* Main Content */}
      <Tabs defaultActiveKey="1" className="custom-tabs">
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <InfoCircleOutlined />
              Overview
            </span>
          }
          key="1"
        >
          <div className="space-y-6">
            {/* Header */}
            <Card className="shadow-sm border-0">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <Title level={4} className="mb-1">
                    {propertyName}
                  </Title>
                  <div className="flex flex-wrap items-center gap-2 text-gray-500">
                    <EnvironmentOutlined />
                    <Text>{location}</Text>
                    <Tag color="blue">{propertyType?.toUpperCase()}</Tag>
                  </div>
                </div>

                <ActionButton
                  icon={<EditOutlined className="text-lg mt-1" />}
                  customTheme={purpleButton}
                  onClick={() => navigate(`/property/edit/${_id}`)}
                >
                  Edit Property
                </ActionButton>
              </div>
            </Card>

            {/* Description */}
            <Card
              title="Description"
              className="shadow-sm border-0"
              style={{marginTop: 20}}
            >
              <Text>{propertyTitle}</Text>
            </Card>

            {/* Pricing */}
            <Card
              title="Pricing"
              className="shadow-sm border-0"
              style={{marginTop: 20}}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {label: "Starting Price", value: startingPrice},
                  {
                    label: "Refundable Deposit",
                    value: deposit?.refundable || "0",
                  },
                  {
                    label: "Non-Refundable Deposit",
                    value: deposit?.nonRefundable || "0",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <Text type="secondary">{item.label}</Text>
                    <Title
                      level={4}
                      style={{marginTop: "4px", marginBottom: 0}}
                    >
                      ₹{item.value}
                    </Title>
                  </div>
                ))}
              </div>

              {sharingPrices && Object.keys(sharingPrices).length > 0 && (
                <div style={{marginTop: "16px"}}>
                  <Text strong style={{display: "block", marginBottom: "8px"}}>
                    Sharing Options
                  </Text>
                  <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
                    {Object.entries(sharingPrices).map(([sharing, price]) => (
                      <Tag key={sharing} color="blue">
                        {sharing}: ₹{price}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Contact */}
            <Card
              title="Contact"
              className="shadow-sm border-0"
              style={{marginTop: 20}}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Primary",
                    value: contacts?.primary,
                    icon: <PhoneOutlined />,
                    color: "blue",
                  },
                  {
                    label: "Alternate",
                    value: contacts?.alternate,
                    icon: <PhoneOutlined />,
                    color: "blue",
                  },
                  {
                    label: "Email",
                    value: contacts?.email,
                    icon: <MailOutlined />,
                    color: "red",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 bg-${item.color}-50 rounded`}
                  >
                    <Avatar
                      icon={item.icon}
                      className={`bg-${item.color}-100 text-${item.color}-500`}
                    />
                    <div>
                      <Text type="secondary">{item.label}</Text>
                      <Text strong className="block">
                        {item.value || "Not available"}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPane>

        {/* Amenities Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <CheckCircleOutlined />
              Amenities
            </span>
          }
          key="2"
        >
          <Card className="shadow-sm border-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featureList.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg flex items-center gap-3"
                >
                  <div className="bg-white p-2 rounded-full">
                    {feature.icon}
                  </div>
                  <Text strong>{feature.text}</Text>
                </div>
              ))}
            </div>
          </Card>
        </TabPane>

        {/* Timeline Tab */}
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <CalendarOutlined />
              Timeline
            </span>
          }
          key="3"
        >
          <Card className="shadow-sm border-0">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarOutlined className="text-blue-600" />
                </div>
                <div>
                  <Text strong>Property Created</Text>
                  <Text type="secondary" className="block">
                    {new Date(createdAt).toLocaleString()}
                  </Text>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CalendarOutlined className="text-green-600" />
                </div>
                <div>
                  <Text strong>Last Updated</Text>
                  <Text type="secondary" className="block">
                    {new Date(updatedAt).toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PropertyDetails;
