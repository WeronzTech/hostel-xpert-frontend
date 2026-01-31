import {Form, Input, Row, Col} from "antd";

const ResidentGuardianDetails = () => {
  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3.5">
        Guardian Details
      </h3>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Name</span>}
            name={["parentsDetails", "name"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter guardian name (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Email</span>}
            name={["parentsDetails", "email"]}
            style={{marginBottom: 12}}
            rules={[
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter guardian email (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Contact Number</span>}
            name={["parentsDetails", "contact"]}
            style={{marginBottom: 12}}
            rules={[
              {
                pattern: /^[0-9]{0,10}$/,
                message: "Please enter up to 10 digits",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter contact number (optional)"
              maxLength={10}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Occupation</span>}
            name={["parentsDetails", "occupation"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter guardian occupation (optional)"
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ResidentGuardianDetails;
