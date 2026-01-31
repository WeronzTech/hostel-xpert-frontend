import {useState, useEffect} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Row,
  Col,
  message,
  Divider,
  Card,
  List,
  Typography,
  Spin,
  Image,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {useSelector} from "react-redux";
import {
  updateWebsitePropertyContent,
  getWebsitePropertyContentById,
} from "../../hooks/property/useWebsite";

const {TextArea} = Input;
const {Option} = Select;
const {Text} = Typography;

const PropertyEditForm = ({visible, onClose, onSuccess, contentId}) => {
  const {properties} = useSelector((state) => state.properties);
  const [form] = Form.useForm();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [newFilesMetadata, setNewFilesMetadata] = useState({
    images: {}, // { [fileUid]: { description: '', key: '' } }
    videos: {}, // { [fileUid]: { description: '', key: '' } }
  });
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [videosToDelete, setVideosToDelete] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Icon library options
  const iconLibraries = [
    {value: "fa", label: "Font Awesome"},
    {value: "ant", label: "Ant Design"},
    {value: "material", label: "Material Icons"},
  ];

  // Query to fetch property content by ID for edit mode
  const {data: editData, isLoading: editDataLoading} = useQuery({
    queryKey: ["property-content", contentId],
    queryFn: () => getWebsitePropertyContentById(contentId),
    enabled: !!contentId,
  });

  // TanStack Query mutation for updating website content
  const updateWebsiteContentMutation = useMutation({
    mutationFn: ({contentId, formData}) =>
      updateWebsitePropertyContent(contentId, formData),
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries(["property-contents"]);
      queryClient.invalidateQueries(["property-content", contentId]);
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error(error);
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Initialize form with edit data
  useEffect(() => {
    if (editData) {
      console.log("Edit Data received:", editData);
      const property = properties.find((p) => p._id === editData.propertyId);
      setSelectedProperty(property);

      // Set form values
      form.setFieldsValue({
        propertyId: editData.propertyId,
        propertyName: editData.propertyName,
        description: editData.description,
        subDescription: editData.subDescription,
        fullAddress: editData.location?.fullAddress,
        mainArea: editData.location?.mainArea,
        mapLink: editData.mapLink,
        amenities: editData.amenities || [],
      });
    }
  }, [editData, form, properties]);

  // Metadata handlers for new files
  const handleNewImageMetadataChange = (fileUid, field, value) => {
    setNewFilesMetadata((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [fileUid]: {
          ...prev.images[fileUid],
          [field]: value,
        },
      },
    }));
  };

  const handleNewVideoMetadataChange = (fileUid, field, value) => {
    setNewFilesMetadata((prev) => ({
      ...prev,
      videos: {
        ...prev.videos,
        [fileUid]: {
          ...prev.videos[fileUid],
          [field]: value,
        },
      },
    }));
  };

  // Handle delete existing image
  const handleDeleteExistingImage = (url) => {
    console.log("Deleting image:", url);
    setImagesToDelete((prev) => {
      const newList = [...prev, url];
      console.log("Images to delete:", newList);
      return newList;
    });
  };

  // Handle delete existing video
  const handleDeleteExistingVideo = (url) => {
    setVideosToDelete((prev) => [...prev, url]);
  };

  const handleSubmit = async (values) => {
    if (!contentId) {
      message.error("Content ID is required for editing");
      return;
    }

    const formData = new FormData();

    // For edit mode, use the existing propertyId
    formData.append("propertyId", editData.propertyId);
    formData.append("propertyName", editData.propertyName);

    // Append images and videos to delete
    if (imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }
    if (videosToDelete.length > 0) {
      formData.append("videosToDelete", JSON.stringify(videosToDelete));
    }

    // Process amenities to include both name and icon
    const amenitiesWithIcons =
      values.amenities?.map((amenity) => ({
        name: amenity.name,
        iconName: amenity.iconName,
        iconLibrary: amenity.iconLibrary || "fa",
      })) || [];

    // Append form data
    Object.entries(values).forEach(([key, value]) => {
      if (["propertyId", "propertyName", "images", "videos"].includes(key))
        return;

      if (key === "amenities") {
        formData.append("amenities", JSON.stringify(amenitiesWithIcons));
      } else if (value) {
        formData.append(key, value);
      }
    });

    // Process new images with metadata
    imageFiles.forEach((file, index) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);

        const meta = newFilesMetadata.images[file.uid] || {};

        // Append metadata as separate text fields
        formData.append(
          `imageTitles[${index}]`,
          meta.description || file.name || `Image ${index + 1}`
        );
        formData.append(
          `imageKeys[${index}]`,
          meta.key || `image_${index + 1}`
        );
      }
    });

    // Process new videos with metadata
    videoFiles.forEach((file, index) => {
      if (file.originFileObj) {
        formData.append("videos", file.originFileObj);

        const meta = newFilesMetadata.videos[file.uid] || {};

        // Append metadata as separate text fields
        formData.append(
          `videoTitles[${index}]`,
          meta.description || file.name || `Video ${index + 1}`
        );
        formData.append(
          `videoKeys[${index}]`,
          meta.key || `video_${index + 1}`
        );
      }
    });

    // Log FormData for debugging
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    updateWebsiteContentMutation.mutate({
      contentId: contentId,
      formData,
    });
  };

  const handleClose = () => {
    form.resetFields();
    setImageFiles([]);
    setVideoFiles([]);
    setNewFilesMetadata({images: {}, videos: {}});
    setImagesToDelete([]);
    setVideosToDelete([]);
    setSelectedProperty(null);
    onClose();
  };

  const uploadProps = {
    beforeUpload: () => false,
    listType: "picture",
    multiple: true,
    maxCount: 10,
    fileList: imageFiles,
    onChange: ({fileList}) => setImageFiles(fileList),
  };

  const videoUploadProps = {
    beforeUpload: () => false,
    multiple: true,
    accept: "video/*",
    maxCount: 5,
    fileList: videoFiles,
    onChange: ({fileList}) => setVideoFiles(fileList),
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      handleClose();
    }
  }, [visible]);

  const loading = updateWebsiteContentMutation.isPending;

  // Show loading spinner while fetching edit data
  if (editDataLoading) {
    return (
      <Modal
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={1000}
        centered
      >
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Loading property data...</div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2 text-blue-600" />
            <span>Edit Property Content</span>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={1000}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          className="mt-4"
        >
          <Row gutter={[16, 16]}>
            {/* Show selected property info */}
            <Col span={24}>
              <Card size="small" className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>Editing Content for: </Text>
                    <Text className="text-blue-600 font-medium">
                      {editData?.propertyName}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Description Fields */}
            <Col span={24}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="description" label="Description">
                    <Input.TextArea
                      rows={2}
                      placeholder="Enter main property description"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="subDescription" label="Sub Description">
                    <Input.TextArea
                      rows={2}
                      placeholder="Enter additional description or highlights"
                      showCount
                      maxLength={300}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Location Fields */}
            <Col span={24}>
              <Divider orientation="left">Location Details</Divider>
            </Col>

            {/* Address Fields */}
            <Col span={24}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullAddress"
                    label="Full Address"
                    rules={[
                      {required: true, message: "Please enter full address"},
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Enter complete property address"
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="mainArea"
                    label="Main Area"
                    rules={[
                      {required: true, message: "Please enter main area"},
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Enter main area/locality"
                      showCount
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Form.Item name="mapLink" label="Google Map Link">
                <Input
                  placeholder="Paste Google Maps link"
                  prefix={<LinkOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            {/* Amenities Section */}
            <Col span={24}>
              <Divider orientation="left">Amenities</Divider>
              <Form.List name="amenities">
                {(fields, {add, remove}) => (
                  <div className="space-y-4">
                    {fields.map(({key, name, ...restField}) => (
                      <Card
                        key={key}
                        size="small"
                        title={`Amenity ${name + 1}`}
                        extra={
                          <DeleteOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          />
                        }
                      >
                        <Row gutter={[12, 12]}>
                          <Col xs={24} md={10}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              rules={[
                                {required: true, message: "Enter amenity name"},
                              ]}
                            >
                              <Input placeholder="Amenity name (e.g., Swimming Pool)" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={7}>
                            <Form.Item
                              {...restField}
                              name={[name, "iconLibrary"]}
                              initialValue="fa"
                            >
                              <Select placeholder="Icon Library">
                                {iconLibraries.map((lib) => (
                                  <Option key={lib.value} value={lib.value}>
                                    {lib.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={7}>
                            <Form.Item
                              {...restField}
                              name={[name, "iconName"]}
                              rules={[
                                {required: true, message: "Enter icon name"},
                              ]}
                            >
                              <Input placeholder="Icon name (e.g., swimming-pool)" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Amenity
                    </Button>
                  </div>
                )}
              </Form.List>
            </Col>

            {/* Media Uploads with Descriptions */}
            <Col span={24}>
              <Divider orientation="left">Media Files</Divider>
            </Col>

            {/* Images Section */}
            <Col span={24}>
              <Card size="small" title="Property Images" className="mb-4">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Upload New Images (Max: 10)
                  </Button>
                </Upload>

                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">New Image Details:</div>
                    <List
                      size="small"
                      dataSource={imageFiles}
                      renderItem={(file) => (
                        <List.Item key={file.uid}>
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate flex-1 mr-2">
                                {file.name}
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  setImageFiles((prev) =>
                                    prev.filter((f) => f.uid !== file.uid)
                                  );
                                  setNewFilesMetadata((prev) => {
                                    const newImages = {...prev.images};
                                    delete newImages[file.uid];
                                    return {...prev, images: newImages};
                                  });
                                }}
                              />
                            </div>

                            {/* Two inputs side by side - Editable for new files */}
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter key for this image"
                                  value={
                                    newFilesMetadata.images[file.uid]?.key || ""
                                  }
                                  onChange={(e) =>
                                    handleNewImageMetadataChange(
                                      file.uid,
                                      "key",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                />
                              </Col>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter description for this image"
                                  value={
                                    newFilesMetadata.images[file.uid]
                                      ?.description || ""
                                  }
                                  onChange={(e) =>
                                    handleNewImageMetadataChange(
                                      file.uid,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                />
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Show existing images */}
                {editData?.images && editData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Existing Images:</div>
                    <List
                      size="small"
                      dataSource={editData.images.filter(
                        (image) => !imagesToDelete.includes(image.url)
                      )}
                      renderItem={(image, index) => (
                        <List.Item key={image.url}>
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Image
                                  width={60}
                                  height={60}
                                  src={image.url}
                                  alt={image.title || "Property Image"}
                                  placeholder={
                                    <div className="w-15 h-15 bg-gray-200 flex items-center justify-center">
                                      <EyeOutlined />
                                    </div>
                                  }
                                  className="rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <Text className="text-sm font-medium block truncate">
                                    {image.title || image.key || "Image"}
                                  </Text>
                                  <Text type="secondary" className="text-xs">
                                    {image.url ? "Uploaded" : "Processing"}
                                  </Text>
                                </div>
                              </div>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteExistingImage(image.url)
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            </div>
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Key"
                                  value={image.key || `image_${index + 1}`}
                                  readOnly
                                  size="small"
                                />
                              </Col>
                              <Col span={12}>
                                <Input
                                  placeholder="Description"
                                  value={image.title || ""}
                                  readOnly
                                  size="small"
                                />
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Card>
            </Col>

            {/* Videos Section */}
            <Col span={24}>
              <Card size="small" title="Property Videos">
                <Upload {...videoUploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Upload New Videos (Max: 5)
                  </Button>
                </Upload>

                {videoFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">New Video Details:</div>
                    <List
                      size="small"
                      dataSource={videoFiles}
                      renderItem={(file) => (
                        <List.Item key={file.uid}>
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate flex-1 mr-2">
                                {file.name}
                              </span>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  setVideoFiles((prev) =>
                                    prev.filter((f) => f.uid !== file.uid)
                                  );
                                  setNewFilesMetadata((prev) => {
                                    const newVideos = {...prev.videos};
                                    delete newVideos[file.uid];
                                    return {...prev, videos: newVideos};
                                  });
                                }}
                              />
                            </div>

                            {/* Two inputs side by side - Editable for new files */}
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter key for this video"
                                  value={
                                    newFilesMetadata.videos[file.uid]?.key || ""
                                  }
                                  onChange={(e) =>
                                    handleNewVideoMetadataChange(
                                      file.uid,
                                      "key",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                />
                              </Col>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter description for this video"
                                  value={
                                    newFilesMetadata.videos[file.uid]
                                      ?.description || ""
                                  }
                                  onChange={(e) =>
                                    handleNewVideoMetadataChange(
                                      file.uid,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                />
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Show existing videos */}
                {editData?.videos && editData.videos.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Existing Videos:</div>
                    <List
                      size="small"
                      dataSource={editData.videos.filter(
                        (video) => !videosToDelete.includes(video.url)
                      )}
                      renderItem={(video, index) => (
                        <List.Item key={video.url}>
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-24 h-16 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                                  {video.url ? (
                                    <video
                                      src={video.url}
                                      controls
                                      width="100%"
                                      height="100%"
                                      style={{borderRadius: "4px"}}
                                    />
                                  ) : (
                                    <EyeOutlined className="text-gray-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Text className="text-sm font-medium block truncate">
                                    {video.title || video.key || "Video"}
                                  </Text>
                                  <Text type="secondary" className="text-xs">
                                    {video.url ? "Uploaded" : "Processing"}
                                  </Text>
                                </div>
                              </div>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteExistingVideo(video.url)
                                }
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            </div>
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Key"
                                  value={video.key || `video_${index + 1}`}
                                  readOnly
                                  size="small"
                                />
                              </Col>
                              <Col span={12}>
                                <Input
                                  placeholder="Description"
                                  value={video.title || ""}
                                  readOnly
                                  size="small"
                                />
                              </Col>
                            </Row>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Card>
            </Col>

            {/* Submit Button */}
            <Col span={24}>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<EditOutlined />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Update Property Content
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default PropertyEditForm;
