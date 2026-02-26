import {Tabs} from "antd";
import EmployeeDashboard from "../../components/employee/EmployeeDashboard";
import RolePage from "../../components/employee/RolePage";
import SocketEventPage from "./SocketEventPage";
import AttendanceOverview from "../../components/employee/AttendanceOverview";
// The new role page component

const {TabPane} = Tabs;

const EmployeePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <Tabs defaultActiveKey="1" type="card" centered>
        <TabPane tab="Employees" key="1">
          <EmployeeDashboard />
        </TabPane>
        <TabPane tab="Attendance Overview" key="2">
          <AttendanceOverview />
        </TabPane>
        <TabPane tab="Roles & Permissions" key="3">
          <RolePage />
        </TabPane>
        {/* <TabPane tab="Events & Permissions" key="4">
          <SocketEventPage />
        </TabPane> */}
      </Tabs>
    </div>
  );
};

export default EmployeePage;
