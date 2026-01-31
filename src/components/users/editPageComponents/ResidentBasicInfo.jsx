import {Form, Input, Select, Row, Col} from "antd";

const USER_TYPES = [
  {value: "student", label: "Student"},
  {value: "worker", label: "Worker"},
  {value: "dailyRent", label: "Daily Rent"},
  {value: "messOnly", label: "Mess Only"},
];

const ResidentBasicInfo = ({resident}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
        Basic Information
      </h3>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Full Name</span>}
            name="name"
            style={{marginBottom: 12}}
            initialValue={resident?.name || ""}
          >
            <Input size="large" placeholder="Enter full name" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Email</span>}
            name="email"
            rules={[
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
            style={{marginBottom: 12}}
            initialValue={resident?.email || ""}
          >
            <Input size="large" placeholder="Enter email" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Phone Number</span>}
            name="contact"
            rules={[
              {
                pattern: /^[0-9]*$/,
                message: "Please enter numbers only",
              },
            ]}
            style={{marginBottom: 12}}
            initialValue={resident?.contact || ""}
          >
            <Input
              size="large"
              placeholder="Enter phone number"
              maxLength={15}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">User Type</span>}
            name="userType"
            style={{marginBottom: 12}}
            initialValue={resident?.userType}
          >
            <Select
              size="large"
              placeholder="Select user type"
              allowClear
              optionFilterProp="children"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={USER_TYPES}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ResidentBasicInfo;
