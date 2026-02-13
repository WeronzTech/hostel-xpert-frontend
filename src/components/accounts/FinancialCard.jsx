import {Card, Button, Tooltip, Skeleton} from "antd";
import {BiTransferAlt} from "react-icons/bi";
import {BsArrowUpRight, BsArrowDownRight, BsArrowRight} from "react-icons/bs";
import {useNavigate} from "react-router-dom";

const FinancialCard = ({
  title,
  type,
  totalAmountNeed,
  lastMonthReceived,
  currentMonthReceived,
  pendingAmount,
  isIncrease,
  percentageReceived,
  comparisonAmount,
  comparisonPercentage,
  isLoading,
}) => {
  const navigate = useNavigate();

  const colorConfig = {
    monthly: {
      border: "#059669",
      bg: "#059669",
      text: "#059669",
      hex: "#059669",
    },
    daily: {
      border: "#38b2ac",
      bg: "#38b2ac",
      text: "#38b2ac",
      hex: "#38b2ac",
    },
    mess: {
      border: "#f6ad55",
      bg: "#f6ad55",
      text: "#f6ad55",
      hex: "#f6ad55",
    },
  };

  const colors = colorConfig[type] || colorConfig.monthly;

  const handleViewDetails = () => {
    navigate(`/accounts/transactions/${type}`);
  };

  // Fix: Add proper null checks and default values
  const hasComparison =
    lastMonthReceived !== undefined && lastMonthReceived !== null;

  // Fix: Ensure values are numbers and handle null/undefined
  const currentMonthValue = Number(currentMonthReceived) || 0;
  const lastMonthValue = Number(lastMonthReceived) || 0;

  // Fix: Recalculate widths with proper checks
  const maxValue = hasComparison
    ? Math.max(currentMonthValue, lastMonthValue) * 1.2 || 1 // Avoid division by zero
    : currentMonthValue * 1.2 || 1;

  const lastMonthWidth =
    hasComparison && maxValue > 0
      ? Math.min(100, (lastMonthValue / maxValue) * 100)
      : 0;

  const currentWidth =
    maxValue > 0 ? Math.min(100, (currentMonthValue / maxValue) * 100) : 0;

  if (isLoading) {
    return (
      <Card
        style={{
          borderTop: `4px solid ${colors.border}`,
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
        }}
        bodyStyle={{padding: "24px"}}
      >
        <Skeleton active paragraph={{rows: 4}} />
      </Card>
    );
  }

  return (
    <>
      <Card
        style={{
          borderTop: `4px solid ${colors.border}`,
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
        }}
        bodyStyle={{padding: "24px"}}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              marginBottom: window.innerWidth <= 768 ? "4px" : "0px",
            }}
          >
            <div
              style={{
                color: "#6B7280",
                fontWeight: 500,
              }}
            >
              {title}
            </div>
            <div style={{fontSize: "24px", fontWeight: "bold"}}>
              ₹{currentMonthValue.toLocaleString()}
              {hasComparison && (
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "normal",
                    marginLeft: "8px",
                    color:
                      isIncrease === "increase"
                        ? "#10B981" // green
                        : isIncrease === "decrease"
                          ? "#F56565" // red
                          : "#6B7280", // gray for neutral
                  }}
                >
                  {isIncrease === "increase"
                    ? "↑"
                    : isIncrease === "decrease"
                      ? "↓"
                      : "→"}{" "}
                  {comparisonPercentage || 0}%
                </span>
              )}
            </div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <span style={{fontSize: "14px", color: "#6B7280"}}>
              of ₹{(totalAmountNeed || 0).toLocaleString()}
            </span>
            <span
              style={{
                color: colors.text,
                padding: "4px 8px",
                borderRadius: "9999px",
                fontSize: "12px",
                backgroundColor: `${colors.hex}1a`,
              }}
            >
              {percentageReceived || 0}%
            </span>
          </div>
        </div>

        {/* Comparison summary */}
        {hasComparison && (
          <div
            style={{
              textAlign: "center",
              marginBottom: window.innerWidth <= 768 ? "12px" : "0px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                color:
                  isIncrease === "increase"
                    ? "#10B981" // green
                    : isIncrease === "decrease"
                      ? "#F56565" // red
                      : "#6B7280", // gray for neutral
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              {isIncrease === "increase" ? (
                <BsArrowUpRight />
              ) : isIncrease === "decrease" ? (
                <BsArrowDownRight />
              ) : (
                <BsArrowRight /> // neutral arrow
              )}
              {comparisonPercentage || 0}%{" "}
              {isIncrease === "increase"
                ? "Increase"
                : isIncrease === "decrease"
                  ? "Decrease"
                  : ""}
            </div>

            <div style={{fontSize: "12px", color: "#6B7280"}}>
              ₹{Math.abs(comparisonAmount || 0).toLocaleString()}{" "}
              {isIncrease === "increase"
                ? "more"
                : isIncrease === "decrease"
                  ? "less"
                  : "than"}{" "}
              last month
            </div>
          </div>
        )}

        {/* Comparative progress visualization with tooltips */}
        {hasComparison && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#6B7280",
                marginBottom: "10px",
              }}
            >
              <span>This Month: ₹{currentMonthValue.toLocaleString()}</span>
              <span>Last Month: ₹{lastMonthValue.toLocaleString()}</span>
            </div>

            <div
              style={{
                position: "relative",
                height: "8px",
                backgroundColor: "#E5E7EB",
                borderRadius: "4px",
              }}
            >
              {/* Last month amount (gray background) with tooltip */}
              <Tooltip
                title={`Last Month: ₹${lastMonthValue.toLocaleString()}`}
                placement="top"
              >
                <div
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: `${lastMonthWidth}%`,
                    backgroundColor: "#9CA3AF",
                    borderRadius: "4px",
                    cursor: "pointer",
                    opacity: 0.7,
                    transition: "width 0.3s ease-in-out", // Add smooth transition
                  }}
                />
              </Tooltip>

              {/* Current month amount (using the card's primary color) */}
              <Tooltip
                title={`This Month: ₹${currentMonthValue.toLocaleString()}`}
                placement="top"
              >
                <div
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: `${currentWidth}%`,
                    backgroundColor: colors.hex,
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "width 0.3s ease-in-out", // Add smooth transition
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            marginTop: "12px",
          }}
        >
          <span style={{color: "#F56565", fontWeight: "bold"}}>
            Pending: ₹{(pendingAmount || 0).toLocaleString()}
          </span>
          <Button
            type="text"
            style={{
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: colors.text,
            }}
            onClick={handleViewDetails}
          >
            View Details <BiTransferAlt />
          </Button>
        </div>
      </Card>
    </>
  );
};

export default FinancialCard;
