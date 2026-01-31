import {Table, Tag, Tooltip} from "antd";
import {RxEnter} from "../../icons/index.js";
import {ActionButton} from "../../components/index.js";
import {purpleButton} from "../../data/common/color.js";
import {useNavigate} from "react-router-dom";
import {formatDate} from "../../utils/formatUtils.js";
import useTableSearch from "../../hooks/common/useTableSearch.jsx";

function OffboardedMessOnlyTable({data, pagination, loading, onPageChange}) {
  const {getColumnSearchProps} = useTableSearch();
  const navigate = useNavigate();
  console.log(data);
  // Column defined for the offboarded mess only people
  const columns = [
    {
      title: "#",
      key: "index",
      align: "center",
      render: (_, __, index) =>
        (pagination?.currentPage - 1) * (pagination?.itemsPerPage || 10) +
        index +
        1,
      fixed: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      align: "left",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      align: "center",
    },
    {
      title: "Meal Types",
      key: "mealTypes",
      align: "center",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {record.mealType?.length > 0 ? (
            record.mealType.map((type) => (
              <Tag key={type} color="geekblue">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Tag>
            ))
          ) : (
            <Tag color="default">N/A</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Mess Start Date",
      dataIndex: "messStartDate",
      key: "messStartDate",
      render: (date) => formatDate(date),
      align: "center",
    },
    {
      title: "Mess End Date",
      dataIndex: "vacatedAt",
      key: "vacatedAt",
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Total Days",
      key: "calculatedDays",
      align: "center",
      render: (_, record) => {
        if (!record.messStartDate || !record.vacatedAt) return "N/A";

        const start = new Date(record.messStartDate);
        const end = new Date(record.vacatedAt);

        if (isNaN(start) || isNaN(end) || end < start) return "N/A";

        // Calculate full months and remaining days
        let months = 0;
        let tempDate = new Date(start);

        while (true) {
          let nextMonth = new Date(tempDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          if (nextMonth <= end) {
            months++;
            tempDate = nextMonth;
          } else {
            break;
          }
        }

        const days = Math.floor((end - tempDate) / (1000 * 60 * 60 * 24));

        // Format the output
        if (months > 0) {
          return `${months} month${months > 1 ? "s" : ""}${
            days > 0 ? ` / ${days} day${days > 1 ? "s" : ""}` : ""
          }`;
        }
        return `${days} day${days !== 1 ? "s" : ""}`;
      },
    },
    {
      title: "Rate/Day",
      dataIndex: "rent",
      key: "rent",
      align: "center",
      render: (value) => `₹${value?.toLocaleString()}`,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "center",
    },
    {
      title: "Reason",
      dataIndex: "statusRequests",
      key: "reason",
      align: "center",
      ellipsis: true,
      render: (statusRequests) => {
        // Filter only check_out requests
        const checkOutRequests = Array.isArray(statusRequests)
          ? statusRequests.filter((req) => req.type === "checked_out")
          : [];

        // Get the latest (last) check_out request
        const latestCheckOut = checkOutRequests[checkOutRequests.length - 1];

        const reason = latestCheckOut?.reason?.trim();

        return (
          <Tooltip title={reason || "N/A"}>
            <span
              style={{
                fontStyle: reason ? "normal" : "italic",
                color: reason ? "inherit" : "#888",
              }}
            >
              {reason || "N/A"}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-3 justify-center">
          {/* <Tooltip title="View Details">
            <ActionButton
              shape="circle"
              icon={<EyeOutlined />}
              customTheme={greenButton}
              onClick={() => handleView(record._id)}
            />
          </Tooltip> */}
          <Tooltip title="Add back">
            <ActionButton
              shape="circle"
              icon={<RxEnter />}
              customTheme={purpleButton}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click from triggering
                navigate(`/onboarding/rejoin/${record._id}`);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination?.currentPage || 1,
          pageSize: pagination?.itemsPerPage || 10,
          total: pagination?.total || 0,
          onChange: (page) => onPageChange(page),
          showSizeChanger: false,
        }}
        scroll={{x: "max-content"}}
        onRow={(record) => ({
          onClick: () => navigate(`/resident/${record._id}`),
          className: "cursor-pointer",
        })}
      />
    </div>
  );
}

export default OffboardedMessOnlyTable;
