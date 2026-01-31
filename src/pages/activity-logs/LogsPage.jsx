import {useState} from "react";
import {
  PageHeader,
  ResidentsLog,
  EmployeeLogs,
  RoomsLogs,
  InventoryLogs,
  AccountsLogs,
} from "../../components/index.js";
import {Tabs} from "antd";

function LogsPage() {
  const [activeTab, setActiveTab] = useState("1");

  const tabStyle = {
    fontSize: "16px",
    fontWeight: 500,
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: "1",
      label: <span style={tabStyle}>Residents</span>,
      children: <ResidentsLog key="residents-log" />,
    },
    {
      key: "2",
      label: <span style={tabStyle}>Employees</span>,
      children: <EmployeeLogs key="employees-log" />,
    },
    {
      key: "3",
      label: <span style={tabStyle}>Rooms</span>,
      children: <RoomsLogs key="rooms-log" />,
    },
    {
      key: "4",
      label: <span style={tabStyle}>Inventory</span>,
      children: <InventoryLogs key="inventory-log" />,
    },
    {
      key: "5",
      label: <span style={tabStyle}>Accounts</span>,
      children: <AccountsLogs key="accounts-log" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 sm:py-6 lg:px-12 lg:py-8">
      <PageHeader
        title="Activity Logs"
        subtitle="Track all important activities and logs"
      />

      <div className="overflow-x-auto">
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          tabBarGutter={16}
          items={tabItems}
          destroyInactiveTabPane={true}
          className="responsive-tabs"
        />
      </div>
    </div>
  );
}

export default LogsPage;
