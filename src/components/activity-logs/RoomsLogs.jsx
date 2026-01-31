import {useState, useEffect} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {TimelineLog} from "../index.js";
import {useSelector} from "react-redux";
import {DatePicker, Button, Pagination, Space, Spin, message, Grid} from "antd";
import dayjs from "dayjs";
import {getPropertyActivityLogs} from "../../hooks/property/useProperty.js";

const {RangePicker} = DatePicker;
const {useBreakpoint} = Grid;
const PAGE_SIZE = 10;

const RoomsLogs = () => {
  const queryClient = useQueryClient();
  const {selectedProperty} = useSelector((state) => state.properties);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState([]);
  const screens = useBreakpoint();

  // Clear queries when component unmounts
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["roomsActivityLogs"]);
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
      "roomsActivityLogs",
      selectedProperty?.id,
      currentPage,
      dateRange,
    ],
    queryFn: () =>
      getPropertyActivityLogs({
        propertyId: selectedProperty?.id,
        page: currentPage,
        limit: PAGE_SIZE,
        startDate: dateRange[0]?.startOf("day").toISOString(),
        endDate: dateRange[1]?.endOf("day").toISOString(),
        category: "property",
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
    message.success("Room logs filters reset");
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spin size="large" tip="Loading room activity logs..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error loading room logs: {error.message}
        <Button
          type="link"
          onClick={() => queryClient.refetchQueries(["roomsActivityLogs"])}
          className="ml-2"
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
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
            className="w-full sm:w-auto"
            style={{minWidth: screens.sm ? "250px" : "100%"}}
          />
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
          showTotal={(total) => `Total ${total} room activities`}
          className="mt-2 sm:mt-0"
          responsive={true}
        />
      </div>

      {isFetching ? (
        <div className="text-center p-4">
          <Spin tip="Loading room activities..." />
        </div>
      ) : (
        <>
          <TimelineLog
            logs={response?.data || []}
            emptyText="No room activity logs found"
          />
          {response?.data?.length > 0 && (
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

export default RoomsLogs;
