import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Timeline, Spin, Alert, Empty, Button } from "antd";
import dayjs from "dayjs";
import { getAccountsLogData } from "../../hooks/accounts/useAccounts.js";

const actionColors = {
  // ✅ Updated to match API `action` values (in lowercase)
  create: "#38C700", // Green
  payment: "#008000", // Dark Green
  update: "#0074C7", // Blue
  delete: "#C70000", // Red
  refund: "#FFA500", // Orange

  // Default color
  default: "#696969", // Grey
};

const TimelineLog = ({ logs }) => {
  // The action from API is "Payment", "Create", etc. We convert to lowercase to match our color map.
  const getColor = (action) =>
    actionColors[action.toLowerCase()] || actionColors.default;

  const renderTimelineItems = () =>
    logs.map((log) => ({
      color: getColor(log.action),
      dot: (
        <span
          style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: getColor(log.action),
            border: "2px solid white",
            boxShadow: `0 0 5px ${getColor(log.action)}`,
          }}
        />
      ),
      children: (
        <div style={{ marginBottom: "20px", marginLeft: "10px" }}>
          <div className="text-sm text-gray-500">
            {/* Use createdAt from API */}
            {dayjs(log.createdAt).format("DD MMM YYYY, hh:mm A")}
          </div>
          {/* ✅ Use `description` from API */}
          <div className="text-base font-medium mt-1 mb-1 text-gray-800">
            {log.description}
          </div>
          <div className="text-sm text-gray-600">
            {/* ✅ Use `performedBy` from API */}
            By: {log.performedBy}
          </div>
        </div>
      ),
    }));

  if (!logs || logs.length === 0) {
    return <Empty description="No log data found." />;
  }

  return (
    <div className="p-4">
      <Timeline mode="left" items={renderTimelineItems()} />
    </div>
  );
};

// --- Parent Component: AccountsLogs ---
// This component now fetches real data and handles loading/error states.

const AccountsLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // Add state for other filters if needed, e.g., const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, isFetching } = useQuery({
    // ✅ Corrected queryKey to be specific to account logs and its dependencies
    queryKey: ["accountLogs", currentPage, limit],
    // ✅ Corrected queryFn to pass the current state
    queryFn: () => getAccountsLogData({ page: currentPage, limit }),
    // keepPreviousData: true, // Optional: for a smoother pagination experience
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* ✅ Pass the actual log data from the API response to the TimelineLog component */}
      <TimelineLog logs={data?.data || []} />

      {/* Basic Pagination Controls */}
      <div className="flex justify-between items-center p-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isFetching}
        >
          Previous
        </Button>
        <span>
          Page {data?.pagination?.page || 1} of{" "}
          {data?.pagination?.totalPages || 1}
        </span>
        <Button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={
            currentPage >= (data?.pagination?.totalPages || 1) || isFetching
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AccountsLogs;
