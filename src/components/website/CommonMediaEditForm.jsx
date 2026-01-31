import {useState} from "react";
import {
  Modal,
  Button,
  message,
  Row,
  Col,
  Card,
  Space,
  Typography,
  Image,
  Spin,
  Empty,
} from "antd";
import {DeleteOutlined, EyeOutlined} from "@ant-design/icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  deleteCommonMediaItems,
  getCommonMediaById,
} from "../../hooks/property/useWebsite";

const {Text} = Typography;

const CommonMediaEditForm = ({
  visible,
  onClose,
  onSuccess,
  categoryId = null,
  category = null,
}) => {
  const queryClient = useQueryClient();
  const [deletingIds, setDeletingIds] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  // Fetch existing common media data
  const {
    data: commonMediaData,
    isLoading: isDataLoading,
    refetch,
  } = useQuery({
    queryKey: ["common-media", categoryId],
    queryFn: () => getCommonMediaById(categoryId),
    enabled: visible && !!categoryId,
  });

  // Mutation for deleting media
  const mutation = useMutation({
    mutationFn: ({id, payload}) => deleteCommonMediaItems(id, payload),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries(["common-media"]);
      setDeletingIds([]);
      refetch(); // Refetch to get updated data
      onSuccess?.(); // Call success callback if provided
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
      setDeletingIds([]);
    },
  });

  const handleDeleteMedia = async (mediaItem) => {
    console.log(mediaItem);
    if (!mediaItem._id || !mediaItem.key) {
      message.error("Invalid media item - missing ID or key");
      return;
    }

    setDeletingIds((prev) => [...prev, mediaItem._id]);

    try {
      const payload = {
        category: commonMediaData?._id,
        mediaIds: [mediaItem._id], // Send array of media keys to delete
      };

      console.log("Deleting media:", {
        id: categoryId,
        mediaId: mediaItem.id,
        payload,
      });

      await mutation.mutateAsync({
        id: categoryId,
        payload,
      });
    } catch (error) {
      console.error("Delete error:", error);
      setDeletingIds((prev) => prev.filter((id) => id !== mediaItem._id));
    }
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      homePage: "Home Page",
      mobileApp: "Mobile App",
      gallery: "Gallery",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  if (isDataLoading) {
    return (
      <Modal
        title={`Manage ${getCategoryDisplayName(category)} Media`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Loading media...</div>
        </div>
      </Modal>
    );
  }

  const mediaItems = commonMediaData?.mediaItems || [];

  return (
    <>
      {contextHolder}
      <Modal
        title={`Manage ${getCategoryDisplayName(category)} Media`}
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        width={700}
        style={{top: 20}}
        destroyOnClose
        centered
      >
        <div className="space-y-4">
          {/* Summary */}
          <Card size="small" className="bg-blue-50">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Total Media: </Text>
                <Text>{mediaItems.length}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Category: </Text>
                <Text>{getCategoryDisplayName(category)}</Text>
              </Col>
            </Row>
          </Card>

          {/* Media Items */}
          {mediaItems.length === 0 ? (
            <Empty
              description="No media found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-8"
            />
          ) : (
            <Space direction="vertical" size="middle" style={{width: "100%"}}>
              {mediaItems.map((media, index) => (
                <Card
                  key={media._id || index}
                  size="small"
                  className="border-l-4 border-l-blue-200"
                >
                  <Row gutter={[16, 8]} align="middle">
                    {/* Media Preview */}
                    <Col span={4}>
                      <div className="flex items-center justify-center h-16 bg-gray-50 rounded border overflow-hidden">
                        {media.type === "image" ? (
                          <Image
                            src={media.url}
                            alt={media.title}
                            preview={{
                              mask: <EyeOutlined className="text-white" />,
                            }}
                            width={50}
                            height={40}
                            style={{objectFit: "cover"}}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                          />
                        ) : (
                          <video
                            src={media.url}
                            controls
                            width="100%"
                            height="100%"
                            style={{borderRadius: "4px"}}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    </Col>

                    {/* Media Info */}
                    <Col span={16}>
                      <Space
                        direction="vertical"
                        size={0}
                        style={{width: "100%"}}
                      >
                        <Text strong className="block">
                          {media.title || "Untitled"}
                        </Text>
                        <Text type="secondary" className="text-xs block">
                          Type: {media.type || "Unknown"}
                        </Text>
                        {media.key && (
                          <Text type="secondary" className="text-xs block">
                            Key: {media.key}
                          </Text>
                        )}
                      </Space>
                    </Col>

                    {/* Delete Button */}
                    <Col span={4} className="text-right">
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteMedia(media)}
                        loading={deletingIds.includes(media._id)}
                        size="small"
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CommonMediaEditForm;
