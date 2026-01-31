import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  DatePicker,
  Row,
  Col,
  Image,
  message,
} from "antd";
import {UploadOutlined, CloseOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const IMAGE_UPLOAD_CONFIG = [
  {key: "profileImg", label: "Profile Photo"},
  {key: "aadharFront", label: "Aadhar Front"},
  {key: "aadharBack", label: "Aadhar Back"},
];

const GENDER_OPTIONS = [
  {value: "male", label: "Male"},
  {value: "female", label: "Female"},
  {value: "other", label: "Other"},
];

const ResidentPersonalDetails = ({
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
    form.setFieldsValue({
      personalDetails: {
        ...form.getFieldValue("personalDetails"),
        [field]: "",
      },
    });
  };

  const getImageSource = (field) => {
    const imageData = images[field];
    return imageData?.preview || imageData?.url || null;
  };

  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3.5">
        Personal Details
      </h3>

      {/* ✅ Image Upload Section */}
      <Row gutter={[16, 16]} className="mb-4">
        {IMAGE_UPLOAD_CONFIG.map(({key, label}) => {
          const imageSrc = getImageSource(key);
          return (
            <Col key={key} xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="flex justify-center h-full px-2">
                {" "}
                {/* Added px-2 for horizontal padding */}
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

      {/* ✅ 3-Column Row for DOB, Gender, Address */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} className="mt-2">
          <Form.Item
            label={<span className="text-base">Date of Birth</span>}
            name={["personalDetails", "dob"]}
            initialValue={
              resident?.personalDetails?.dob
                ? dayjs(resident.personalDetails.dob)
                : null
            }
          >
            <DatePicker
              size="large"
              className="w-full"
              format="DD-MM-YYYY"
              placeholder="Select date"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Gender</span>}
            name={["personalDetails", "gender"]}
            initialValue={resident?.personalDetails?.gender}
          >
            <Select
              size="large"
              placeholder="Select gender"
              allowClear
              options={GENDER_OPTIONS}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8} className="sm:mt-0 md:mt-2">
          <Form.Item
            label={<span className="text-base">Address</span>}
            name={["personalDetails", "address"]}
            initialValue={resident?.personalDetails?.address}
          >
            <Input size="large" placeholder="Enter full address" allowClear />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ResidentPersonalDetails;
