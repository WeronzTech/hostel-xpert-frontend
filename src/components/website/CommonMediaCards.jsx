import {Card, Row, Col, Button, Empty, Spin, Image, Tag} from "antd";
import {
  EyeOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {getAllCommonMedia} from "../../hooks/property/useWebsite";
import CommonMediaEditForm from "./CommonMediaEditForm";

const CommonMediaCards = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    data: commonMediaData,
    isLoading: commonMediaLoading,
    error,
  } = useQuery({
    queryKey: ["common-media"],
    queryFn: () => getAllCommonMedia(),
  });

  const handleEditClick = (commonMedia) => {
    console.log(commonMedia);
    setSelectedCategoryId(commonMedia.id);
    setSelectedCategory(commonMedia.category);
    setShowEditForm(true);
  };

  const handleCloseModal = () => {
    setShowEditForm(false);
    setSelectedCategory(null);
    setSelectedCategoryId(null);
  };

  const handleSuccess = () => {
    setShowEditForm(false);
    setSelectedCategory(null);
    setSelectedCategoryId(null);
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      homePage: "Home Page",
      mobileApp: "Mobile App",
      gallery: "Gallery",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  // Helper function to get cover image based on API response
  const getCoverImage = (commonMedia) => {
    if (commonMedia.firstImage) {
      return {
        url: commonMedia.firstImage,
        type: "image",
      };
    }
    return null;
  };

  // Filter out categories with no media
  const hasMediaItems = (commonMedia) => {
    return (
      (commonMedia.totalImages || 0) > 0 || (commonMedia.totalVideos || 0) > 0
    );
  };

  const filteredMediaData = commonMediaData?.filter(hasMediaItems) || [];

  if (commonMediaLoading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4 text-gray-500">Loading common media...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Empty
          description={
            <div>
              <p>Failed to load common media</p>
              <p className="text-sm text-gray-500 mt-2">
                {error.message || "Please try again later"}
              </p>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Empty>
      </div>
    );
  }

  if (!commonMediaData || filteredMediaData.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          description="No common media added yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        ></Empty>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[20, 20]}>
        {filteredMediaData.map((commonMedia) => {
          const coverMedia = getCoverImage(commonMedia);
          const hasVideos = commonMedia.totalVideos > 0;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={commonMedia.category}>
              <Card
                className="common-media-card hover:shadow-lg transition-shadow duration-300"
                cover={
                  coverMedia ? (
                    <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50">
                      <Image
                        preview={false}
                        alt={getCategoryDisplayName(commonMedia.category)}
                        src={coverMedia.url}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                      />
                    </div>
                  ) : hasVideos ? (
                    <div className="h-48 bg-gray-800 flex flex-col items-center justify-center">
                      <VideoCameraOutlined className="text-4xl text-white mb-2" />
                      <span className="text-white text-sm">Video Content</span>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 flex flex-col items-center justify-center">
                      <PictureOutlined className="text-4xl text-gray-400 mb-2" />
                      <span className="text-gray-400 text-sm">No Media</span>
                    </div>
                  )
                }
              >
                <div className="space-y-3">
                  {/* Category Name */}
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                    {getCategoryDisplayName(commonMedia.category)}
                  </h3>

                  {/* Image & Video Count */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex gap-2 flex-wrap">
                      <Tag color="blue" className="m-0">
                        {commonMedia.totalImages || 0}{" "}
                        {commonMedia.totalImages === 1 ? "Image" : "Images"}
                      </Tag>
                      <Tag color="purple" className="m-0">
                        {commonMedia.totalVideos || 0}{" "}
                        {commonMedia.totalVideos === 1 ? "Video" : "Videos"}
                      </Tag>
                    </div>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      className="flex items-center"
                      onClick={() => handleEditClick(commonMedia)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {showEditForm && (
        <CommonMediaEditForm
          visible={showEditForm}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          categoryId={selectedCategoryId}
          category={selectedCategory}
        />
      )}
    </div>
  );
};

export default CommonMediaCards;
