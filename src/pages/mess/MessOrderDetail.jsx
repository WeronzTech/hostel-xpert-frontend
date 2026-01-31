import {useQuery} from "@tanstack/react-query";
import StatsGrid from "../../components/common/StatsGrid";
import {OrderDetailsTable} from "../../components/index.js";
import {
  IoFastFoodOutline,
  MdOutlineFreeBreakfast,
  MdOutlineLunchDining,
  PiBowlFood,
} from "../../icons/index.js";
import {Button, Tabs} from "antd";
import {getMessOrderByPropertyId} from "../../hooks/inventory/useInventory.js";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import ManualBookingModal from "../../modals/mess/ManualBookingModal.jsx";

function MessOrderDetail() {
  const [filter, setFilter] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedProperty = useSelector(
    (state) => state.properties.selectedProperty
  );

  // Fetch mess orders - show all when no property is selected
  const {data: messOrderData, isLoading: messOrderLoading} = useQuery({
    queryKey: ["mess-order-list", filter],
    queryFn: () => {
      if (filter.propertyId) {
        return getMessOrderByPropertyId(filter);
      } else {
        return getMessOrderByPropertyId({});
      }
    },
    enabled: true, // Always fetch data
  });

  useEffect(() => {
    if (selectedProperty?.id) {
      setFilter({propertyId: selectedProperty.id});
    } else {
      setFilter({}); // Empty filter to show all data
    }
  }, [selectedProperty?.id]);

  // Stats for Cards - handle both filtered and all data
  const stats = [
    {
      title: "Breakfast",
      value:
        messOrderData?.data?.filter((item) => item.mealType === "Breakfast")
          ?.length || 0,
      icon: <MdOutlineFreeBreakfast className="text-xl" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Lunch",
      value:
        messOrderData?.data?.filter((item) => item.mealType === "Lunch")
          ?.length || 0,
      icon: <MdOutlineLunchDining className="text-xl" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Snacks",
      value:
        messOrderData?.data?.filter((item) => item.mealType === "Snacks")
          ?.length || 0,
      icon: <IoFastFoodOutline className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Dinner",
      value:
        messOrderData?.data?.filter((item) => item.mealType === "Dinner")
          ?.length || 0,
      icon: <PiBowlFood className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  // Tab items - handle both filtered and all data
  const tabItems = [
    {
      key: "breakfast",
      label: "Breakfast",
      children: (
        <OrderDetailsTable
          data={messOrderData?.data?.filter(
            (item) => item.mealType === "Breakfast"
          )}
        />
      ),
    },
    {
      key: "lunch",
      label: "Lunch",
      children: (
        <OrderDetailsTable
          data={messOrderData?.data?.filter(
            (item) => item.mealType === "Lunch"
          )}
        />
      ),
    },
    {
      key: "snacks",
      label: "Snacks",
      children: (
        <OrderDetailsTable
          data={messOrderData?.data?.filter(
            (item) => item.mealType === "Snacks"
          )}
        />
      ),
    },
    {
      key: "dinner",
      label: "Dinner",
      children: (
        <OrderDetailsTable
          data={messOrderData?.data?.filter(
            (item) => item.mealType === "Dinner"
          )}
          messOrderLoading
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Stats card */}
      <StatsGrid stats={stats} />

      {/* Tabs + Button in same row */}

      <Tabs
        type="card"
        defaultActiveKey="breakfast"
        items={tabItems}
        centered={false}
        tabBarExtraContent={{
          right: (
            <Button
              type="primary"
              className="ml-2"
              onClick={() => setIsModalOpen(true)}
            >
              Add More
            </Button>
          ),
        }}
      />

      {/* Manual Booking Modal */}
      <ManualBookingModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProperty={selectedProperty}
      />
    </div>
  );
}

export default MessOrderDetail;
