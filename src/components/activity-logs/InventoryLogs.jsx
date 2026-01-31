import {useState, useEffect} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {
  DatePicker,
  Button,
  Pagination,
  Spin,
  message,
  Grid,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import {getInventoryLogs} from "../../hooks/inventory/useInventory.js";
import InventoryTimelineLog from "./InventoryTimelineLog.jsx";

const {RangePicker} = DatePicker;
const {useBreakpoint} = Grid;
const PAGE_SIZE = 10;

const InventoryLogs = () => {
  const queryClient = useQueryClient();
  const {selectedProperty} = useSelector((state) => state.properties);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState([]);
  const screens = useBreakpoint();

  // Clear queries when component unmounts
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["inventoryActivityLogs"]);
    };
  }, [queryClient]);

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "inventoryActivityLogs",
      selectedProperty?.id,
      currentPage,
      dateRange,
    ],
    queryFn: () =>
      getInventoryLogs({
        propertyId: selectedProperty?.id,
        page: currentPage,
        limit: PAGE_SIZE,
        startDate: dateRange[0]?.startOf("day").toISOString(),
        endDate: dateRange[1]?.endOf("day").toISOString(),
      }),
    keepPreviousData: false,
    staleTime: 30000,
    retry: 2,
  });

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setDateRange([]);
    setCurrentPage(1);
    message.success("Filters reset successfully");
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spin size="large" tip="Loading inventory logs..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error loading logs: {error.message}
        <Button
          type="link"
          onClick={() => queryClient.refetchQueries(["inventoryActivityLogs"])}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <ConfigProvider
            theme={{
              components: {
                DatePicker: {
                  zIndexPopup: 1050,
                },
              },
            }}
          >
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              className="w-full sm:w-auto"
              style={{minWidth: screens.sm ? "250px" : "100%"}}
              getPopupContainer={(trigger) => trigger.parentElement}
              popupStyle={
                !screens.sm
                  ? {
                      position: "fixed",
                      width: "90vw",
                      top: "20px",
                      left: "5vw",
                    }
                  : {}
              }
              popupClassName="custom-range-picker"
            />
          </ConfigProvider>
          <Button onClick={resetFilters} danger className="w-full sm:w-auto">
            Reset Filters
          </Button>
        </div>

        <Pagination
          current={currentPage}
          total={response?.pagination?.total || 0}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
          showSizeChanger={false}
          disabled={isFetching}
          showTotal={(total) => `Total ${total} items`}
          className="mt-2 sm:mt-0"
          responsive={true}
        />
      </div>

      {isFetching ? (
        <div className="text-center p-4">
          <Spin tip="Loading new data..." />
        </div>
      ) : (
        <>
          <InventoryTimelineLog logs={response?.logs || []} />
          {response?.logs?.length > 0 && (
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                total={response?.pagination?.total || 0}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryLogs;
