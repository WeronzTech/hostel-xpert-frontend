import {useParams, useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  Card,
  Typography,
  Spin,
  Tag,
  message,
  Descriptions,
  Row,
  Col,
  Divider,
  Button,
  Space,
} from "antd";
import {
  EnvironmentOutlined,
  EditOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {PageHeader} from "../../components";
import {getPropertyDetails} from "../../hooks/property/useProperty";

const {Title, Text} = Typography;

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
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (isError) {
    message.error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to load property details",
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
    propertyName,
    location,
    address,
    totalBeds,
    occupiedBeds,
    totalFloors,
    deposit,
    sharingPrices,
    propertyType,
    contacts,
    preferredBy,
    phase,
    branch,
  } = property;

  const occupancyRate =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Header */}
      <PageHeader title={propertyName} subtitle="Property Details" />

      {/* Main Content with proper spacing */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Main Details */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="middle" style={{width: "100%"}}>
            {/* Property Information Card */}
            <Card className="shadow-sm">
              <Title level={4} className="mb-4">
                Property Information
              </Title>

              {/* Location & Type */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <EnvironmentOutlined />
                  <Text>{location}</Text>
                </div>
                {address && address !== location && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm ml-6">
                    <Text type="secondary">{address}</Text>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Tag color="blue" icon={<HomeOutlined />}>
                    {propertyType}
                  </Tag>
                  {preferredBy && (
                    <Tag color="purple" icon={<UserOutlined />}>
                      {preferredBy}
                    </Tag>
                  )}
                </div>
              </div>

              <Divider />

              {/* Key Stats in Grid */}
              <Row gutter={[16, 16]} className="mb-4">
                <Col span={12} md={6}>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Text type="secondary" className="text-xs">
                      Total Beds
                    </Text>
                    <Title level={3} className="mt-1 mb-0 text-blue-600">
                      {totalBeds}
                    </Title>
                  </div>
                </Col>
                <Col span={12} md={6}>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Text type="secondary" className="text-xs">
                      Occupied
                    </Text>
                    <Title level={3} className="mt-1 mb-0 text-green-600">
                      {occupiedBeds}
                    </Title>
                  </div>
                </Col>
                <Col span={12} md={6}>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Text type="secondary" className="text-xs">
                      Occupancy
                    </Text>
                    <Title level={3} className="mt-1 mb-0 text-orange-600">
                      {occupancyRate}%
                    </Title>
                  </div>
                </Col>
                <Col span={12} md={6}>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Text type="secondary" className="text-xs">
                      Floors
                    </Text>
                    <Title level={3} className="mt-1 mb-0 text-purple-600">
                      {totalFloors}
                    </Title>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Deposit Information */}
              <div>
                <Title level={5} className="mb-3">
                  Deposit Details
                </Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Text type="secondary" className="text-xs">
                        Refundable
                      </Text>
                      <Title level={4} className="mt-1 mb-0 text-blue-700">
                        ₹{deposit?.refundable || 0}
                      </Title>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Text type="secondary" className="text-xs">
                        Non-Refundable
                      </Text>
                      <Title level={4} className="mt-1 mb-0 text-orange-700">
                        ₹{deposit?.nonRefundable || 0}
                      </Title>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* Sharing Prices Card */}
            {sharingPrices && Object.keys(sharingPrices).length > 0 && (
              <Card className="shadow-sm">
                <Title level={4} className="mb-4">
                  Sharing Options & Prices
                </Title>
                <Row gutter={[16, 16]}>
                  {Object.entries(sharingPrices).map(([sharing, price]) => (
                    <Col xs={24} sm={12} md={8} key={sharing}>
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <Text strong className="text-lg block mb-2">
                          {sharing}
                        </Text>
                        <Text className="text-2xl font-bold text-green-600">
                          ₹{price}
                        </Text>
                        <Text type="secondary" className="block text-sm">
                          per month
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </Space>
        </Col>

        {/* Right Column - Contact & Edit */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{width: "100%"}}>
            {/* Contact Card */}
            <Card className="shadow-sm">
              <Title level={4} className="mb-4">
                Contact Information
              </Title>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <PhoneOutlined className="text-blue-600 text-xl" />
                  <div>
                    <Text type="secondary" className="text-xs">
                      Primary Contact
                    </Text>
                    <Text strong className="block">
                      {contacts?.primary || "Not available"}
                    </Text>
                  </div>
                </div>

                {contacts?.alternate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <PhoneOutlined className="text-gray-600 text-xl" />
                    <div>
                      <Text type="secondary" className="text-xs">
                        Alternate Contact
                      </Text>
                      <Text strong className="block">
                        {contacts.alternate}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Additional Information Card */}
            {(phase || branch) && (
              <Card className="shadow-sm">
                <Title level={4} className="mb-4">
                  Additional Information
                </Title>
                <Descriptions column={1} bordered size="small">
                  {phase && (
                    <Descriptions.Item label="Phase">{phase}</Descriptions.Item>
                  )}
                  {branch && (
                    <Descriptions.Item label="Branch">
                      {branch}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Edit Button Card */}
            <Card className="shadow-sm">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/property/edit/${id}`)}
                block
                size="large"
                style={{backgroundColor: "#059669", borderColor: "#059669"}}
              >
                Edit Property
              </Button>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PropertyDetails;
