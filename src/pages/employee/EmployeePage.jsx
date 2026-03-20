import {Tabs, Dropdown} from "antd";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";

import EmployeeDashboard from "../../components/employee/EmployeeDashboard";
import RolePage from "../../components/employee/RolePage";
import AttendanceOverview from "../../components/employee/AttendanceOverview";
import PayrollPage from "../../components/employee/PayrollPage";
import {useSelector} from "react-redux";
import {getRoleById} from "../../hooks/employee/useEmployee";
import {useQuery} from "@tanstack/react-query";
import {DownOutlined} from "@ant-design/icons";

const {TabPane} = Tabs;

const EmployeePage = () => {
  const roleId = useSelector((state) => state?.auth?.user?.role?.id);
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {type} = useParams();
  const [searchParams] = useSearchParams();

  const {data: role} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
  });

  const permissions = role?.permissions ?? [];

  const hasPermission = (requiredPermission) => {
    if (!permissions.length) return false;
    if (permissions.includes("ALL_PRIVILEGES")) return true;
    return permissions.includes(requiredPermission);
  };

  const tab = searchParams.get("tab");

  let activeTab = "1";

  if (type) activeTab = "2";
  if (tab === "attendance") activeTab = "3";
  if (tab === "roles") activeTab = "4";

  const payrollMenu = {
    items: [
      {
        key: "property",
        label: "Property",
        onClick: () => navigate("/employees/PROPERTY"),
      },
      {
        key: "kitchen",
        label: "Kitchen",
        onClick: () => navigate("/employees/KITCHEN"),
      },
    ],
  };

  const handleTabChange = (key) => {
    if (key === "1") navigate("/employees");
    if (key === "3") navigate("/employees?tab=attendance");
    if (key === "4") navigate("/employees?tab=roles");
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <Tabs
        activeKey={activeTab}
        type="card"
        centered
        onChange={handleTabChange}
      >
        <TabPane tab="Employees" key="1">
          <EmployeeDashboard />
        </TabPane>

        <TabPane
          key="2"
          tab={
            <span style={{display: "flex", alignItems: "center", gap: 4}}>
              <Dropdown menu={payrollMenu} trigger={["hover"]}>
                <span style={{cursor: "pointer"}}>
                  Payroll <DownOutlined style={{fontSize: 10}} />
                </span>
              </Dropdown>
            </span>
          }
          disabled={!hasPermission("PAYROLL_VIEW")}
        >
          <PayrollPage payrollType={type} />
        </TabPane>

        <TabPane
          tab="Attendance Overview"
          key="3"
          disabled={!hasPermission("ATTENDANCE_VIEW")}
        >
          <AttendanceOverview />
        </TabPane>

        {user?.role?.name === "Admin" && (
          <TabPane
            tab="Roles & Permissions"
            key="4"
            disabled={!hasPermission("ALL_PRIVILEGES")}
          >
            <RolePage />
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default EmployeePage;
