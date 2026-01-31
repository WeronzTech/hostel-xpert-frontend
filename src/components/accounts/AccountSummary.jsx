// import {Card, Row, Col, Statistic} from "antd";

// const AccountSummary = ({ledgerData}) => {
//   return (
//     <Card
//       style={{
//         borderRadius: "8px",
//         boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
//       }}
//       bodyStyle={{padding: "20px"}}
//     >
//       <Row gutter={[16, 16]} align="center">
//         <Col xs={12} sm={4}>
//           <Statistic
//             title="Total Debits"
//             value={ledgerData?.totals?.totalDebit || 0}
//             precision={2}
//             prefix="₹"
//             valueStyle={{
//               fontSize: "14px",
//               color: "#ff4d4f",
//             }}
//           />
//         </Col>

//         <Col xs={12} sm={4}>
//           <Statistic
//             title="Total Credits"
//             value={ledgerData?.totals?.totalCredit || 0}
//             precision={2}
//             prefix="₹"
//             valueStyle={{
//               fontSize: "14px",
//               color: "#52c41a",
//             }}
//           />
//         </Col>

//         <Col xs={12} sm={6}>
//           <Statistic
//             title="Closing Balance"
//             value={ledgerData?.totals?.balance || 0}
//             precision={2}
//             prefix="₹"
//             valueStyle={{
//               fontSize: "14px",
//               fontWeight: "bold",
//               color: ledgerData?.totals?.balance >= 0 ? "#52c41a" : "#ff4d4f",
//             }}
//           />
//         </Col>
//       </Row>
//     </Card>
//   );
// };

// export default AccountSummary;
import {Card, Row, Col, Statistic} from "antd";

const AccountSummary = ({ledgerData}) => {
  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
      bodyStyle={{
        padding: "20px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Row
        gutter={[32, 16]}
        justify="center"
        align="middle"
        style={{width: "100%", textAlign: "center"}}
      >
        <Col xs={24} sm={8} md={6} lg={5}>
          <Statistic
            title="Total Debits"
            value={ledgerData?.totals?.totalDebit || 0}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "16px",
              color: "#ff4d4f",
            }}
          />
        </Col>

        <Col xs={24} sm={8} md={6} lg={5}>
          <Statistic
            title="Total Credits"
            value={ledgerData?.totals?.totalCredit || 0}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "16px",
              color: "#52c41a",
            }}
          />
        </Col>

        <Col xs={24} sm={8} md={6} lg={5}>
          <Statistic
            title="Closing Balance"
            value={ledgerData?.totals?.balance || 0}
            precision={2}
            prefix="₹"
            valueStyle={{
              fontSize: "16px",
              fontWeight: "bold",
              color:
                ledgerData?.totals?.balanceType === "Credit"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
            suffix={ledgerData?.totals?.balanceType || ""}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default AccountSummary;
