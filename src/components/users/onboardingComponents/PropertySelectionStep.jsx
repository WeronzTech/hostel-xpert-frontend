import {Button, Card, ConfigProvider, Form, Select, Typography} from "antd";
import {CloseOutlined} from "../../../icons";
import {redButton} from "../../../data/common/color";
import {useNavigate} from "react-router-dom";

export const PropertySelectionStep = ({
  formData,
  properties,
  handlePropertyChange,
  handleReject,
  isRejoin,
}) => {
  const navigate = useNavigate();
  console.log(formData);

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={4} style={{margin: 0}}>
          Property Selection
        </Typography.Title>
        {isRejoin ? (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate(-1)}
          />
        ) : (
          <ConfigProvider theme={redButton}>
            <Button
              onClick={handleReject}
              type="primary"
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
          </ConfigProvider>
        )}
      </div>

      <Form layout="vertical">
        <Form.Item label="Property">
          <Select
            name="property"
            value={formData.property}
            onChange={(value) =>
              handlePropertyChange({target: {name: "property", value}})
            }
            style={{width: "100%"}}
          >
            {properties
              .filter((p) => p._id !== null)
              .map((property) => (
                <Select.Option key={property._id} value={property.name}>
                  {property.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};
