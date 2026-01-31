import { useParams } from "react-router-dom";
import { Tabs } from "antd";
import PageHeader from "../../../components/common/PageHeader";
import InventoryDetailPage from "../inventory/InventoryDetailPage";
import { getKitchenById } from "../../../hooks/inventory/useInventory";
import { useQuery } from "@tanstack/react-query";
import RecipeCategoryPage from "../recipe/RecipeCategoryPage";
import StaffPage from "../staff/StaffPage";
import MessMenuPage from "../MessMenuPage";
import { useSelector } from "react-redux";
import AddonPage from "../AddonPage";

const { TabPane } = Tabs;

const KitchenDetailPage = () => {
  const { kitchenId } = useParams();

  const selectedKitchenId = useSelector(
    (state) => state.properties.selectedProperty.kitchenId
  );
  console.log("selectedKitchenId", selectedKitchenId);

  const { data: kitchen } = useQuery({
    queryKey: ["kitchen-by-id", kitchenId],
    queryFn: () => getKitchenById(kitchenId),
  });

  const renderTabContent = (key) => {
    switch (key) {
      case "1":
        return <InventoryDetailPage kitchenId={kitchenId} />;
      case "2":
        return <RecipeCategoryPage />;
      case "3":
        return <StaffPage />;
      case "4":
        return <MessMenuPage />;
      case "5":
        return <AddonPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title={kitchen?.name || "Kitchen Details"}
        subtitle="Manage inventory, recipes, menus and staff for this kitchen"
      />

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Inventory" key="1">
            {renderTabContent("1")}
          </TabPane>
          <TabPane tab="Recipe" key="2">
            {renderTabContent("2")}
          </TabPane>
          <TabPane tab="Staff" key="3">
            {renderTabContent("3")}
          </TabPane>
          <TabPane tab="Menu" key="4">
            {renderTabContent("4")}
          </TabPane>
          <TabPane tab="Addons" key="5">
            {renderTabContent("5")}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default KitchenDetailPage;
