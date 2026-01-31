import PageHeader from "../../components/common/PageHeader.jsx";
import {Tabs} from "antd";
import MessOrderPanel from "./MessOrderPanel.jsx";
import AddonOrderPanel from "./AddonOrderPanel.jsx";

function OrderDetails() {
  const tabItems = [
    {key: "mess", label: "Mess Overview", children: <MessOrderPanel />},
    {
      key: "addon",
      label: "Addon Overview",
      children: <AddonOrderPanel />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Order Overview"
        subtitle="Manage all the order details"
      />

      {/* Tabs */}
      <Tabs type="card" defaultActiveKey="mess" items={tabItems} centered />
    </div>
  );
}

export default OrderDetails;
