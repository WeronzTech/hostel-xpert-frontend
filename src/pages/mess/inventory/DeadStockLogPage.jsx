import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Input, message, Button, Dropdown, Menu, DatePicker } from "antd";
import { FaFileDownload } from "react-icons/fa";
import PageHeader from "../../../components/common/PageHeader";
import DeadStockLogTable from "../../../components/mess/inventory/DeadStockLogTable";
import {
  downloadDeadStockReport,
  getDeadStockLogs,
} from "../../../hooks/inventory/useInventory";

const { Search } = Input;
const { RangePicker } = DatePicker;

const DeadStockLogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);
  const [dateRange, setDateRange] = useState(null); // State for the date filter
  const [messageApi, contextHolder] = message.useMessage();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  const {
    data: logData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "deadStockLogs",
      currentPage,
      search,
      limit,
      selectedPropertyId,
      dateRange,
    ],
    queryFn: () =>
      getDeadStockLogs({
        page: currentPage,
        limit,
        search,
        propertyId: selectedPropertyId,
        ...(dateRange && {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        }),
      }),
    keepPreviousData: true,
    enabled: !!selectedPropertyId,
  });

  const downloadReport = useMutation({
    mutationKey: ["download-dead-stock-report"],
    mutationFn: (filters) => downloadDeadStockReport(filters),
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDownload = (format) => {
    const filters = {
      propertyId: selectedPropertyId,
      format,
      ...(dateRange && {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      }),
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
          link.setAttribute("download", `dead-stock-report.${format}`);
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

  const menu = (
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
        <PageHeader
          title="Dead Stock Logs"
          subtitle="Review all damaged or expired stock"
        />

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-end items-center gap-4 my-4">
            <Search
              placeholder="Search by product name..."
              onSearch={handleSearch}
              style={{ width: 250 }}
              enterButton
            />
            <div className="flex items-center gap-2">
              <RangePicker onChange={(dates) => setDateRange(dates)} />
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button
                  type="primary"
                  icon={<FaFileDownload />}
                  loading={downloadReport.isPending}
                >
                  Download Report
                </Button>
              </Dropdown>
            </div>
          </div>
          <DeadStockLogTable
            logs={logData?.data || []}
            loading={isLoading || isFetching}
            total={logData?.total || 0}
            currentPage={currentPage}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default DeadStockLogPage;
