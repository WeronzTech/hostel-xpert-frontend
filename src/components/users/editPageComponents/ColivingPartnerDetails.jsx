import {Form, Input, Button, Upload, Row, Col, Image, message} from "antd";
import {UploadOutlined, CloseOutlined} from "@ant-design/icons";

// ✅ Use namespaced keys to avoid conflicts
const PARTNER_IMAGE_UPLOAD_CONFIG = [
  {key: "partnerProfileImg", label: "Partner Profile Photo"},
  {key: "partnerAadharFront", label: "Partner Aadhar Front"},
  {key: "partnerAadharBack", label: "Partner Aadhar Back"},
];

const ColivingPartnerDetails = ({
  resident,
  images,
  onImageUpload,
  onImageRemove,
}) => {
  const form = Form.useFormInstance();

  const handleImageChange = (info, field) => {
    const file = info.file;
    if (file.type.startsWith("image/") && file.size / 1024 / 1024 < 5) {
      onImageUpload(field, file);
    }
  };

  const handleRemove = (field) => {
    onImageRemove(field);
    // Map namespaced image key to actual form field
    const formFieldMap = {
      partnerProfileImg: "profileImg",
      partnerAadharFront: "aadharFront",
      partnerAadharBack: "aadharBack",
    };
    const formField = formFieldMap[field];

    form.setFieldsValue({
      colivingPartner: {
        ...form.getFieldValue("colivingPartner"),
        [formField]: "",
      },
    });
  };

  const getImageSource = (field) => {
    const imageData = images[field];

    // ✅ If image is marked for removal, don't show anything
    if (imageData?.remove) {
      return null;
    }

    // ✅ First check if we have a new uploaded image
    if (imageData?.preview) {
      return imageData.preview;
    }

    // ✅ Then check if we have existing image URL from resident data
    const apiFieldMap = {
      partnerProfileImg: "profileImg",
      partnerAadharFront: "aadharFront",
      partnerAadharBack: "aadharBack",
    };
    const apiField = apiFieldMap[field];

    if (resident?.colivingPartner?.[apiField]) {
      return resident.colivingPartner[apiField];
    }

    // ✅ Fallback to images.url (if any)
    return imageData?.url || null;
  };

  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3.5">
        Coliving Partner Details
      </h3>

      {/* ✅ Image Upload Section */}
      <Row gutter={[16, 16]} className="mb-4">
        {PARTNER_IMAGE_UPLOAD_CONFIG.map(({key, label}) => {
          const imageSrc = getImageSource(key);
          return (
            <Col key={key} xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="flex justify-center h-full px-2">
                <div className="border rounded-lg p-3 h-full flex flex-col w-full max-w-[220px] mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-medium text-gray-700 truncate">
                      {label}
                    </span>
                    {imageSrc && (
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleRemove(key)}
                      />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="flex items-center justify-center bg-gray-50 rounded-md overflow-hidden mb-3 w-full"
                      style={{minHeight: "120px", maxHeight: "120px"}}
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={label}
                          style={{
                            height: "100%",
                            width: "auto",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                          preview={false}
                          fallback="/image-placeholder.png"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm text-center p-2">
                          No image uploaded
                        </div>
                      )}
                    </div>

                    <div className="w-full flex justify-center">
                      <Upload
                        accept="image/*"
                        capture="environment"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/");
                          const isLt5M = file.size / 1024 / 1024 < 5;

                          if (!isImage) {
                            message.error("You can only upload image files!");
                            return false;
                          }
                          if (!isLt5M) {
                            message.error("Image must be smaller than 5MB!");
                            return false;
                          }

                          handleImageChange({file}, key);
                          return false;
                        }}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          size="small"
                          className="w-full"
                        >
                          {imageSrc ? "Change" : "Upload"}
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* ✅ 4-Column Row for Name, Email, Contact, Relation */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6} className="mt-2">
          <Form.Item
            label={<span className="text-base">Partner Name</span>}
            name={["colivingPartner", "name"]}
            initialValue={resident?.colivingPartner?.name}
          >
            <Input size="large" placeholder="Enter full name" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Email</span>}
            name={["colivingPartner", "email"]}
            initialValue={resident?.colivingPartner?.email}
            rules={[
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input size="large" placeholder="Enter email address" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Contact Number</span>}
            name={["colivingPartner", "contact"]}
            initialValue={resident?.colivingPartner?.contact}
            rules={[
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit contact number",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter contact number"
              allowClear
              maxLength={10}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Relation</span>}
            name={["colivingPartner", "relation"]}
            initialValue={resident?.colivingPartner?.relation}
          >
            <Input size="large" placeholder="Enter relation" allowClear />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ColivingPartnerDetails;
