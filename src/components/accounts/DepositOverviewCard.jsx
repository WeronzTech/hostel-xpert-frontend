import {Button, Card, Tooltip} from "antd";
import {FiArrowRight} from "react-icons/fi";
import {HiShieldCheck} from "react-icons/hi";
import {useNavigate} from "react-router-dom";

const DepositOverviewCard = ({depositData, loading = false}) => {
  const navigate = useNavigate();

  const handleViewDeposits = () => {
    navigate("/accounts/transactions/deposits");
  };

  // Calculate percentages for progress bars
  const totalDepositNeeded =
    (depositData?.currentMonthRefundable || 0) +
    (depositData?.currentMonthNonRefundable || 0);

  const receivedPercentage =
    totalDepositNeeded > 0
      ? ((depositData?.totalReceivedThisMonth || 0) / totalDepositNeeded) * 100
      : 0;
  const pendingPercentage =
    totalDepositNeeded > 0
      ? ((depositData?.currentMonthPending || 0) / totalDepositNeeded) * 100
      : 0;

  if (loading) {
    return (
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
          background: "#059669",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
        bodyStyle={{padding: "20px"}}
        loading={true}
      />
    );
  }

  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        height: "100%",
        background: "#059669",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
      bodyStyle={{padding: "20px"}}
    >
      {/* Header with Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
          <div
            style={{
              padding: "12px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HiShieldCheck style={{fontSize: "20px"}} />
          </div>
          <div>
            <div style={{fontSize: "16px", fontWeight: 500}}>
              Deposit Overview
            </div>
            <div style={{fontSize: "12px", opacity: 0.8}}>
              Security Deposits
            </div>
          </div>
        </div>

        {/* New Joinees Count */}
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div style={{fontSize: "12px", opacity: 0.8, marginBottom: "4px"}}>
            New Joinees
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              lineHeight: "1",
            }}
          >
            {depositData?.noOfCurrentMonthJoines || 0}
          </div>
        </div>
      </div>

      {/* Total Received This Month */}
      <div style={{fontSize: "28px", fontWeight: "bold", marginBottom: "2px"}}>
        ₹{(depositData?.totalReceivedThisMonth || 0).toLocaleString("en-IN")}
      </div>

      {/* Progress Bar 1: Refundable vs Non-refundable */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        <span style={{display: "flex", alignItems: "center", gap: "6px"}}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#d4fff1ff",
              display: "inline-block",
            }}
          ></span>
          Refundable: ₹
          {(depositData?.currentMonthRefundable || 0).toLocaleString("en-IN")}
        </span>
        <span style={{display: "flex", alignItems: "center", gap: "6px"}}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#d4fff1ff",
              display: "inline-block",
            }}
          ></span>
          Non-refundable: ₹
          {(depositData?.currentMonthNonRefundable || 0).toLocaleString(
            "en-IN"
          )}
        </span>
      </div>

      {/* Progress Bar 2: Received vs Pending with Tooltips */}
      <div style={{marginBottom: "16px"}}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          <span>
            Received: ₹
            {(depositData?.totalReceivedThisMonth || 0).toLocaleString("en-IN")}
          </span>
          <span>
            Pending: ₹
            {(depositData?.currentMonthPending || 0).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div
          style={{
            display: "flex",
            height: "8px",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            position: "relative",
          }}
        >
          {/* Received Amount Tooltip */}
          {receivedPercentage > 0 && (
            <Tooltip
              title={`Received: ₹${(
                depositData?.receivedDeposit || 0
              ).toLocaleString("en-IN")} (${Math.round(receivedPercentage)}%)`}
              placement="top"
            >
              <div
                style={{
                  width: `${receivedPercentage}%`,
                  backgroundColor: "#fff",
                  transition: "width 0.3s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
              />
            </Tooltip>
          )}

          {/* Pending Amount Tooltip */}
          {pendingPercentage > 0 && (
            <Tooltip
              title={`Pending: ₹${(
                depositData?.pendingDeposit || 0
              ).toLocaleString("en-IN")} (${Math.round(pendingPercentage)}%)`}
              placement="top"
            >
              <div
                style={{
                  width: `${pendingPercentage}%`,
                  backgroundColor: "#ffa940",
                  transition: "width 0.3s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
              />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div style={{display: "flex", gap: "12px"}}>
        <Button
          style={{
            flex: 1,
            backgroundColor: "white",
            color: "#059669",
            border: "none",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          onClick={handleViewDeposits}
        >
          <FiArrowRight size={16} />
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default DepositOverviewCard;
