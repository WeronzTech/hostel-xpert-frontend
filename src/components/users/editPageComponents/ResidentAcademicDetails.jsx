import {Form, Input, Row, Col, Select} from "antd";

const YEAR_OF_STUDY_OPTIONS = [
  {value: "1", label: "First Year"},
  {value: "2", label: "Second Year"},
  {value: "3", label: "Third Year"},
  {value: "4", label: "Fourth Year"},
  {value: "5", label: "Fifth Year"},
];

const ResidentAcademicDetails = ({resident}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3.5">
        Academic Details
      </h3>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Course</span>}
            name={["studyDetails", "course"]}
            style={{marginBottom: 12}}
            initialValue={resident?.studyDetails?.course || ""}
          >
            <Input
              size="large"
              placeholder="Enter course name (optional)"
              allowClear
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Year of Study</span>}
            name={["studyDetails", "yearOfStudy"]}
            style={{marginBottom: 12}}
          >
            <Select
              size="large"
              placeholder="Select year (optional)"
              allowClear
              options={YEAR_OF_STUDY_OPTIONS}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <Form.Item
            label={<span className="text-base">Institution</span>}
            name={["studyDetails", "institution"]}
            style={{marginBottom: 12}}
          >
            <Input
              size="large"
              placeholder="Enter institution name (optional)"
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ResidentAcademicDetails;
