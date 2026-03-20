// import React, { useState } from "react";
// import {
//   Card,
//   Descriptions,
//   Button,
//   Tag,
//   Space,
//   Typography,
//   Badge,
// } from "antd";
// import {
//   CrownOutlined,
//   HistoryOutlined,
//   SafetyCertificateOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";
// import PlanSelectionModal from "../../modals/profile/PlanSelectionModal";
// import PaymentHistoryModal from "../../modals/profile/PaymentHistoryModal";

// const { Title, Text } = Typography;

// const SubscriptionSection = ({ user }) => {
//   const [planModalVisible, setPlanModalVisible] = useState(false);
//   const [historyModalVisible, setHistoryModalVisible] = useState(false);
//   console.log("User subscription data:", user);

//   // Safely extract subscription and license info
//   const subscription = user?.subscription || {};
//   const isPermanent = user?.isLicensePermanent;
//   const licenseNumber = user?.licenseNumber || "Pending";

//   const statusColor = subscription?.status === "active" ? "success" : "error";
//   const endDate = subscription?.endDate
//     ? dayjs(subscription.endDate).format("DD MMM YYYY")
//     : "N/A";

//   return (
//     <>
//       <Card
//         title={
//           <>
//             <CrownOutlined style={{ color: "#d4af37", marginRight: 8 }} />{" "}
//             Subscription & Licensing
//           </>
//         }
//         style={{ marginTop: 24, borderColor: "#e5e7eb" }}
//         extra={
//           <Space>
//             <Button
//               icon={<HistoryOutlined />}
//               onClick={() => setHistoryModalVisible(true)}
//             >
//               Payment History
//             </Button>
//             <Button type="primary" onClick={() => setPlanModalVisible(true)}>
//               Upgrade / Renew
//             </Button>
//           </Space>
//         }
//       >
//         <Descriptions
//           bordered
//           column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
//         >
//           <Descriptions.Item label="License Number">
//             <Space>
//               <Text copyable strong>
//                 {licenseNumber}
//               </Text>
//               <Tag color={isPermanent ? "blue" : "orange"}>
//                 {isPermanent ? "Permanent" : "Temporary"}
//               </Tag>
//             </Space>
//           </Descriptions.Item>

//           <Descriptions.Item label="Subscription Status">
//             <Badge
//               status={statusColor}
//               text={
//                 <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
//                   {subscription?.status || "None"}
//                 </span>
//               }
//             />
//           </Descriptions.Item>

//           <Descriptions.Item label="Current Plan">
//             {subscription?.planId?.name || "No Active Plan"}
//           </Descriptions.Item>

//           <Descriptions.Item label="Valid Until">{endDate}</Descriptions.Item>
//         </Descriptions>
//       </Card>

//       {/* Modals */}
//       <PlanSelectionModal
//         visible={planModalVisible}
//         onClose={() => setPlanModalVisible(false)}
//         clientId={user?._id || user?.id}
//       />
//       <PaymentHistoryModal
//         visible={historyModalVisible}
//         onClose={() => setHistoryModalVisible(false)}
//         clientId={user?._id || user?.id}
//       />
//     </>
//   );
// };

// export default SubscriptionSection;
import React, { useState } from "react";
// 🔹 ADDED DatePicker to imports
import { Card, Descriptions, Button, Tag, Space, Typography, Badge, Table, DatePicker } from "antd"; 
import { CrownOutlined, HistoryOutlined, BarChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import PlanSelectionModal from "../../modals/profile/PlanSelectionModal";
import PaymentHistoryModal from "../../modals/profile/PaymentHistoryModal";
import { getMonthlyOverviews } from "../../hooks/client/useSubscription";

const { Title, Text } = Typography;

const SubscriptionSection = ({ user }) => {
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  
  // 🔹 ADDED: State to track the selected filter date
  const [selectedDate, setSelectedDate] = useState(null);

  const clientId = user?._id || user?.id;

  // 🔹 ADDED: Extract numeric month (1-12) and year for the API
  const filterMonth = selectedDate ? selectedDate.month() + 1 : undefined;
  const filterYear = selectedDate ? selectedDate.year() : undefined;

  // 🔹 CHANGED: Added month/year to queryKey and queryFn
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["monthlyOverview", clientId, filterMonth, filterYear], 
    queryFn: () => getMonthlyOverviews(clientId, filterMonth, filterYear),
    enabled: !!clientId,
  });

  const subscription = user?.subscription || {};
  const statusColor = subscription?.status === "active" ? "success" : subscription?.status === "trial" ? "processing" : "error";
  const endDate = subscription?.endDate ? dayjs(subscription.endDate).format("DD MMM YYYY") : "N/A";

  const overviewColumns = [
    { 
      title: 'Month', 
      key: 'month', 
      render: (_, r) => dayjs(`${r.year}-${r.month}-01`).format('MMMM YYYY') 
    },
    { title: 'Active Users', dataIndex: 'activeUsers', render: val => <Text type="success">{val}</Text> },
    { title: 'Inactive Users', dataIndex: 'inactiveUsers', render: val => <Text type="secondary">{val}</Text> },
    { title: 'Total Beds Capacity', dataIndex: 'totalBeds' },
  ];

  return (
    <>
      <Card 
        title={<><CrownOutlined style={{ color: "#d4af37", marginRight: 8 }}/> Subscription Details</>} 
        style={{ marginTop: 24, borderColor: "#e5e7eb" }}
        extra={
          <Space>
            <Button icon={<HistoryOutlined />} onClick={() => setHistoryModalVisible(true)}>
              Invoices & Bills
            </Button>
            <Button type="primary" onClick={() => setPlanModalVisible(true)}>
              Upgrade / Renew Plan
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="License Number">
            <Space>
              <Text copyable strong>{user?.licenseNumber || "Pending"}</Text>
              <Tag color={user?.isLicensePermanent ? "blue" : "orange"}>
                {user?.isLicensePermanent ? "Permanent" : "Temporary"}
              </Tag>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Status">
            <Badge status={statusColor} text={<span style={{ textTransform: "capitalize", fontWeight: 500 }}>{subscription?.status || "None"}</span>} />
          </Descriptions.Item>
          
          <Descriptions.Item label="Current Plan Type">
            <Tag color="geekblue" style={{ textTransform: "capitalize" }}>
              {subscription?.type || "Standard"}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Valid Until / Next Bill">
            {endDate}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Monthly Overview Table */}
      <Card 
        title={<><BarChartOutlined style={{ color: "#059669", marginRight: 8 }}/> Monthly Usage Overview</>} 
        style={{ marginTop: 24, borderColor: "#e5e7eb" }}
        extra={
          // 🔹 ADDED: The DatePicker filter
          <DatePicker 
            picker="month" 
            placeholder="Filter by Month" 
            onChange={(date) => setSelectedDate(date)}
            allowClear
            style={{ width: 200 }}
          />
        }
      >
        <Table 
          dataSource={overviewData?.data || []} 
          columns={overviewColumns} 
          rowKey={(r) => `${r.year}-${r.month}`}
          loading={isLoadingOverview}
          pagination={{ pageSize: 4 }}
          size="middle"
        />
      </Card>

      {/* Modals */}
      <PlanSelectionModal visible={planModalVisible} onClose={() => setPlanModalVisible(false)} clientId={clientId} />
      <PaymentHistoryModal visible={historyModalVisible} onClose={() => setHistoryModalVisible(false)} clientId={clientId} />
    </>
  );
};

export default SubscriptionSection;
