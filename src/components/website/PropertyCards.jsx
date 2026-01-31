import {Card, Row, Col, Button, Empty, Spin, Image, Tag} from "antd";
import {EditOutlined, PictureOutlined} from "@ant-design/icons";
import {getAllWebsitePropertyContents} from "../../hooks/property/useWebsite";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import PropertyEditForm from "./PropertyEditForm";

const PropertyCards = () => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const {data: propertyData, isLoading: propertyDataLoading} = useQuery({
    queryKey: ["property-contents"],
    queryFn: () => getAllWebsitePropertyContents(),
  });

  const handleEditClick = (property) => {
    setSelectedProperty(property._id);
    setShowPropertyForm(true);
  };

  const handleCloseModal = () => {
    setShowPropertyForm(false);
    setSelectedProperty(null);
  };

  const handleSuccess = () => {
    // You can add any success handling here, like refetching data
    setShowPropertyForm(false);
    setSelectedProperty(null);
  };

  if (propertyDataLoading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4 text-gray-500">Loading properties...</div>
      </div>
    );
  }

  if (!propertyData || propertyData.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          description="No properties added yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        ></Empty>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[20, 20]}>
        {propertyData.map((property) => (
          <Col xs={24} sm={12} md={8} lg={6} key={property._id}>
            <Card
              className="property-card"
              cover={
                property.images && property.images.length > 0 ? (
                  <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                    <Image
                      alt={property.propertyName}
                      src={property.images[0].url}
                      style={{
                        objectFit: "contain",
                        maxHeight: "100%",
                        maxWidth: "100%",
                      }}
                      preview={false}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex flex-col items-center justify-center">
                    <PictureOutlined className="text-4xl text-gray-400 mb-2" />
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )
              }
            >
              <div className="space-y-3">
                {/* Property Name */}
                <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                  {property.propertyName}
                </h3>

                {/* Image & Video Count */}
                {(property.totalImages !== undefined ||
                  property.totalVideos !== undefined) && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Tag color="blue" className="m-0">
                        {property.totalImages}{" "}
                        {property.totalImages === 1 ? "Image" : "Images"}
                      </Tag>
                      <Tag color="purple" className="m-0">
                        {property.totalVideos}{" "}
                        {property.totalVideos === 1 ? "Video" : "Videos"}
                      </Tag>
                    </div>

                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="small"
                      className="flex items-center cursor-pointer"
                      onClick={() => handleEditClick(property)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Property Form Modal */}
      <PropertyEditForm
        visible={showPropertyForm}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        contentId={selectedProperty}
      />
    </div>
  );
};

export default PropertyCards;
