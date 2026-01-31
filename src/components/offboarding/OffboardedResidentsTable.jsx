import {Table, Tag, Tooltip} from "antd";
import {RxEnter} from "../../icons/index.js";
import {ActionButton} from "../../components/index.js";
import {purpleButton} from "../../data/common/color.js";
import {formatDate, formatLabel} from "../../utils/formatUtils.js";
import {useNavigate} from "react-router-dom";
import useTableSearch from "../../hooks/common/useTableSearch.jsx";

function OffboardedResidentsTable({data, pagination, loading, onPageChange}) {
  const {getColumnSearchProps} = useTableSearch();
  const navigate = useNavigate();

  // Column defined for the table
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
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      align: "center",
      render: (type) => {
        let color = "";
        switch (type?.toLowerCase()) {
          case "student":
            color = "blue";
            break;
          case "worker":
            color = "purple";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{formatLabel(type)}</Tag>;
      },
    },
    {
      title: "Room",
      key: "roomInfo",
      align: "center",
      render: (_, record) => {
        const roomNumber = record.roomNumber || "N/A";
        const sharingType = record.sharingType ? `(${record.sharingType})` : "";
        return `${roomNumber} ${sharingType}`.trim();
      },
    },
    {
      title: "Check-In Date",
      dataIndex: "joinedDate",
      key: "joinedDate",
      render: (date) => formatDate(date),
      align: "center",
    },
    {
      title: "Check-Out Date",
      dataIndex: "vacatedAt",
      key: "vacatedDate",
      render: (date) => formatDate(date),
      align: "center",
    },
    {
      title: "Total Stay",
      key: "calculatedDays",
      align: "center",
      render: (_, record) => {
        if (!record.joinedDate || !record.vacatedAt) return "N/A";

        const start = new Date(record.joinedDate);
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
      title: "Reason",
      dataIndex: "statusRequests",
      key: "reason",
      width: 150,
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
          <Tooltip title="Check In">
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

  // console.log(`Data for offboarded residents table`, data); // debug log

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

export default OffboardedResidentsTable;
