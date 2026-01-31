import {Form, Input, Row, Col} from "antd";

const ResidentWorkingDetails = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3.5">
        Employment Details
      </h3>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Job Title</span>}
            name={["workingDetails", "jobTitle"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter job title (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Company Name</span>}
            name={["workingDetails", "companyName"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter company name (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Location</span>}
            name={["workingDetails", "location"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter location (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Emergency Contact</span>}
            name={["workingDetails", "emergencyContact"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter emergency contact (optional)"
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ResidentWorkingDetails;
