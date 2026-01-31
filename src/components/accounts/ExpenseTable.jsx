// import {useState} from "react";
// import {Table, Button, Dropdown, Modal, Image, Tag, Tooltip} from "antd";
// import {
//   FiMoreVertical,
//   FiEdit,
//   FiTrash2,
//   FiFileText,
//   FiExternalLink,
//   FiUpload,
// } from "react-icons/fi";
// import AddExpenseFromVoucher from "../../modals/accounts/AddExpenseFromVoucher";

// const ExpenseTable = ({
//   data,
//   type,
//   loading,
//   pagination,
//   onTableChange,
//   onEdit,
//   onDelete,
// }) => {
//   const [previewImage, setPreviewImage] = useState("");
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
//   const [selectedExpenseType, setSelectedExpenseType] = useState("");
//   const [voucherId, setVoucherId] = useState(null);

//   const handleImagePreview = (imageUrl) => {
//     if (imageUrl) {
//       setPreviewImage(imageUrl);
//       setIsModalVisible(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalVisible(false);
//     setPreviewImage("");
//   };

//   const handleCreateExpense = (record, type) => {
//     setSelectedExpenseType(type);
//     setVoucherId(record._id);
//     setIsExpenseModalOpen(true);
//   };

//   const handleExpenseModalClose = () => {
//     setIsExpenseModalOpen(false);
//     setSelectedExpenseType("");
//   };

//   const getColumns = () => {
//     const baseColumns = {
//       expenses: [
//         {
//           title: "#",
//           key: "serial",
//           align: "center",
//           fixed: "left",
//           width: 60,
//           render: (text, record, index) => {
//             return (pagination.current - 1) * pagination.pageSize + index + 1;
//           },
//         },
//         {
//           title: "Title",
//           dataIndex: "title",
//           key: "title",
//           width: 150,
//           ellipsis: true,
//           render: (text) => (
//             <Tooltip title={text}>
//               <span className="font-medium">{text}</span>
//             </Tooltip>
//           ),
//         },
//         {
//           title: "Type",
//           dataIndex: "type",
//           key: "type",
//           align: "center",
//           width: 100,
//           render: (type) => {
//             const typeConfig = {
//               PG: {color: "blue", label: "PG"},
//               Mess: {color: "green", label: "Mess"},
//               Others: {color: "orange", label: "Others"},
//             };
//             const config = typeConfig[type] || {
//               color: "default",
//               label: type,
//             };
//             return <Tag color={config.color}>{config.label}</Tag>;
//           },
//         },
//         {
//           title: "Category",
//           dataIndex: "category",
//           key: "category",
//           align: "center",
//           width: 120,
//         },
//         {
//           title: "Amount",
//           dataIndex: "amount",
//           key: "amount",
//           align: "center",
//           width: 120,
//           render: (amount) => (
//             <div className="font-semibold text-red-600">
//               ₹ {amount?.toLocaleString()}
//             </div>
//           ),
//         },
//         {
//           title: "Date",
//           dataIndex: "date",
//           key: "date",
//           align: "center",
//           width: 110,
//           render: (date) => new Date(date).toLocaleDateString("en-IN"),
//         },
//         {
//           title: "Transaction ID",
//           dataIndex: "transactionId",
//           key: "transactionId",
//           align: "center",
//           width: 140,
//           render: (id) =>
//             id ? (
//               <Tooltip title={id}>
//                 <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                   {id.length > 15 ? `${id.slice(0, 12)}...` : id}
//                 </span>
//               </Tooltip>
//             ) : (
//               <span className="text-gray-400">N/A</span>
//             ),
//         },
//         {
//           title: "Payment Method",
//           dataIndex: "paymentMethod",
//           key: "paymentMethod",
//           align: "center",
//           width: 130,
//           render: (method) => {
//             const methodConfig = {
//               Cash: {color: "green"},
//               UPI: {color: "blue"},
//               "Bank Transfer": {color: "purple"},
//               Card: {color: "orange"},
//               "Petty Cash": {color: "red"},
//             };
//             const config = methodConfig[method] || {color: "default"};
//             return <Tag color={config.color}>{method}</Tag>;
//           },
//         },
//         {
//           title: "Bill",
//           dataIndex: "imageUrl",
//           key: "imageUrl",
//           align: "center",
//           width: 100,
//           render: (imageUrl, record) => {
//             if (!imageUrl) {
//               return <span className="text-gray-400 text-sm">No Bill</span>;
//             }

//             return (
//               <div className="flex justify-center">
//                 <Tooltip title="Click to view bill">
//                   <Button
//                     type="link"
//                     icon={<FiExternalLink />}
//                     onClick={() => handleImagePreview(imageUrl)}
//                     className="flex items-center gap-1 text-blue-600"
//                     size="small"
//                   >
//                     View Bill
//                   </Button>
//                 </Tooltip>
//               </div>
//             );
//           },
//         },
//       ],
//       waiveoffs: [
//         {
//           title: "#",
//           key: "serial",
//           align: "center",
//           fixed: "left",
//           width: 60,
//           render: (text, record, index) => {
//             return (pagination.current - 1) * pagination.pageSize + index + 1;
//           },
//         },
//         {
//           title: "Name",
//           dataIndex: "name",
//           key: "name",
//           width: 150,
//           render: (name, record) => (
//             <span className="font-medium">{name || record.name || "N/A"}</span>
//           ),
//         },
//         {
//           title: "User Type",
//           dataIndex: "userType",
//           key: "userType",
//           align: "center",
//           width: 100,
//           render: (userType) => {
//             const typeConfig = {
//               student: {color: "blue", label: "Student"},
//               worker: {color: "green", label: "Worker"},
//               dailyRent: {color: "purple", label: "Daily Rent"},
//               messOnly: {color: "orange", label: "Mess Only"},
//             };

//             const config = typeConfig[userType?.toLowerCase()] || {
//               color: "default",
//               label: userType || "N/A",
//             };

//             return <Tag color={config.color}>{config.label}</Tag>;
//           },
//         },
//         {
//           title: "Wave-Off Amount",
//           dataIndex: "waveOffAmount",
//           key: "waveOffAmount",
//           align: "center",
//           width: 130,
//           render: (amount) => (
//             <div className="font-semibold text-red-600">
//               ₹ {amount?.toLocaleString() || 0}
//             </div>
//           ),
//         },
//         {
//           title: "Date",
//           dataIndex: "paymentDate",
//           key: "paymentDate",
//           align: "center",
//           width: 110,
//           render: (date) =>
//             date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
//         },
//         {
//           title: "Transation ID",
//           dataIndex: "transactionId",
//           key: "transactionId",
//           width: 120,
//           render: (id) => (
//             <Tooltip title={id}>
//               <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                 {id?.slice(-8) || "N/A"}
//               </span>
//             </Tooltip>
//           ),
//         },
//         {
//           title: "Payment Method",
//           dataIndex: "paymentMethod",
//           key: "paymentMethod",
//           align: "center",
//           width: 130,
//           render: (method) => {
//             const methodConfig = {
//               Cash: {color: "green"},
//               UPI: {color: "blue"},
//               "Bank Transfer": {color: "purple"},
//               Card: {color: "orange"},
//               "Petty Cash": {color: "red"},
//             };
//             const config = methodConfig[method] || {color: "default"};
//             return <Tag color={config.color}>{method}</Tag>;
//           },
//         },
//         {
//           title: "Reason",
//           dataIndex: "waveOffReason",
//           key: "waveOffReason",
//           width: 150,
//           align: "center",
//           ellipsis: true,
//           render: (reason) => (
//             <Tooltip title={reason}>
//               <span>{reason || "Not specified"}</span>
//             </Tooltip>
//           ),
//         },
//       ],
//       vouchers: [
//         {
//           title: "#",
//           key: "serial",
//           align: "center",
//           fixed: "left",
//           width: 60,
//           render: (text, record, index) => {
//             return (pagination.current - 1) * pagination.pageSize + index + 1;
//           },
//         },
//         {
//           title: "Recipient Name",
//           dataIndex: "recipientName",
//           key: "recipientName",
//           width: 150,
//           align: "left",
//           render: (user) => (
//             <Tooltip title={user}>
//               <span className="font-medium">{user || "N/A"}</span>
//             </Tooltip>
//           ),
//         },
//         {
//           title: "Purpose",
//           dataIndex: "purpose",
//           key: "purpose",
//           width: 200,
//           align: "center",
//           ellipsis: true,
//           render: (description) => (
//             <Tooltip title={description}>
//               <span>{description || "No description"}</span>
//             </Tooltip>
//           ),
//         },
//         {
//           title: "Voucher Amount",
//           dataIndex: "amount",
//           key: "amount",
//           align: "center",
//           width: 130,
//           render: (amount) => (
//             <div className="font-semibold text-blue-600">
//               ₹ {amount?.toLocaleString() || 0}
//             </div>
//           ),
//         },
//         {
//           title: "Expense Status",
//           key: "expenseStatus",
//           align: "center",
//           width: 240,
//           render: (_, record) => {
//             const used = record.totalExpenseAmount || 0;
//             const total = record.amount || 0;
//             const remaining = Math.max(0, total - used);
//             const isFullyUsed = remaining <= 0;

//             if (isFullyUsed) {
//               return (
//                 <Tag color="green" className="text-xs font-medium">
//                   Completed
//                 </Tag>
//               );
//             }

//             return (
//               <span className="font-medium text-gray-700">
//                 <span className="text-red-600">Used:</span> ₹
//                 {used.toLocaleString()} <span className="text-gray-500">|</span>{" "}
//                 <span className="text-green-600">Remaining:</span> ₹
//                 {remaining.toLocaleString()}
//               </span>
//             );
//           },
//         },
//         {
//           title: "Date",
//           dataIndex: "date",
//           key: "date",
//           align: "center",
//           width: 110,
//           render: (createdAt) =>
//             createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "N/A",
//         },
//         {
//           title: "Action",
//           key: "action",
//           align: "center",
//           width: 140,
//           render: (_, record) => {
//             const totalExpense = record.totalExpenseAmount || 0;
//             const remaining =
//               record.remainingAmount || record.amount - totalExpense;
//             const isFullyUsed = remaining <= 0;

//             if (isFullyUsed) {
//               return (
//                 <Tooltip title="View Expense Details">
//                   <Tag color="green" className="font-medium text-xs">
//                     Fully Utilized
//                   </Tag>
//                 </Tooltip>
//               );
//             }

//             const items = [
//               {
//                 key: "PG",
//                 label: "PG",
//                 onClick: () => handleCreateExpense(record, "PG"),
//               },
//               {
//                 key: "Mess",
//                 label: "Mess",
//                 onClick: () => handleCreateExpense(record, "Mess"),
//               },
//               {
//                 key: "Others",
//                 label: "Others",
//                 onClick: () => handleCreateExpense(record, "Others"),
//               },
//             ];

//             return (
//               <Dropdown menu={{items}} placement="bottom" arrow>
//                 <Button type="primary" danger size="small">
//                   Create Expense <FiUpload />
//                 </Button>
//               </Dropdown>
//             );
//           },
//         },
//       ],

//       commissions: [
//         {
//           title: "#",
//           key: "serial",
//           align: "center",
//           fixed: "left",
//           width: 60,
//           render: (text, record, index) => {
//             return (pagination.current - 1) * pagination.pageSize + index + 1;
//           },
//         },
//         {
//           title: "Agent Name",
//           dataIndex: ["agentName"],
//           key: "agentName",
//           width: 150,
//           render: (agent) => (
//             <Tooltip title={agent}>
//               <span className="font-medium">{agent || "N/A"}</span>
//             </Tooltip>
//           ),
//         },
//         {
//           title: "Agency Name / Contact No.",
//           dataIndex: "agencyName",
//           key: "agencyName",
//           width: 130,
//           align: "center",
//           render: (agencyName, record) => (
//             <span>{agencyName || record.contactNumber || "N/A"}</span>
//           ),
//         },
//         {
//           title: "Commission Amount",
//           dataIndex: "amount",
//           key: "amount",
//           align: "center",
//           width: 130,
//           render: (amount) => (
//             <div className="font-semibold text-red-600">
//               ₹ {amount?.toLocaleString() || 0}
//             </div>
//           ),
//         },
//         {
//           title: "Date",
//           dataIndex: "createdAt",
//           key: "date",
//           align: "center",
//           width: 110,
//           render: (date) =>
//             date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
//         },
//         {
//           title: "Transaction ID",
//           dataIndex: "transactionId",
//           key: "transactionId",
//           align: "center",
//           width: 140,
//           render: (id) =>
//             id ? (
//               <Tooltip title={id}>
//                 <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                   {id.length > 15 ? `${id.slice(0, 12)}...` : id}
//                 </span>
//               </Tooltip>
//             ) : (
//               <span className="text-gray-400">N/A</span>
//             ),
//         },
//         {
//           title: "Payment Method",
//           dataIndex: "paymentType",
//           key: "paymentType",
//           align: "center",
//           width: 130,
//           render: (method) => {
//             const methodConfig = {
//               Cash: {color: "green"},
//               UPI: {color: "blue"},
//               "Bank Transfer": {color: "purple"},
//               Card: {color: "orange"},
//               "Petty Cash": {color: "red"},
//             };
//             const config = methodConfig[method] || {color: "default"};
//             return <Tag color={config.color}>{method}</Tag>;
//           },
//         },
//       ],
//       salary: [
//         {
//           title: "#",
//           key: "serial",
//           align: "center",
//           fixed: "left",
//           width: 60,
//           render: (text, record, index) => {
//             return (pagination.current - 1) * pagination.pageSize + index + 1;
//           },
//         },
//         {
//           title: "Staff Name",
//           dataIndex: "employeeName",
//           key: "employeeName",
//           width: 150,
//           render: (employeeName) => (
//             <span className="font-medium">{employeeName || "N/A"}</span>
//           ),
//         },
//         {
//           title: "Employee Type",
//           dataIndex: "employeeType",
//           key: "employeeType",
//           width: 120,
//           align: "center",
//           render: (method) => {
//             const methodConfig = {
//               Staff: {color: "blue"},
//               Manager: {color: "purple"},
//             };
//             const config = methodConfig[method] || {color: "default"};
//             return <Tag color={config.color}>{method}</Tag>;
//           },
//         },

//         {
//           title: "Salary Amount",
//           dataIndex: "salary",
//           key: "salary",
//           align: "center",
//           width: 130,
//           render: (salary) => (
//             <div className="font-semibold">
//               {salary ? `₹ ${salary.toLocaleString()}` : "-"}
//             </div>
//           ),
//         },
//         {
//           title: "Salary Paid",
//           dataIndex: "paidAmount",
//           key: "paidAmount",
//           align: "center",
//           width: 130,
//           render: (paidAmount) => (
//             <div className="font-semibold text-red-600">
//               ₹ {paidAmount?.toLocaleString() || 0}
//             </div>
//           ),
//         },
//         {
//           title: "Payment Date",
//           dataIndex: "date",
//           key: "date",
//           align: "center",
//           width: 110,
//           render: (date) =>
//             date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
//         },
//         {
//           title: "Transaction ID",
//           dataIndex: "transactionId",
//           key: "transactionId",
//           align: "center",
//           width: 140,
//           render: (id) =>
//             id ? (
//               <Tooltip title={id}>
//                 <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
//                   {id.length > 15 ? `${id.slice(0, 12)}...` : id}
//                 </span>
//               </Tooltip>
//             ) : (
//               <span className="text-gray-400">N/A</span>
//             ),
//         },
//         {
//           title: "Payment Method",
//           dataIndex: "paymentMethod",
//           key: "paymentMethod",
//           align: "center",
//           width: 130,
//           render: (method) => {
//             const methodConfig = {
//               "Cash": {color: "green"},
//               "UPI": {color: "blue"},
//               "Bank Transfer": {color: "purple"},
//               // Card: {color: "orange"},
//               "Petty Cash": {color: "red"},
//             };
//             const config = methodConfig[method] || {color: "default"};
//             return <Tag color={config.color}>{method}</Tag>;
//           },
//         },
//         {
//           title: "Remark",
//           dataIndex: "remarkType",
//           key: "remarkType",
//           width: 120,
//           align: "center",
//           render: (value) => {
//             if (!value) return "-";
//             if (value === "MANUAL_ADDITION") return "Manual Addition";
//             return value
//               .toLowerCase()
//               .split("_")
//               .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//               .join(" ");
//           },
//         },
//       ],
//     };

//     // Add action column to all types
//     const actionColumn = {
//       title: "Actions",
//       key: "actions",
//       width: 80,
//       align: "center",
//       render: (_, record) => (
//         <Dropdown
//           menu={{
//             items: [
//               {
//                 key: "edit",
//                 label: "Edit",
//                 icon: <FiEdit />,
//                 onClick: () => onEdit?.(record),
//               },
//               {
//                 key: "delete",
//                 label: "Delete",
//                 icon: <FiTrash2 />,
//                 danger: true,
//                 onClick: () => onDelete?.(record),
//               },
//             ],
//           }}
//           trigger={["hover"]}
//           placement="bottomRight"
//         >
//           <Button type="text" icon={<FiMoreVertical />} />
//         </Dropdown>
//       ),
//     };
//     if (
//       type === "waiveoffs" ||
//       type === "vouchers" ||
//       type === "commissions" ||
//       type === "salary"
//     ) {
//       return baseColumns[type] || [];
//     }

//     return [...(baseColumns[type] || []), actionColumn];
//   };

//   return (
//     <>
//       <Table
//         columns={getColumns()}
//         dataSource={data.map((item) => ({...item, key: item._id}))}
//         loading={loading}
//         scroll={{x: 1300}}
//         pagination={{
//           current: pagination.current,
//           pageSize: pagination.pageSize,
//           total: pagination.total,
//           showSizeChanger: true,
//           showQuickJumper: true,
//           showTotal: (total, range) =>
//             `${range[0]}-${range[1]} of ${total} items`,
//           pageSizeOptions: ["10", "20", "50", "100"],
//         }}
//         onChange={onTableChange}
//       />

//       {/* Image Preview Modal */}
//       <Modal
//         title="Bill Receipt Preview"
//         open={isModalVisible}
//         onCancel={handleCloseModal}
//         footer={[
//           <Button key="close" onClick={handleCloseModal}>
//             Close
//           </Button>,
//           previewImage && (
//             <Button
//               key="download"
//               type="primary"
//               onClick={() => window.open(previewImage, "_blank")}
//             >
//               Open Original
//             </Button>
//           ),
//         ]}
//         width={800}
//         centered
//       >
//         <div className="flex justify-center">
//           {previewImage ? (
//             <Image
//               src={previewImage}
//               alt="Bill Receipt"
//               style={{maxHeight: "60vh", objectFit: "contain"}}
//               preview={{
//                 visible: false,
//               }}
//             />
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               <FiFileText className="text-4xl mx-auto mb-2" />
//               <div>No bill image available</div>
//             </div>
//           )}
//         </div>
//       </Modal>

//       <AddExpenseFromVoucher
//         visible={isExpenseModalOpen}
//         onCancel={handleExpenseModalClose}
//         selectedCategory={selectedExpenseType}
//         voucherId={voucherId}
//       />
//     </>
//   );
// };

// export default ExpenseTable;
import {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {
  Table,
  Button,
  Dropdown,
  Modal,
  Image,
  Tag,
  Tooltip,
  Spin,
  message,
  Popconfirm,
} from "antd";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiExternalLink,
  FiUpload,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import AddExpenseFromVoucher from "../../modals/accounts/AddExpenseFromVoucher";
import {updateSalaryStatus} from "../../hooks/accounts/useAccounts";

const ExpenseTable = ({
  data,
  type,
  loading,
  pagination,
  total,
  onPaginationChange,
  // onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [allExpenses, setAllExpenses] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState("");
  const [voucherId, setVoucherId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const tableContainerRef = useRef(null);
  const queryClient = useQueryClient();

  // Safe defaults for pagination
  const safePagination = pagination || {page: 1, limit: 10};
  const safeTotal = total || 0;

  // Reset and update expenses when data or pagination changes
  useEffect(() => {
    if (safePagination.page === 1) {
      setAllExpenses(data || []);
    } else {
      setAllExpenses((prev) => [...prev, ...(data || [])]);
    }
  }, [data, safePagination.page]);

  // Calculate hasMore based on current state
  useEffect(() => {
    const totalLoaded = allExpenses.length;
    setHasMore(totalLoaded < safeTotal);
  }, [allExpenses.length, safeTotal]);

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

  const handleImagePreview = (imageUrl) => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setPreviewImage("");
  };

  const handleCreateExpense = (record, type) => {
    setSelectedExpenseType(type);
    setVoucherId(record._id);
    setIsExpenseModalOpen(true);
  };

  const handleExpenseModalClose = () => {
    setIsExpenseModalOpen(false);
    setSelectedExpenseType("");
  };

  // Optimistically update local state
  const updateLocalExpenseStatus = (recordId, newStatus) => {
    setAllExpenses((prev) =>
      prev.map((expense) =>
        expense._id === recordId
          ? {
              ...expense,
              status: newStatus,
              ...(newStatus === "paid" && {
                paidAmount: expense.salary,
                paymentDate: new Date().toISOString(),
              }),
            }
          : expense
      )
    );
  };

  // TanStack Query v5 mutation for status change with optimistic updates
  const statusUpdateMutation = useMutation({
    mutationFn: ({recordId, updateData}) =>
      updateSalaryStatus(recordId, updateData),
    onMutate: async (variables) => {
      const {recordId, newStatus, record} = variables;

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({queryKey: ["salaries"]});

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData(["salaries"]);

      // Optimistically update the local state immediately
      updateLocalExpenseStatus(recordId, newStatus);
      setUpdatingStatus((prev) => ({...prev, [recordId]: true}));

      // Return context with the snapshotted value
      return {previousExpenses};
    },
    onSuccess: (result, variables, context) => {
      const {record, newStatus} = variables;
      message.success(`Salary status updated to ${newStatus} successfully`);

      if (onStatusChange) {
        onStatusChange(record, newStatus, result);
      }
    },
    onError: (error, variables, context) => {
      const {recordId, previousStatus} = variables;

      // Rollback to the previous state if the mutation failed
      if (context?.previousExpenses) {
        queryClient.setQueryData(["salaries"], context.previousExpenses);
      }

      // Also rollback local state
      setAllExpenses((prev) =>
        prev.map((expense) =>
          expense._id === recordId
            ? {...expense, status: previousStatus}
            : expense
        )
      );

      console.error("Failed to update salary status:", error);
      message.error(error.message || "Failed to update salary status");
    },
    onSettled: (data, error, variables, context) => {
      const {recordId} = variables;

      // Remove loading state
      setUpdatingStatus((prev) => ({...prev, [recordId]: false}));

      // Always refetch after error or success to ensure we're in sync with server
      queryClient.invalidateQueries({queryKey: ["salaries"]});
    },
  });

  // Handle status change using the mutation
  const handleStatusChange = async (record, newStatus) => {
    const previousStatus = record.status || "pending";

    const updateData = {
      status: newStatus,
      ...(newStatus === "paid" && {
        paidAmount: record.salary,
        paymentMethod: record.paymentMethod || "Cash",
        paymentDate: new Date().toISOString(),
      }),
    };

    statusUpdateMutation.mutate({
      recordId: record._id,
      updateData,
      newStatus,
      record,
      previousStatus, // Store previous status for rollback
    });
  };

  const getStatusDropdownItems = (record) => {
    const currentStatus = record.status || "pending";
    const isUpdating = updatingStatus[record._id];

    return [
      {
        key: "paid",
        label: (
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-green-600" />
            <span>Mark as Paid</span>
            {isUpdating && currentStatus === "pending" && <Spin size="small" />}
          </div>
        ),
        disabled: currentStatus === "paid" || isUpdating,
        onClick: () => handleStatusChange(record, "paid"),
      },
      {
        key: "pending",
        label: (
          <div className="flex items-center gap-2">
            <FiClock className="text-orange-600" />
            <span>Mark as Pending</span>
            {isUpdating && currentStatus === "paid" && <Spin size="small" />}
          </div>
        ),
        disabled: currentStatus === "pending" || isUpdating,
        onClick: () => handleStatusChange(record, "pending"),
      },
    ];
  };

  const getColumns = () => {
    const baseColumns = {
      expenses: [
        {
          title: "#",
          key: "serial",
          align: "center",
          fixed: "left",
          width: 60,
          render: (text, record, index) => index + 1,
        },
        {
          title: "Title",
          dataIndex: "title",
          key: "title",
          width: 150,
          ellipsis: true,
          render: (text) => (
            <Tooltip title={text}>
              <span className="font-medium">{text}</span>
            </Tooltip>
          ),
        },
        {
          title: "Type",
          dataIndex: "type",
          key: "type",
          align: "center",
          width: 100,
          render: (type) => {
            const typeConfig = {
              PG: {color: "blue", label: "PG"},
              Mess: {color: "green", label: "Mess"},
              Others: {color: "orange", label: "Others"},
            };
            const config = typeConfig[type] || {
              color: "default",
              label: type,
            };
            return <Tag color={config.color}>{config.label}</Tag>;
          },
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
          align: "center",
          width: 120,
        },
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
          align: "center",
          width: 120,
          render: (amount) => (
            <div className="font-semibold text-red-600">
              ₹ {amount?.toLocaleString()}
            </div>
          ),
        },
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          align: "center",
          width: 110,
          render: (date) =>
            date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
        },
        {
          title: "Transaction ID",
          dataIndex: "transactionId",
          key: "transactionId",
          align: "center",
          width: 140,
          render: (id) =>
            id ? (
              <Tooltip title={id}>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {id.length > 15 ? `${id.slice(0, 12)}...` : id}
                </span>
              </Tooltip>
            ) : (
              <span className="text-gray-400">N/A</span>
            ),
        },
        {
          title: "Payment Method",
          dataIndex: "paymentMethod",
          key: "paymentMethod",
          align: "center",
          width: 130,
          render: (method) => {
            const methodConfig = {
              Cash: {color: "green"},
              UPI: {color: "blue"},
              "Bank Transfer": {color: "purple"},
              Card: {color: "orange"},
              "Petty Cash": {color: "red"},
            };
            const config = methodConfig[method] || {color: "default"};
            return <Tag color={config.color}>{method}</Tag>;
          },
        },
        {
          title: "Bill",
          dataIndex: "imageUrl",
          key: "imageUrl",
          align: "center",
          width: 100,
          render: (imageUrl, record) => {
            if (!imageUrl) {
              return <span className="text-gray-400 text-sm">No Bill</span>;
            }

            return (
              <div className="flex justify-center">
                <Tooltip title="Click to view bill">
                  <Button
                    type="link"
                    icon={<FiExternalLink />}
                    onClick={() => handleImagePreview(imageUrl)}
                    className="flex items-center gap-1 text-blue-600"
                    size="small"
                  >
                    View Bill
                  </Button>
                </Tooltip>
              </div>
            );
          },
        },
      ],
      waiveoffs: [
        {
          title: "#",
          key: "serial",
          align: "center",
          fixed: "left",
          width: 60,
          render: (text, record, index) => index + 1,
        },
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          width: 150,
          render: (name, record) => (
            <span className="font-medium">{name || record.name || "N/A"}</span>
          ),
        },
        {
          title: "User Type",
          dataIndex: "userType",
          key: "userType",
          align: "center",
          width: 100,
          render: (userType) => {
            const typeConfig = {
              student: {color: "blue", label: "Student"},
              worker: {color: "green", label: "Worker"},
              dailyRent: {color: "purple", label: "Daily Rent"},
              messOnly: {color: "orange", label: "Mess Only"},
            };

            const config = typeConfig[userType?.toLowerCase()] || {
              color: "default",
              label: userType || "N/A",
            };

            return <Tag color={config.color}>{config.label}</Tag>;
          },
        },
        {
          title: "Wave-Off Amount",
          dataIndex: "waveOffAmount",
          key: "waveOffAmount",
          align: "center",
          width: 130,
          render: (amount) => (
            <div className="font-semibold text-red-600">
              ₹ {amount?.toLocaleString() || 0}
            </div>
          ),
        },
        {
          title: "Date",
          dataIndex: "paymentDate",
          key: "paymentDate",
          align: "center",
          width: 110,
          render: (date) =>
            date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
        },
        {
          title: "Transaction ID",
          dataIndex: "transactionId",
          key: "transactionId",
          width: 120,
          render: (id) => (
            <Tooltip title={id}>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {id?.slice(-8) || "N/A"}
              </span>
            </Tooltip>
          ),
        },
        {
          title: "Payment Method",
          dataIndex: "paymentMethod",
          key: "paymentMethod",
          align: "center",
          width: 130,
          render: (method) => {
            const methodConfig = {
              Cash: {color: "green"},
              UPI: {color: "blue"},
              "Bank Transfer": {color: "purple"},
              Card: {color: "orange"},
              "Petty Cash": {color: "red"},
            };
            const config = methodConfig[method] || {color: "default"};
            return <Tag color={config.color}>{method}</Tag>;
          },
        },
        {
          title: "Reason",
          dataIndex: "waveOffReason",
          key: "waveOffReason",
          width: 150,
          align: "center",
          ellipsis: true,
          render: (reason) => (
            <Tooltip title={reason}>
              <span>{reason || "Not specified"}</span>
            </Tooltip>
          ),
        },
      ],
      vouchers: [
        {
          title: "#",
          key: "serial",
          align: "center",
          fixed: "left",
          width: 60,
          render: (text, record, index) => index + 1,
        },
        {
          title: "Recipient Name",
          dataIndex: "recipientName",
          key: "recipientName",
          width: 150,
          align: "left",
          render: (user) => (
            <Tooltip title={user}>
              <span className="font-medium">{user || "N/A"}</span>
            </Tooltip>
          ),
        },
        {
          title: "Purpose",
          dataIndex: "purpose",
          key: "purpose",
          width: 200,
          align: "center",
          ellipsis: true,
          render: (description) => (
            <Tooltip title={description}>
              <span>{description || "No description"}</span>
            </Tooltip>
          ),
        },
        {
          title: "Voucher Amount",
          dataIndex: "amount",
          key: "amount",
          align: "center",
          width: 130,
          render: (amount) => (
            <div className="font-semibold text-blue-600">
              ₹ {amount?.toLocaleString() || 0}
            </div>
          ),
        },
        {
          title: "Expense Status",
          key: "expenseStatus",
          align: "center",
          width: 240,
          render: (_, record) => {
            const used = record.totalExpenseAmount || 0;
            const total = record.amount || 0;
            const remaining = Math.max(0, total - used);
            const isFullyUsed = remaining <= 0;

            if (isFullyUsed) {
              return (
                <Tag color="green" className="text-xs font-medium">
                  Completed
                </Tag>
              );
            }

            return (
              <span className="font-medium text-gray-700">
                <span className="text-red-600">Used:</span> ₹
                {used.toLocaleString()} <span className="text-gray-500">|</span>{" "}
                <span className="text-green-600">Remaining:</span> ₹
                {remaining.toLocaleString()}
              </span>
            );
          },
        },
        {
          title: "Date",
          dataIndex: "date",
          key: "date",
          align: "center",
          width: 110,
          render: (createdAt) =>
            createdAt ? new Date(createdAt).toLocaleDateString("en-IN") : "N/A",
        },
        {
          title: "Action",
          key: "action",
          align: "center",
          width: 140,
          render: (_, record) => {
            const totalExpense = record.totalExpenseAmount || 0;
            const remaining =
              record.remainingAmount || record.amount - totalExpense;
            const isFullyUsed = remaining <= 0;

            if (isFullyUsed) {
              return (
                <Tooltip title="View Expense Details">
                  <Tag color="green" className="font-medium text-xs">
                    Fully Utilized
                  </Tag>
                </Tooltip>
              );
            }

            const items = [
              {
                key: "PG",
                label: "PG",
                onClick: () => handleCreateExpense(record, "PG"),
              },
              {
                key: "Mess",
                label: "Mess",
                onClick: () => handleCreateExpense(record, "Mess"),
              },
              {
                key: "Others",
                label: "Others",
                onClick: () => handleCreateExpense(record, "Others"),
              },
            ];

            return (
              <Dropdown menu={{items}} placement="bottom" arrow>
                <Button type="primary" danger size="small">
                  Create Expense <FiUpload />
                </Button>
              </Dropdown>
            );
          },
        },
      ],

      commissions: [
        {
          title: "#",
          key: "serial",
          align: "center",
          fixed: "left",
          width: 60,
          render: (text, record, index) => index + 1,
        },
        {
          title: "Agent Name",
          dataIndex: ["agentName"],
          key: "agentName",
          width: 150,
          render: (agent) => (
            <Tooltip title={agent}>
              <span className="font-medium">{agent || "N/A"}</span>
            </Tooltip>
          ),
        },
        {
          title: "Agency Name / Contact No.",
          dataIndex: "agencyName",
          key: "agencyName",
          width: 130,
          align: "center",
          render: (agencyName, record) => (
            <span>{agencyName || record.contactNumber || "N/A"}</span>
          ),
        },
        {
          title: "Commission Amount",
          dataIndex: "amount",
          key: "amount",
          align: "center",
          width: 130,
          render: (amount) => (
            <div className="font-semibold text-red-600">
              ₹ {amount?.toLocaleString() || 0}
            </div>
          ),
        },
        {
          title: "Date",
          dataIndex: "createdAt",
          key: "date",
          align: "center",
          width: 110,
          render: (date) =>
            date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
        },
        {
          title: "Transaction ID",
          dataIndex: "transactionId",
          key: "transactionId",
          align: "center",
          width: 140,
          render: (id) =>
            id ? (
              <Tooltip title={id}>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {id.length > 15 ? `${id.slice(0, 12)}...` : id}
                </span>
              </Tooltip>
            ) : (
              <span className="text-gray-400">N/A</span>
            ),
        },
        {
          title: "Payment Method",
          dataIndex: "paymentType",
          key: "paymentType",
          align: "center",
          width: 130,
          render: (method) => {
            const methodConfig = {
              Cash: {color: "green"},
              UPI: {color: "blue"},
              "Bank Transfer": {color: "purple"},
              Card: {color: "orange"},
              "Petty Cash": {color: "red"},
            };
            const config = methodConfig[method] || {color: "default"};
            return <Tag color={config.color}>{method}</Tag>;
          },
        },
      ],
      salary: [
        {
          title: "#",
          key: "serial",
          align: "center",
          fixed: "left",
          width: 60,
          render: (text, record, index) => index + 1,
        },
        {
          title: "Staff Name",
          dataIndex: "employeeName",
          key: "employeeName",
          width: 150,
          render: (employeeName) => (
            <span className="font-medium">{employeeName || "N/A"}</span>
          ),
        },
        {
          title: "Employee Type",
          dataIndex: "employeeType",
          key: "employeeType",
          width: 120,
          align: "center",
          render: (method) => {
            const methodConfig = {
              Staff: {color: "blue"},
              Manager: {color: "purple"},
            };
            const config = methodConfig[method] || {color: "default"};
            return <Tag color={config.color}>{method}</Tag>;
          },
        },
        {
          title: "Salary Amount",
          dataIndex: "salary",
          key: "salary",
          align: "center",
          width: 130,
          render: (salary) => (
            <div className="font-semibold">
              {salary ? `₹ ${salary.toLocaleString()}` : "-"}
            </div>
          ),
        },
        {
          title: "Salary Paid",
          dataIndex: "paidAmount",
          key: "paidAmount",
          align: "center",
          width: 130,
          render: (paidAmount) => (
            <div className="font-semibold text-red-600">
              ₹ {paidAmount?.toLocaleString() || 0}
            </div>
          ),
        },
        {
          title: "Payment Date",
          dataIndex: "date",
          key: "date",
          align: "center",
          width: 110,
          render: (date) =>
            date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
        },
        {
          title: "Transaction ID",
          dataIndex: "transactionId",
          key: "transactionId",
          align: "center",
          width: 140,
          render: (id) =>
            id ? (
              <Tooltip title={id}>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {id.length > 15 ? `${id.slice(0, 12)}...` : id}
                </span>
              </Tooltip>
            ) : (
              <span className="text-gray-400">N/A</span>
            ),
        },
        {
          title: "Payment Method",
          dataIndex: "paymentMethod",
          key: "paymentMethod",
          align: "center",
          width: 130,
          render: (method) => {
            const methodConfig = {
              Cash: {color: "green"},
              UPI: {color: "blue"},
              "Bank Transfer": {color: "purple"},
              "Petty Cash": {color: "red"},
            };
            const config = methodConfig[method] || {color: "default"};
            return <Tag color={config.color}>{method}</Tag>;
          },
        },
        {
          title: "Payment Status",
          dataIndex: "status",
          key: "status",
          align: "center",
          width: 130,
          render: (status, record) => {
            const isUpdating = updatingStatus[record._id];
            const statusConfig = {
              paid: {color: "green"},
              pending: {color: "orange"},
            };

            const safeStatus = status || "pending";
            const config = statusConfig[safeStatus] || {
              color: "default",
              icon: null,
            };

            return (
              <Dropdown
                menu={{items: getStatusDropdownItems(record)}}
                trigger={["click"]}
                disabled={isUpdating}
                placement="bottomRight"
              >
                <Button type="text" className="p-0 h-auto" loading={isUpdating}>
                  <Tag
                    color={config.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                    style={{margin: 0}}
                  >
                    {config.icon}
                    {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
                    {isUpdating && <Spin size="small" className="ml-1" />}
                  </Tag>
                </Button>
              </Dropdown>
            );
          },
        },
        {
          title: "Remark",
          dataIndex: "remarkType",
          key: "remarkType",
          width: 120,
          align: "center",
          render: (value) => {
            if (!value) return "-";
            if (value === "MANUAL_ADDITION") return "Manual Addition";
            return value
              .toLowerCase()
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          },
        },
      ],
    };

    // Add action column to all types except salary (since we have status dropdown)
    // const actionColumn = {
    //   title: "Actions",
    //   key: "actions",
    //   width: 80,
    //   align: "center",
    //   render: (_, record) => (
    //     <Dropdown
    //       menu={{
    //         items: [
    //           {
    //             key: "edit",
    //             label: "Edit",
    //             icon: <FiEdit />,
    //             onClick: () => onEdit?.(record),
    //           },
    //           {
    //             key: "delete",
    //             label: "Delete",
    //             icon: <FiTrash2 />,
    //             danger: true,
    //             onClick: () => onDelete?.(record),
    //           },
    //         ],
    //       }}
    //       trigger={["hover"]}
    //       placement="bottomRight"
    //     >
    //       <Button type="text" icon={<FiMoreVertical />} />
    //     </Dropdown>
    //   ),
    // };
    const actionColumn = {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete expense"
          description="Are you sure you want to delete this expense?"
          okText="Yes"
          cancelText="No"
          okButtonProps={{danger: true}}
          onConfirm={() => onDelete?.(record)}
        >
          <Button type="text" danger icon={<FiTrash2 />} />
        </Popconfirm>
      ),
    };

    // For salary type, don't include the action column as we have status dropdown
    if (type === "salary") {
      return baseColumns[type] || [];
    }

    if (type === "waiveoffs" || type === "vouchers" || type === "commissions") {
      return baseColumns[type] || [];
    }

    return [...(baseColumns[type] || []), actionColumn];
  };

  const columns = useMemo(() => getColumns(), [type, updatingStatus]);

  return (
    <div ref={tableContainerRef}>
      <Table
        columns={columns}
        dataSource={allExpenses.map((item) => ({...item, key: item._id}))}
        loading={loading && safePagination.page === 1}
        scroll={{x: 1300}}
        pagination={false}
      />

      {/* Loading indicator for infinite scroll */}
      {(loadingMore || (loading && safePagination.page > 1)) && (
        <div style={{textAlign: "center", padding: "20px"}}>
          <Spin />
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal
        title="Bill Receipt Preview"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          previewImage && (
            <Button
              key="download"
              type="primary"
              onClick={() => window.open(previewImage, "_blank")}
            >
              Open Original
            </Button>
          ),
        ]}
        width={800}
        centered
      >
        <div className="flex justify-center">
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Bill Receipt"
              style={{maxHeight: "60vh", objectFit: "contain"}}
              preview={{
                visible: false,
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="text-4xl mx-auto mb-2" />
              <div>No bill image available</div>
            </div>
          )}
        </div>
      </Modal>

      <AddExpenseFromVoucher
        visible={isExpenseModalOpen}
        onCancel={handleExpenseModalClose}
        selectedCategory={selectedExpenseType}
        voucherId={voucherId}
      />
    </div>
  );
};

export default ExpenseTable;
