// import {Table, Tag, Typography} from "antd";

// const {Text} = Typography;

// const LedgerTable = ({data, loading, account, onRowClick}) => {
//   console.log(data);

//   // Modern columns for single-row view
//   const modernColumns = [
//     {
//       title: "#",
//       key: "serial",
//       align: "center",
//       fixed: "left",
//       width: 60,
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "Date",
//       dataIndex: "date",
//       key: "date",
//       width: 100,
//       render: (date) => new Date(date).toLocaleDateString("en-IN"),
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       render: (description, record) => (
//         <div style={{fontWeight: "500", marginBottom: "4px"}}>
//           {description}
//         </div>
//       ),
//     },
//     {
//       title: "Type",
//       dataIndex: "referenceType",
//       key: "referenceType",
//       width: 100,
//       render: (ref) => (
//         <Tag color="purple">{ref === "deposits" ? "Deposits" : ref}</Tag>
//       ),
//     },
//     {
//       title: "Credit",
//       key: "credit",
//       width: 140,
//       align: "center",
//       render: (_, record) => {
//         const creditTxn = record.transactions?.find((t) => t.credit > 0);
//         return (
//           <div>
//             {creditTxn ? (
//               <>
//                 <Text strong style={{color: "#52c41a", fontSize: "14px"}}>
//                   ₹
//                   {creditTxn.credit.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                   })}
//                 </Text>
//                 <div
//                   style={{fontSize: "11px", color: "#666", marginTop: "2px"}}
//                 >
//                   {creditTxn.accountId?.name}
//                 </div>
//               </>
//             ) : (
//               <Text type="secondary">—</Text>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       title: "Debit",
//       key: "debit",
//       width: 140,
//       align: "center",
//       render: (_, record) => {
//         const debitTxn = record.transactions?.find((t) => t.debit > 0);
//         return (
//           <div>
//             {debitTxn ? (
//               <>
//                 <Text strong style={{color: "#ff4d4f", fontSize: "14px"}}>
//                   ₹
//                   {debitTxn.debit.toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                   })}
//                 </Text>
//                 <div
//                   style={{fontSize: "11px", color: "#666", marginTop: "2px"}}
//                 >
//                   {debitTxn.accountId?.name}
//                 </div>
//               </>
//             ) : (
//               <Text type="secondary">—</Text>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   // Traditional columns for account-specific view
//   const traditionalColumns = [
//     {
//       title: "#",
//       key: "serial",
//       align: "center",
//       fixed: "left",
//       width: 60,
//       render: (text, record, index) => index + 1,
//     },
//     {
//       title: "Date",
//       dataIndex: "date",
//       key: "date",
//       align: "center",
//       width: 100,
//       render: (date) => new Date(date).toLocaleDateString("en-IN"),
//     },
//     {
//       title: "Particulars",
//       key: "particulars",
//       render: (_, record) => {
//         const selectedAccountId = account?._id;

//         const oppositeAccounts =
//           record.transactions?.filter(
//             (t) => t.accountId?._id !== selectedAccountId
//           ) || [];

//         return (
//           <div
//             style={{
//               display: "flex",
//               gap: "4px",
//               marginTop: "4px",
//               flexWrap: "wrap",
//             }}
//           >
//             {oppositeAccounts.map((t, i) => (
//               <Tag key={i} color="blue" size="small">
//                 {t.accountId?.name}
//               </Tag>
//             ))}
//           </div>
//         );
//       },
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       render: (desc, record) => {
//         return (
//           <Text type="secondary" style={{fontSize: "13px"}}>
//             {desc}
//           </Text>
//         );
//       },
//     },
//     {
//       title: "Type",
//       dataIndex: "referenceType",
//       key: "referenceType",
//       width: 100,
//       align: "center",
//       render: (ref) => {
//         const displayText = ref === "Payments" ? "Fee Payment" : ref;
//         return <Tag color="purple">{displayText}</Tag>;
//       },
//     },
//     {
//       title: "Credit",
//       key: "credit",
//       width: 100,
//       align: "center",
//       render: (_, record) => {
//         const selectedTxn = record.transactions?.find(
//           (t) => t.accountId?._id === account?._id
//         );

//         const amount = selectedTxn?.credit || 0;

//         return amount > 0 ? (
//           <Text strong style={{color: "#52c41a"}}>
//             ₹{amount.toLocaleString("en-IN")}
//           </Text>
//         ) : (
//           <Text type="secondary">—</Text>
//         );
//       },
//     },
//     {
//       title: "Debit",
//       key: "debit",
//       width: 100,
//       align: "center",
//       render: (_, record) => {
//         const selectedTxn = record.transactions?.find(
//           (t) => t.accountId?._id === account?._id
//         );

//         const amount = selectedTxn?.debit || 0;

//         return amount > 0 ? (
//           <Text strong style={{color: "#ff4d4f"}}>
//             ₹{amount.toLocaleString("en-IN")}
//           </Text>
//         ) : (
//           <Text type="secondary">—</Text>
//         );
//       },
//     },

//     // {
//     //   title: "Balance",
//     //   key: "balance",
//     //   width: 120,
//     //   align: "center",
//     //   render: (_, record) => {
//     //     const selectedTxn = record.transactions?.find(
//     //       (t) => t.accountId?._id === account?._id
//     //     );

//     //     const balance = selectedTxn?.balance || 0;

//     //     const displayBalance = Math.abs(balance);

//     //     return <Text strong>₹{displayBalance.toLocaleString("en-IN")}</Text>;
//     //   },
//     // },
//   ];

//   return (
//     <Table
//       columns={account ? traditionalColumns : modernColumns}
//       dataSource={data}
//       loading={loading}
//       pagination={{pageSize: 15, showSizeChanger: true}}
//       size="middle"
//       scroll={{x: 800}}
//       onRow={(record) => ({
//         onClick: () => onRowClick(record),
//         style: {cursor: "pointer"},
//       })}
//     />
//   );
// };

// export default LedgerTable;
import {Table, Tag, Typography} from "antd";
import {useState} from "react";

const {Text} = Typography;

const LedgerTable = ({data, loading, account, onRowClick}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Common serial number render function
  const renderSerialNumber = (text, record, index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  // Modern columns for single-row view
  const modernColumns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      fixed: "left",
      width: 60,
      render: renderSerialNumber,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 100,
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description, record) => (
        <div style={{fontWeight: "500", marginBottom: "4px"}}>
          {description}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "referenceType",
      key: "referenceType",
      width: 100,
      render: (ref) => (
        <Tag color="purple">{ref === "deposits" ? "Deposits" : ref}</Tag>
      ),
    },
    {
      title: "Credit",
      key: "credit",
      width: 140,
      align: "center",
      render: (_, record) => {
        const creditTxn = record.transactions?.find((t) => t.credit > 0);
        return (
          <div>
            {creditTxn ? (
              <>
                <Text strong style={{color: "#52c41a", fontSize: "14px"}}>
                  ₹
                  {creditTxn.credit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <div
                  style={{fontSize: "11px", color: "#666", marginTop: "2px"}}
                >
                  {creditTxn.accountId?.name}
                </div>
              </>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Debit",
      key: "debit",
      width: 140,
      align: "center",
      render: (_, record) => {
        const debitTxn = record.transactions?.find((t) => t.debit > 0);
        return (
          <div>
            {debitTxn ? (
              <>
                <Text strong style={{color: "#ff4d4f", fontSize: "14px"}}>
                  ₹
                  {debitTxn.debit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <div
                  style={{fontSize: "11px", color: "#666", marginTop: "2px"}}
                >
                  {debitTxn.accountId?.name}
                </div>
              </>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </div>
        );
      },
    },
  ];

  // Traditional columns for account-specific view
  const traditionalColumns = [
    {
      title: "#",
      key: "serial",
      align: "center",
      fixed: "left",
      width: 60,
      render: renderSerialNumber,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      width: 100,
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Particulars",
      key: "particulars",
      render: (_, record) => {
        const selectedAccountId = account?._id;

        const oppositeAccounts =
          record.transactions?.filter(
            (t) => t.accountId?._id !== selectedAccountId
          ) || [];

        return (
          <div
            style={{
              display: "flex",
              gap: "4px",
              marginTop: "4px",
              flexWrap: "wrap",
            }}
          >
            {oppositeAccounts.map((t, i) => (
              <Tag key={i} color="blue" size="small">
                {t.accountId?.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc, record) => {
        return (
          <Text type="secondary" style={{fontSize: "13px"}}>
            {desc}
          </Text>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "referenceType",
      key: "referenceType",
      width: 100,
      align: "center",
      render: (ref) => {
        const displayText = ref === "Payments" ? "Fee Payment" : ref;
        return <Tag color="purple">{displayText}</Tag>;
      },
    },
    {
      title: "Credit",
      key: "credit",
      width: 100,
      align: "center",
      render: (_, record) => {
        const selectedTxn = record.transactions?.find(
          (t) => t.accountId?._id === account?._id
        );

        const amount = selectedTxn?.credit || 0;

        return amount > 0 ? (
          <Text strong style={{color: "#52c41a"}}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: "Debit",
      key: "debit",
      width: 100,
      align: "center",
      render: (_, record) => {
        const selectedTxn = record.transactions?.find(
          (t) => t.accountId?._id === account?._id
        );

        const amount = selectedTxn?.debit || 0;

        return amount > 0 ? (
          <Text strong style={{color: "#ff4d4f"}}>
            ₹{amount.toLocaleString("en-IN")}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
  ];

  return (
    <Table
      columns={account ? traditionalColumns : modernColumns}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: pageSize,
        showSizeChanger: false, // Remove page size dropdown
        current: currentPage,
        onChange: (page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        },
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      size="middle"
      scroll={{x: 800}}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: {cursor: "pointer"},
      })}
    />
  );
};

export default LedgerTable;
