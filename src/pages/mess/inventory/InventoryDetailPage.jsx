import { IoAddCircleOutline } from "react-icons/io5";
import { Button, Input, Dropdown, Menu, message, DatePicker } from "antd";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageHeader from "../../../components/common/PageHeader";
import InventoryDetailTable from "../../../components/mess/inventory/InventoryDetailTable";
import {
  getInventory,
  downloadWeeklyUsageReport,
} from "../../../hooks/inventory/useInventory.js";
import AddInventoryModal from "../../../modals/mess/inventory/AddInventoryModal.jsx";
import EditInventoryModal from "../../../modals/mess/inventory/EditInventoryModal.jsx";
import DailyUsageModal from "../../../modals/mess/inventory/DailyUsageModal.jsx";
import UpdateStockModal from "../../../modals/mess/inventory/UpdateStockModal.jsx";
import DeadStockModal from "../../../modals/mess/inventory/DeadStockModal.jsx";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "../../../components/index.js";
import { yellowButton } from "../../../data/common/color.js";
import { FaFileDownload } from "react-icons/fa";

const { Search } = Input;
const { RangePicker } = DatePicker;

const InventoryDetailPage = ({ kitchenId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDailyUsageModalOpen, setIsDailyUsageModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isDeadStockModalOpen, setIsDeadStockModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [dates, setDates] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["inventory", currentPage, search, limit, kitchenId],
    queryFn: () =>
      getInventory({ page: currentPage, limit, search, kitchenId }),
    enabled: !!kitchenId,
  });

  const downloadReport = useMutation({
    mutationKey: ["download-weekly-usage-report"],
    mutationFn: (filters) => downloadWeeklyUsageReport(filters),
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (record) => {
    setIsEditModalOpen(true);
    setSelectedInventoryItem(record);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedInventoryItem(null);
  };

  const handleDailyUsage = (record) => {
    setSelectedInventoryItem(record);
    setIsDailyUsageModalOpen(true);
  };

  const handleUpdateStock = (record) => {
    setIsUpdateStockModalOpen(true);
    setSelectedInventoryItem(record);
  };

  const handleDeadStock = (record) => {
    setIsDeadStockModalOpen(true);
    setSelectedInventoryItem(record);
  };

  const handleDownload = (format) => {
    if (!dateRange || dateRange.length !== 2) {
      messageApi.error("Please select a date range of up to 7 days.");
      return;
    }

    const filters = {
      kitchenId,
      format,
      startDate: dateRange[0].toISOString(),
      endDate: dateRange[1].toISOString(),
    };

    downloadReport.mutate(filters, {
      onSuccess: (data) => {
        try {
          const blob = new Blob([data], {
            type:
              format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `usage-report.${format}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          messageApi.success("Report downloaded successfully.");
        } catch (e) {
          console.error("Error creating download link:", e);
          messageApi.error(
            "A client-side error occurred while preparing the download."
          );
        }
      },
      onError: (error) => {
        messageApi.error(
          error.response?.data?.error || "Failed to download the report."
        );
      },
    });
  };

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const disabledDate = (current) => {
    if (!dates || dates.length === 0) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], "days") > 6;
    const tooEarly = dates[0] && dates[0].diff(current, "days") > 6;
    return tooEarly || tooLate;
  };

  const downloadMenu = (
    <Menu>
      <Menu.Item key="csv" onClick={() => handleDownload("csv")}>
        Download as CSV
      </Menu.Item>
      <Menu.Item key="pdf" onClick={() => handleDownload("pdf")}>
        Download as PDF
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <div className="flex justify-between items-center">
          <PageHeader
            title="Inventory"
            subtitle="Manage all the Stocks"
            showCalendar={false}
          />
          <div className="flex items-center gap-4">
            <Button
              type="primary"
              icon={<IoAddCircleOutline className="text-lg" />}
              onClick={showModal}
            >
              Create Inventory
            </Button>
            <ActionButton
              type="primary"
              customTheme={yellowButton}
              onClick={() => navigate("/kitchen/dead-stock")}
            >
              Dead Stock Logs
            </ActionButton>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
            <Search
              placeholder="Search by product name..."
              onSearch={handleSearch}
              style={{ width: 250 }}
              enterButton
            />
            <div className="flex items-center gap-2">
              <RangePicker
                disabledDate={disabledDate}
                onCalendarChange={(val) => setDates(val)}
                onChange={(val) => setDateRange(val)}
                onOpenChange={(open) => {
                  if (!open) setDates([]);
                }}
              />
              <Dropdown overlay={downloadMenu} trigger={["click"]}>
                <Button
                  type="default"
                  icon={<FaFileDownload />}
                  loading={downloadReport.isPending}
                >
                  Download Report
                </Button>
              </Dropdown>
            </div>
          </div>

          <InventoryDetailTable
            inventoryItems={data?.data || []}
            loading={isLoading || isFetching}
            total={data?.total || 0}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            limit={limit}
            onEdit={handleEdit}
            onDailyUsage={handleDailyUsage}
            onUpdateStock={handleUpdateStock}
            onDeadStock={handleDeadStock}
          />
        </div>
      </div>
      <AddInventoryModal open={isModalOpen} onClose={handleClose} />
      <EditInventoryModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        initialData={selectedInventoryItem}
      />
      <DailyUsageModal
        open={isDailyUsageModalOpen}
        onClose={() => setIsDailyUsageModalOpen(false)}
        inventoryItem={selectedInventoryItem}
      />
      <UpdateStockModal
        open={isUpdateStockModalOpen}
        onClose={() => setIsUpdateStockModalOpen(false)}
        inventoryItem={selectedInventoryItem}
      />
      <DeadStockModal
        open={isDeadStockModalOpen}
        onClose={() => setIsDeadStockModalOpen(false)}
        inventoryItem={selectedInventoryItem}
      />
    </>
  );
};

export default InventoryDetailPage;
