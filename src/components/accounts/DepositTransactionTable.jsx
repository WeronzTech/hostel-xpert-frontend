// import {Table, Tag, Tooltip} from "antd";

// const DepositTransactionsTable = ({
//   data,
//   loading,
//   pagination,
//   onTableChange,
//   type = "received",
// }) => {
//   console.log(data, type);

//   // Base columns that are common for both types
//   const baseColumns = [
//     {
//       title: "#",
//       key: "serial",
//       fixed: "left",
//       align: "center",
//       width: 40,
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "Name",
//       dataIndex: "name",
//       fixed: "left",
//       key: "name",
//       width: 60,
//       ellipsis: true,
//       render: (text) => (
//         <Tooltip title={text}>
//           <span className="font-medium">{text}</span>
//         </Tooltip>
//       ),
//     },
//   ];

//   // Columns specific to "received" type
//   const receivedColumns = [
//     {
//       title: "User Type",
//       dataIndex: "userType",
//       key: "userType",
//       align: "center",
//       width: 60,
//       render: (userType) => {
//         const typeConfig = {
//           student: {color: "blue", label: "Student"},
//           worker: {color: "green", label: "Worker"},
//           professional: {color: "purple", label: "Professional"},
//           other: {color: "default", label: "Other"},
//         };

//         const config = typeConfig[userType?.toLowerCase()] || {
//           color: "default",
//           label: userType || "N/A",
//         };

//         return <Tag color={config.color}>{config.label}</Tag>;
//       },
//     },
//     {
//       title: "Deposit",
//       key: "totalDeposit",
//       align: "center",
//       width: 60,
//       render: (_, record) => {
//         const refundable = record?.refundableDeposit || 0;
//         const nonRefundable = record?.nonRefundableDeposit || 0;
//         const total = refundable + nonRefundable;
//         return total > 0 ? (
//           <div className="font-semibold">₹ {total.toLocaleString()}</div>
//         ) : (
//           "-"
//         );
//       },
//     },
//     {
//       title: "Payment Method",
//       dataIndex: "paymentMethod",
//       key: "paymentMethod",
//       align: "center",
//       width: 60,
//       render: (method) => {
//         const methodConfig = {
//           Cash: {color: "green"},
//           UPI: {color: "volcano"},
//           Razorpay: {color: "blue"},
//           "Bank Transfer": {color: "cyan"},
//           Card: {color: "gold"},
//           "Petty Cash": {color: "magenta"},
//           Other: {color: "default"},
//         };
//         const config = methodConfig[method] || {color: "default"};
//         return <Tag color={config.color}>{method || "N/A"}</Tag>;
//       },
//     },
//     {
//       title: "Payment Date",
//       dataIndex: "paymentDate",
//       key: "paymentDate",
//       align: "center",
//       width: 60,
//       render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
//     },
//     {
//       title: "Transaction Details",
//       dataIndex: "transactionId",
//       key: "transactionId",
//       align: "center",
//       width: 60,
//       render: (_, record) => {
//         const {transactionId, collectedBy, paymentMethod} = record;

//         // Show Transaction ID if exists and not cash
//         if (transactionId && paymentMethod !== "Cash") {
//           return (
//             <Tooltip title={transactionId}>
//               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                 {transactionId.length > 12
//                   ? `${transactionId.slice(0, 10)}...`
//                   : transactionId}
//               </span>
//             </Tooltip>
//           );
//         }

//         // Otherwise show Collected By (for Cash or missing transactionId)
//         if (collectedBy) {
//           return (
//             <Tooltip title={`Collected by ${collectedBy}`}>
//               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                 by{" "}
//                 {collectedBy.length > 10
//                   ? `${collectedBy.slice(0, 8)}...`
//                   : collectedBy}
//               </span>
//             </Tooltip>
//           );
//         }
//         return <span className="text-gray-400 text-xs">N/A</span>;
//       },
//     },
//     {
//       title: "Receipt No",
//       dataIndex: "receiptNumber",
//       key: "receiptNumber",
//       align: "center",
//       width: 80,
//       render: (_, record) => {
//         const {receiptNumber} = record;

//         if (!receiptNumber) {
//           return <span className="text-gray-400 text-xs">N/A</span>;
//         }

//         const shortReceipt = receiptNumber.includes("-")
//           ? receiptNumber.split("-").slice(1).join("-")
//           : receiptNumber;

//         return (
//           <Tooltip title={`Receipt No: ${receiptNumber}`}>
//             <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 cursor-pointer hover:bg-blue-100">
//               {shortReceipt.length > 16
//                 ? `${shortReceipt.slice(0, 14)}...`
//                 : shortReceipt}
//             </span>
//           </Tooltip>
//         );
//       },
//     },
//     {
//       title: "Amount Paid",
//       dataIndex: "amountPaid",
//       key: "amountPaid",
//       align: "center",
//       width: 60,
//       render: (amount) => (
//         <div className="font-semibold text-green-700">
//           {amount ? `₹ ${amount.toLocaleString()}` : "-"}
//         </div>
//       ),
//     },
//   ];

//   // Columns specific to "refunded" type
//   const refundedColumns = [
//     {
//       title: "User Type",
//       dataIndex: "userType",
//       key: "userType",
//       align: "center",
//       width: 60,
//       render: (userType) => {
//         const typeConfig = {
//           student: {color: "blue", label: "Student"},
//           worker: {color: "green", label: "Worker"},
//           professional: {color: "purple", label: "Professional"},
//           other: {color: "default", label: "Other"},
//         };

//         const config = typeConfig[userType?.toLowerCase()] || {
//           color: "default",
//           label: userType || "N/A",
//         };

//         return <Tag color={config.color}>{config.label}</Tag>;
//       },
//     },
//     {
//       title: "Deposit",
//       key: "totalDeposit",
//       align: "center",
//       width: 60,
//       render: (_, record) => {
//         const refundable = record?.refundableDeposit || 0;
//         const nonRefundable = record?.nonRefundableDeposit || 0;
//         const total = refundable + nonRefundable;
//         return total > 0 ? (
//           <div className="font-semibold">₹ {total.toLocaleString()}</div>
//         ) : (
//           "-"
//         );
//       },
//     },
//     {
//       title: "Payment Method",
//       dataIndex: "paymentMethod",
//       key: "paymentMethod",
//       align: "center",
//       width: 60,
//       render: (method) => {
//         const methodConfig = {
//           Cash: {color: "green"},
//           UPI: {color: "blue"},
//           "Bank Transfer": {color: "purple"},
//           Card: {color: "orange"},
//           "Petty Cash": {color: "red"},
//         };
//         const config = methodConfig[method] || {color: "default"};
//         return <Tag color={config.color}>{method || "N/A"}</Tag>;
//       },
//     },
//     {
//       title: "Payment Date",
//       dataIndex: "paymentDate",
//       key: "paymentDate",
//       align: "center",
//       width: 60,
//       render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
//     },
//     {
//       title: "Transaction Details",
//       dataIndex: "transactionId",
//       key: "transactionId",
//       align: "center",
//       width: 70,
//       render: (_, record) => {
//         const {transactionId, handledBy, paymentMethod} = record;

//         // Show Transaction ID if exists and not cash
//         if (transactionId && paymentMethod !== "Cash") {
//           return (
//             <Tooltip title={transactionId}>
//               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                 {transactionId.length > 12
//                   ? `${transactionId.slice(0, 10)}...`
//                   : transactionId}
//               </span>
//             </Tooltip>
//           );
//         }

//         // Otherwise show Handled By (for Cash or missing transactionId)
//         if (handledBy) {
//           return (
//             <Tooltip title={`Handled by ${handledBy}`}>
//               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                 by{" "}
//                 {handledBy.length > 10
//                   ? `${handledBy.slice(0, 8)}...`
//                   : handledBy}
//               </span>
//             </Tooltip>
//           );
//         }
//         return <span className="text-gray-400 text-xs">N/A</span>;
//       },
//     },
//     {
//       title: "Refund Amount",
//       dataIndex: "amountPaid",
//       key: "amountPaid",
//       align: "center",
//       width: 70,
//       render: (amount) => (
//         <div className="font-semibold text-orange-600">
//           {amount ? `₹ ${amount.toLocaleString()}` : "-"}
//         </div>
//       ),
//     },
//   ];

//   // Columns specific to "pending" type
//   const pendingColumns = [
//     {
//       title: "Contact",
//       dataIndex: "contact",
//       key: "contact",
//       align: "center",
//       width: 80,
//       render: (contact) => <span>{contact || "-"}</span>,
//     },
//     {
//       title: "User Type",
//       dataIndex: "userType",
//       key: "userType",
//       align: "center",
//       width: 60,
//       render: (userType) => {
//         const typeConfig = {
//           student: {color: "blue", label: "Student"},
//           worker: {color: "green", label: "Worker"},
//           professional: {color: "purple", label: "Professional"},
//           other: {color: "default", label: "Other"},
//         };

//         const config = typeConfig[userType?.toLowerCase()] || {
//           color: "default",
//           label: userType || "N/A",
//         };

//         return <Tag color={config.color}>{config.label}</Tag>;
//       },
//     },
//     {
//       title: "Deposit",
//       key: "totalDeposit",
//       align: "center",
//       width: 70,
//       render: (_, record) => {
//         const total = record?.totalDeposit || 0;
//         return total > 0 ? (
//           <div className="font-semibold">₹ {total.toLocaleString()}</div>
//         ) : (
//           "-"
//         );
//       },
//     },
//     {
//       title: "Join Date",
//       dataIndex: "joinDate",
//       key: "joinDate",
//       align: "center",
//       width: 70,
//       render: (date) => (
//         <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>
//       ),
//     },
//     {
//       title: "Last Payment",
//       key: "lastPayment",
//       align: "center",
//       width: 90,
//       render: (_, record) => {
//         const lastPaidDate = record?.lastPaidDate;
//         const amountPaid = record?.amountPaid || 0;

//         return (
//           <div className="text-center">
//             {lastPaidDate ? (
//               <>
//                 <div className="text-sm font-medium">
//                   {new Date(lastPaidDate).toLocaleDateString()}
//                 </div>
//                 {amountPaid > 0 && (
//                   <div className="text-xs text-green-600 font-semibold">
//                     ₹ {amountPaid.toLocaleString()}
//                   </div>
//                 )}
//               </>
//             ) : (
//               <span className="text-gray-400 text-sm">No payments</span>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       title: "Pending Deposit",
//       dataIndex: "pendingDeposit",
//       key: "pendingDeposit",
//       align: "center",
//       width: 70,
//       render: (amount) => (
//         <div className="font-semibold text-red-600">
//           {amount ? `₹ ${amount.toLocaleString()}` : "-"}
//         </div>
//       ),
//     },
//   ];

//   // Combine columns based on type
//   const columns =
//     type === "pending"
//       ? [...baseColumns, ...pendingColumns]
//       : type === "refunded"
//       ? [...baseColumns, ...refundedColumns]
//       : [...baseColumns, ...receivedColumns];

//   return (
//     <Table
//       columns={columns}
//       dataSource={data.map((item) => ({...item, key: item._id}))}
//       loading={loading}
//       scroll={{x: 1300}}
//       pagination={{
//         current: pagination.current,
//         pageSize: pagination.pageSize,
//         total: pagination.total,
//         showSizeChanger: true,
//         showQuickJumper: true,
//         showTotal: (total, range) =>
//           `${range[0]}-${range[1]} of ${total} items`,
//         pageSizeOptions: ["10", "20", "50", "100"],
//       }}
//       onChange={onTableChange}
//     />
//   );
// };

// export default DepositTransactionsTable;
import {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {Table, Tag, Tooltip, Spin} from "antd";

const DepositTransactionsTable = ({
  data,
  loading,
  pagination,
  total,
  onPaginationChange,
  type = "received",
}) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef(null);

  // Safe defaults for pagination
  const safePagination = pagination || {page: 1, limit: 10};
  const safeTotal = total || 0;

  // Reset and update transactions when data or pagination changes
  useEffect(() => {
    if (safePagination.page === 1) {
      setAllTransactions(data || []);
    } else {
      setAllTransactions((prev) => [...prev, ...(data || [])]);
    }
  }, [data, safePagination.page]);

  // Calculate hasMore based on current state
  useEffect(() => {
    const totalLoaded = allTransactions.length;
    setHasMore(totalLoaded < safeTotal);
  }, [allTransactions.length, safeTotal]);

  // Handle window scroll event for infinite scroll
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when 80% scrolled
    if (scrollTop + windowHeight >= documentHeight * 0.8) {
      loadMoreData();
    }
  }, [loadingMore, hasMore, loading]);

  const loadMoreData = () => {
    if (!hasMore) return;

    setLoadingMore(true);
    const nextPage = safePagination.page + 1;

    if (onPaginationChange) {
      onPaginationChange({
        page: nextPage,
        limit: safePagination.limit,
      });
    }

    setTimeout(() => setLoadingMore(false), 500);
  };

  // Add scroll event listener to window
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Base columns that are common for both types
  const baseColumns = [
    {
      title: "#",
      key: "serial",
      fixed: "left",
      align: "center",
      width: 40,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 60,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="font-medium">{text}</span>
        </Tooltip>
      ),
    },
  ];

  // Columns specific to "received" type
  const receivedColumns = [
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      align: "center",
      width: 60,
      render: (userType) => {
        const typeConfig = {
          student: {color: "blue", label: "Student"},
          worker: {color: "green", label: "Worker"},
          professional: {color: "purple", label: "Professional"},
          other: {color: "default", label: "Other"},
        };

        const config = typeConfig[userType?.toLowerCase()] || {
          color: "default",
          label: userType || "N/A",
        };

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Deposit",
      key: "totalDeposit",
      align: "center",
      width: 60,
      render: (_, record) => {
        const refundable = record?.refundableDeposit || 0;
        const nonRefundable = record?.nonRefundableDeposit || 0;
        const total = refundable + nonRefundable;
        return total > 0 ? (
          <div className="font-semibold">₹ {total.toLocaleString()}</div>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      width: 60,
      render: (method) => {
        const methodConfig = {
          Cash: {color: "green"},
          UPI: {color: "volcano"},
          Razorpay: {color: "blue"},
          "Bank Transfer": {color: "cyan"},
          Card: {color: "gold"},
          "Petty Cash": {color: "magenta"},
          Other: {color: "default"},
        };
        const config = methodConfig[method] || {color: "default"};
        return <Tag color={config.color}>{method || "N/A"}</Tag>;
      },
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      align: "center",
      width: 60,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Transaction Details",
      dataIndex: "transactionId",
      key: "transactionId",
      align: "center",
      width: 60,
      render: (_, record) => {
        const {transactionId, collectedBy, paymentMethod} = record;

        // Show Transaction ID if exists and not cash
        if (transactionId && paymentMethod !== "Cash") {
          return (
            <Tooltip title={transactionId}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {transactionId.length > 12
                  ? `${transactionId.slice(0, 10)}...`
                  : transactionId}
              </span>
            </Tooltip>
          );
        }

        // Otherwise show Collected By (for Cash or missing transactionId)
        if (collectedBy) {
          return (
            <Tooltip title={`Collected by ${collectedBy}`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                by{" "}
                {collectedBy.length > 10
                  ? `${collectedBy.slice(0, 8)}...`
                  : collectedBy}
              </span>
            </Tooltip>
          );
        }
        return <span className="text-gray-400 text-xs">N/A</span>;
      },
    },
    {
      title: "Receipt No",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
      align: "center",
      width: 80,
      render: (_, record) => {
        const {receiptNumber} = record;

        if (!receiptNumber) {
          return <span className="text-gray-400 text-xs">N/A</span>;
        }

        const shortReceipt = receiptNumber.includes("-")
          ? receiptNumber.split("-").slice(1).join("-")
          : receiptNumber;

        return (
          <Tooltip title={`Receipt No: ${receiptNumber}`}>
            <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 cursor-pointer hover:bg-blue-100">
              {shortReceipt.length > 16
                ? `${shortReceipt.slice(0, 14)}...`
                : shortReceipt}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "center",
      width: 60,
      render: (amount) => (
        <div className="font-semibold text-green-700">
          {amount ? `₹ ${amount.toLocaleString()}` : "-"}
        </div>
      ),
    },
  ];

  // Columns specific to "refunded" type
  const refundedColumns = [
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      align: "center",
      width: 60,
      render: (userType) => {
        const typeConfig = {
          student: {color: "blue", label: "Student"},
          worker: {color: "green", label: "Worker"},
          professional: {color: "purple", label: "Professional"},
          other: {color: "default", label: "Other"},
        };

        const config = typeConfig[userType?.toLowerCase()] || {
          color: "default",
          label: userType || "N/A",
        };

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Deposit",
      key: "totalDeposit",
      align: "center",
      width: 60,
      render: (_, record) => {
        const refundable = record?.refundableDeposit || 0;
        const nonRefundable = record?.nonRefundableDeposit || 0;
        const total = refundable + nonRefundable;
        return total > 0 ? (
          <div className="font-semibold">₹ {total.toLocaleString()}</div>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      width: 60,
      render: (method) => {
        const methodConfig = {
          Cash: {color: "green"},
          UPI: {color: "blue"},
          "Bank Transfer": {color: "purple"},
          Card: {color: "orange"},
          "Petty Cash": {color: "red"},
        };
        const config = methodConfig[method] || {color: "default"};
        return <Tag color={config.color}>{method || "N/A"}</Tag>;
      },
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      align: "center",
      width: 60,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Transaction Details",
      dataIndex: "transactionId",
      key: "transactionId",
      align: "center",
      width: 70,
      render: (_, record) => {
        const {transactionId, handledBy, paymentMethod} = record;

        // Show Transaction ID if exists and not cash
        if (transactionId && paymentMethod !== "Cash") {
          return (
            <Tooltip title={transactionId}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {transactionId.length > 12
                  ? `${transactionId.slice(0, 10)}...`
                  : transactionId}
              </span>
            </Tooltip>
          );
        }

        // Otherwise show Handled By (for Cash or missing transactionId)
        if (handledBy) {
          return (
            <Tooltip title={`Handled by ${handledBy}`}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                by{" "}
                {handledBy.length > 10
                  ? `${handledBy.slice(0, 8)}...`
                  : handledBy}
              </span>
            </Tooltip>
          );
        }
        return <span className="text-gray-400 text-xs">N/A</span>;
      },
    },
    {
      title: "Refund Amount",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "center",
      width: 70,
      render: (amount) => (
        <div className="font-semibold text-orange-600">
          {amount ? `₹ ${amount.toLocaleString()}` : "-"}
        </div>
      ),
    },
  ];

  // Columns specific to "pending" type
  const pendingColumns = [
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      align: "center",
      width: 80,
      render: (contact) => <span>{contact || "-"}</span>,
    },
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      align: "center",
      width: 60,
      render: (userType) => {
        const typeConfig = {
          student: {color: "blue", label: "Student"},
          worker: {color: "green", label: "Worker"},
          professional: {color: "purple", label: "Professional"},
          other: {color: "default", label: "Other"},
        };

        const config = typeConfig[userType?.toLowerCase()] || {
          color: "default",
          label: userType || "N/A",
        };

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Deposit",
      key: "totalDeposit",
      align: "center",
      width: 70,
      render: (_, record) => {
        const total = record?.totalDeposit || 0;
        return total > 0 ? (
          <div className="font-semibold">₹ {total.toLocaleString()}</div>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      align: "center",
      width: 70,
      render: (date) => (
        <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>
      ),
    },
    {
      title: "Last Payment",
      key: "lastPayment",
      align: "center",
      width: 90,
      render: (_, record) => {
        const lastPaidDate = record?.lastPaidDate;
        const amountPaid = record?.amountPaid || 0;

        return (
          <div className="text-center">
            {lastPaidDate ? (
              <>
                <div className="text-sm font-medium">
                  {new Date(lastPaidDate).toLocaleDateString()}
                </div>
                {amountPaid > 0 && (
                  <div className="text-xs text-green-600 font-semibold">
                    ₹ {amountPaid.toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">No payments</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Pending Deposit",
      dataIndex: "pendingDeposit",
      key: "pendingDeposit",
      align: "center",
      width: 70,
      render: (amount) => (
        <div className="font-semibold text-red-600">
          {amount ? `₹ ${amount.toLocaleString()}` : "-"}
        </div>
      ),
    },
  ];

  // Combine columns based on type
  const columns = useMemo(() => {
    if (type === "pending") {
      return [...baseColumns, ...pendingColumns];
    } else if (type === "refunded") {
      return [...baseColumns, ...refundedColumns];
    } else {
      return [...baseColumns, ...receivedColumns];
    }
  }, [type]);

  return (
    <div ref={tableContainerRef}>
      <Table
        columns={columns}
        dataSource={allTransactions.map((item) => ({
          ...item,
          key: item._id,
        }))}
        loading={loading && pagination.page === 1}
        scroll={{x: 1300}}
        pagination={false} // Remove pagination for infinite scroll
      />

      {/* Loading indicator for infinite scroll */}
      {(loadingMore || (loading && safePagination.page > 1)) && (
        <div style={{textAlign: "center", padding: "20px"}}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default DepositTransactionsTable;
