import { Tabs } from "antd";
import { PageHeader, RequestsTab } from "../../components/index.js";
import OffboardedResidents from "./OffboardedResidents.jsx";
import OffboardedMessOnly from "./OffboardedMessOnly.jsx";
import OffboardedDailyRenters from "./OffboardedDailyRenters.jsx";

function OffboardingPage() {
  const items = [
    {
      key: "1",
      label: "Requests",
      children: <RequestsTab />,
    },
    {
      key: "2",
      label: "Offboarded Residents",
      children: <OffboardedResidents />,
    },
    {
      key: "3",
      label: "Daily Renters",
      children: <OffboardedDailyRenters />,
    },
    {
      key: "4",
      label: "Mess Only",
      children: <OffboardedMessOnly />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Offboarding & Requests"
        subtitle="Manage user requests, approvals, and offboarding records efficiently"
      />

      <Tabs defaultActiveKey="1" centered items={items} />
    </div>
  );
}

export default OffboardingPage;
