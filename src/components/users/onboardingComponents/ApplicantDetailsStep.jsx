import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from "antd";
import {CloseOutlined} from "../../../icons";
import {redButton} from "../../../data/common/color";
import {useNavigate} from "react-router-dom";

export const ApplicantDetailsStep = ({
  formData,
  handleChange,
  handleReject,
  isRejoin,
}) => {
  const navigate = useNavigate();
  console.log("ApplicantDetailsStep props:", {
    formData,
    handleChange,
    handleReject,
  });

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
        <Typography.Title level={4} style={{margin: 0}}>
          Applicant Details
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
      </Row>

      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Full Name" style={{marginBottom: 16}}>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email" style={{marginBottom: 16}}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Contact Number" style={{marginBottom: 16}}>
              <Input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="User Type" style={{marginBottom: 16}}>
              <Select
                name="userType"
                value={formData.userType}
                onChange={(value) =>
                  handleChange({target: {name: "userType", value}})
                }
                style={{width: "100%"}}
              >
                <Select.Option value="student">Student</Select.Option>
                <Select.Option value="worker">Worker</Select.Option>
                <Select.Option value="dailyRent">Daily Rent</Select.Option>
                <Select.Option value="messOnly">Mess Only</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
