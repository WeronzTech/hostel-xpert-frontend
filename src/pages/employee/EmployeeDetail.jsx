import {Avatar, Tag, Tabs, Card, Row, Col, Button, Spin} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {useQuery} from "@tanstack/react-query";
import {useParams, useLocation} from "react-router-dom";
import {getManagerById, getStaffById} from "../../hooks/employee/useEmployee";

const EmployeeDetail = () => {
  const {id} = useParams();
  const location = useLocation();
  const employeeType = location.state?.type; // 'staff' or 'manager'

  const {data: staffData, isLoading: isStaffLoading} = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => getStaffById(id),
    enabled: !!id && employeeType === "staff", // Only fetch if it's a staff member
  });

  const {data: managerData, isLoading: isManagerLoading} = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => getManagerById(id),
    enabled: !!id && employeeType === "manager", // Only fetch if it's a manager
  });

  const employee = staffData || managerData;
  const isLoading = isStaffLoading || isManagerLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Employee not found.</p>
      </div>
    );
  }

  const personalDetailsItems = [
    {label: "Gender", value: employee.gender},
    {label: "Address", value: employee.address},
  ];

  const financialDetailsItems = [
    {
      label: "Monthly Salary",
      value: `₹ ${employee.salary?.toLocaleString() || "N/A"}`,
    },
    {
      label: "Pending Salary",
      value: `₹ ${employee.pendingSalary?.toLocaleString() || "N/A"}`,
    },
    {
      label: "Payment Status",
      value: (
        <Tag color={employee.salaryStatus === "Paid" ? "green" : "orange"}>
          {employee.salaryStatus || "N/A"}
        </Tag>
      ),
    },
  ];

  const tabs = [
    {
      key: "personal",
      label: "Personal",
      children: (
        <div>
          <Row gutter={[16, 16]}>
            {personalDetailsItems.map((item, index) => (
              <Col span={8} key={index}>
                <div className="text-gray-500">{item.label}</div>
                <div className="font-semibold">{item.value}</div>
              </Col>
            ))}
          </Row>
          <h3 className="text-lg font-semibold mt-6 mb-4">
            Identity Documents
          </h3>
          <Row gutter={16}>
            {employee.staffId && (
              <>
                <Col span={12}>
                  <Card>
                    <p className="font-semibold mb-2">Aadhar Card (Front)</p>
                    {employee.aadharFrontImage ? (
                      <img
                        src={employee.aadharFrontImage}
                        alt="Aadhar Card Front"
                        className="w-full h-auto rounded-md"
                      />
                    ) : (
                      <p>Not available</p>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <p className="font-semibold mb-2">Aadhar Card (Back)</p>
                    {employee.aadharBackImage ? (
                      <img
                        src={employee.aadharBackImage}
                        alt="Aadhar Card Back"
                        className="w-full h-auto rounded-md"
                      />
                    ) : (
                      <p>Not available</p>
                    )}
                  </Card>
                </Col>
              </>
            )}
            {employee.managerId && (
              <Col span={12}>
                <Card>
                  <p className="font-semibold mb-2">Aadhar Card</p>
                  {employee.aadhaarImage ? (
                    <img
                      src={employee.aadhaarImage}
                      alt="Aadhar Card"
                      className="w-full h-auto rounded-md"
                    />
                  ) : (
                    <p>Not available</p>
                  )}
                </Card>
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      key: "financial",
      label: "Financial",
      children: (
        <div>
          <Row gutter={[16, 24]}>
            {financialDetailsItems.map((item, index) => (
              <Col span={8} key={index}>
                <div className="text-gray-500">{item.label}</div>
                <div className="font-semibold text-lg">{item.value}</div>
              </Col>
            ))}
          </Row>
          <div className="mt-8">
            <Button type="primary" icon={<TransactionOutlined />}>
              Transaction History
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
          <p className="text-gray-500">
            Detailed information about the employee.
          </p>
        </header>
        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm">
              <div className="text-center bg-[#059669] text-white p-4 rounded-t-[20px]">
                <Avatar
                  size={96}
                  src={employee.photo}
                  icon={<UserOutlined />}
                  className="mb-4 border-2 border-gray-200"
                />
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <p className="text-white mb-2">
                  {employee.managerId || employee.staffId}
                </p>
                <Tag color={employee.status === "Active" ? "green" : "red"}>
                  {employee.status}
                </Tag>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <PhoneOutlined className="mr-3 text-gray-500" />
                  <span>{employee.contactNumber}</span>
                </div>
                <div className="flex items-center">
                  <HomeOutlined className="mr-3 text-gray-500" />
                  <span>{employee.address || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <CalendarOutlined className="mr-3 text-gray-500" />
                  <span>
                    Joined on {dayjs(employee.joinDate).format("DD MMMM, YYYY")}
                  </span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm">
              <Tabs defaultActiveKey="personal" items={tabs} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EmployeeDetail;
