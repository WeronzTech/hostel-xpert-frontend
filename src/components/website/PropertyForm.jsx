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
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {useSelector} from "react-redux";
import {
  createWebsitePropertyContent,
  getAllWebsitePropertyContents,
} from "../../hooks/property/useWebsite";

const {TextArea} = Input;
const {Option} = Select;

const PropertyForm = ({visible, onClose, onSuccess}) => {
  const {properties} = useSelector((state) => state.properties);
  const [form] = Form.useForm();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [fileMetadata, setFileMetadata] = useState({
    images: {}, // { [fileUid]: { description: '', key: '' } }
    videos: {}, // { [fileUid]: { description: '', key: '' } }
  });

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Icon library options
  const iconLibraries = [
    {value: "fa", label: "Font Awesome"},
    {value: "ant", label: "Ant Design"},
    {value: "material", label: "Material Icons"},
  ];

  // TanStack Query mutation for creating website content
  const createWebsiteContentMutation = useMutation({
    mutationFn: createWebsitePropertyContent,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries(["property-contents"]);
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

  const {data: propertyData, isLoading: propertyDataLoading} = useQuery({
    queryKey: ["property-contents"],
    queryFn: () => getAllWebsitePropertyContents(),
  });

  const handlePropertySelect = (propertyId) => {
    const property = properties.find((p) => p._id === propertyId);
    setSelectedProperty(property);
    if (property) {
      form.setFieldsValue({
        propertyName: property.name,
      });
    }
  };

  // Metadata handlers
  const handleImageMetadataChange = (fileUid, field, value) => {
    setFileMetadata((prev) => ({
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

  const handleVideoMetadataChange = (fileUid, field, value) => {
    setFileMetadata((prev) => ({
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

  const handleSubmit = async (values) => {
    if (!selectedProperty) {
      message.error("Please select a property");
      return;
    }

    const formData = new FormData();

    // For create mode, use selected property
    formData.append("propertyId", selectedProperty._id);
    formData.append("propertyName", selectedProperty.name);

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

        const meta = fileMetadata.images[file.uid] || {};

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

    // Process videos with metadata
    videoFiles.forEach((file, index) => {
      if (file.originFileObj) {
        formData.append("videos", file.originFileObj);

        const meta = fileMetadata.videos[file.uid] || {};

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

    createWebsiteContentMutation.mutate(formData);
  };

  const handleClose = () => {
    form.resetFields();
    setImageFiles([]);
    setVideoFiles([]);
    setFileMetadata({images: {}, videos: {}});
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

  const loading = createWebsiteContentMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div className="flex items-center">
            <PlusOutlined className="mr-2 text-blue-600" />
            <span>Add Property Content</span>
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
            {/* Property Selection */}
            <Col span={24}>
              <Form.Item
                name="propertyId"
                label="Select Property"
                rules={[{required: true, message: "Please select a property"}]}
              >
                <Select
                  placeholder="Select a property"
                  onChange={handlePropertySelect}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {properties
                    .filter((property) => {
                      // Filter out properties with null/undefined IDs
                      if (!property._id) return false;

                      // Filter out properties that already exist in propertyData
                      const existingPropertyIds =
                        propertyData?.map((item) => item.propertyId) || [];
                      return !existingPropertyIds.includes(property._id);
                    })
                    .map((property) => (
                      <Option key={property._id} value={property._id}>
                        {property.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
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
                    Upload Images (Max: 10)
                  </Button>
                </Upload>

                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Image Details:</div>
                    <List
                      size="small"
                      dataSource={imageFiles}
                      renderItem={(file) => (
                        <List.Item>
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
                                  setFileMetadata((prev) => {
                                    const newImages = {...prev.images};
                                    delete newImages[file.uid];
                                    return {...prev, images: newImages};
                                  });
                                }}
                              />
                            </div>

                            {/* Two inputs side by side */}
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter key for this image"
                                  value={
                                    fileMetadata.images[file.uid]?.key || ""
                                  }
                                  onChange={(e) =>
                                    handleImageMetadataChange(
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
                                    fileMetadata.images[file.uid]
                                      ?.description || ""
                                  }
                                  onChange={(e) =>
                                    handleImageMetadataChange(
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
              </Card>
            </Col>

            {/* Videos Section */}
            <Col span={24}>
              <Card size="small" title="Property Videos">
                <Upload {...videoUploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Upload Videos (Max: 5)
                  </Button>
                </Upload>

                {videoFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Video Details:</div>
                    <List
                      size="small"
                      dataSource={videoFiles}
                      renderItem={(file) => (
                        <List.Item>
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
                                  setFileMetadata((prev) => {
                                    const newVideos = {...prev.videos};
                                    delete newVideos[file.uid];
                                    return {...prev, videos: newVideos};
                                  });
                                }}
                              />
                            </div>

                            {/* Two inputs side by side */}
                            <Row gutter={8}>
                              <Col span={12}>
                                <Input
                                  placeholder="Enter key for this video"
                                  value={
                                    fileMetadata.videos[file.uid]?.key || ""
                                  }
                                  onChange={(e) =>
                                    handleVideoMetadataChange(
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
                                    fileMetadata.videos[file.uid]
                                      ?.description || ""
                                  }
                                  onChange={(e) =>
                                    handleVideoMetadataChange(
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
                  icon={<PlusOutlined />}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedProperty}
                >
                  Add Property Content
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default PropertyForm;
