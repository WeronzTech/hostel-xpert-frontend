import { useState } from "react";
import StaffTable from "../../../components/mess/staff/StaffTable";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getStaffAccordingToKitchenId } from "../../../hooks/inventory/useInventory";
import PageHeader from "../../../components/common/PageHeader";
import { Empty, Input, Spin } from "antd";

const { Search } = Input;

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { kitchenId } = useSelector(
    (state) => state.properties.selectedProperty
  );
  const filter = { kitchenId, name: searchTerm };

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staff-list", filter],
    queryFn: () => getStaffAccordingToKitchenId(filter),
    enabled: !!kitchenId,
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (!staffData.staff || staffData.staff.length === 0) {
      return (
        <Empty description="No staff members found. Click 'Add Staff' to create one." />
      );
    }

    return <StaffTable staffList={staffData.staff} loading={isLoading} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Staff Management"
        subtitle="Manage all staff members for the property"
        showCalendar={false}
      />
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
          <Search
            placeholder="Search by staff name..."
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
            enterButton
          />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StaffPage;
