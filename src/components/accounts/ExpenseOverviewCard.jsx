import {Card, Button, Tooltip, Row, Col, Skeleton} from "antd";
import {
  BsGraphUp,
  BsArrowUpRight,
  BsArrowDownRight,
  BsArrowRight,
} from "react-icons/bs";
import {useNavigate} from "react-router-dom";
import {useMemo} from "react";

const ExpenseOverviewCard = ({expenses, loading = false}) => {
  const navigate = useNavigate();

  // Expense categories configuration - memoized to prevent recalculations
  const expenseCategories = useMemo(
    () => [
      {
        name: "PG",
        amount: expenses?.currentMonthPgExpense || 0,
        color: "#059669",
      },
      {
        name: "Mess",
        amount: expenses?.currentMonthMessExpense || 0,
        color: "#f97316",
      },
      {
        name: "Others",
        amount: expenses?.currentMonthOthersExpense || 0,
        color: "#10b981",
      },
    ],
    [
      expenses?.currentMonthPgExpense,
      expenses?.currentMonthMessExpense,
      expenses?.currentMonthOthersExpense,
    ],
  );

  // Get trend display configuration
  const getTrendDisplay = (trend) => {
    switch (trend) {
      case "increased":
        return {
          icon: <BsArrowUpRight />,
          color: "#f56565",
          label: "Increase",
        };
      case "decreased":
        return {
          icon: <BsArrowDownRight />,
          color: "#10B981",
          label: "Decrease",
        };
      default:
        return {
          icon: <BsArrowRight />,
          color: "#6B7280",
          label: "",
        };
    }
  };

  // Get trend color for progress bar
  const getTrendColor = (trend) => {
    switch (trend) {
      case "increased":
        return "#F56565";
      case "decreased":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const {icon, color, label} = getTrendDisplay(expenses?.trend);

  // Memoize progress bar calculations to ensure they update when expenses change
  const {lastMonthWidth, currentWidth} = useMemo(() => {
    const currentMonthExpense = expenses?.currentMonthExpense || 0;
    const lastMonthExpense = expenses?.lastMonthExpense || 0;

    // Ensure we have valid numbers
    if (currentMonthExpense === 0 && lastMonthExpense === 0) {
      return {lastMonthWidth: 0, currentWidth: 0};
    }

    const maxValue = Math.max(currentMonthExpense, lastMonthExpense) * 1.2;

    const lastMonthWidth = Math.min(100, (lastMonthExpense / maxValue) * 100);
    const currentWidth = Math.min(100, (currentMonthExpense / maxValue) * 100);

    return {lastMonthWidth, currentWidth};
  }, [expenses?.currentMonthExpense, expenses?.lastMonthExpense]);

  const handleViewDetails = () => {
    navigate(`/accounts/transactions/expenses`);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <Card
        style={{
          borderTop: `4px solid #F56565`,
          borderRadius: "8px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          height: "100%",
        }}
        bodyStyle={{padding: "20px"}}
      >
        <Skeleton active paragraph={{rows: 6}} />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderTop: `4px solid #F56565`,
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        height: "100%",
      }}
      bodyStyle={{padding: "20px"}}
    >
      {/* Header Section */}
      <div className="card-header">
        <div>
          <div className="card-label">Monthly Expenses</div>
          <div className="card-amount">
            ₹{(expenses?.currentMonthExpense || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleViewDetails}
          style={{
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "#F56565",
          }}
        >
          <BsGraphUp /> View Details
        </Button>
      </div>

      <Row gutter={[24, 16]}>
        {/* Expense Categories Section */}
        <Col xs={24} lg={12}>
          <div className="section-title">Expense Categories</div>

          {/* Mobile Layout - Vertical */}
          <div className="categories-mobile">
            {expenseCategories.map((category, index) => (
              <div key={index} className="category-item-mobile">
                <div className="category-header-mobile">
                  <div
                    className="category-dot"
                    style={{backgroundColor: category.color}}
                  />
                  <span className="category-name-mobile">{category.name}</span>
                </div>
                <div className="category-amount-mobile">₹{category.amount}</div>
              </div>
            ))}
          </div>

          {/* Desktop Layout - Horizontal */}
          <Row gutter={[16, 16]} className="categories-desktop">
            {expenseCategories.map((category, index) => (
              <Col xs={24} sm={8} key={index}>
                <div className="category-item">
                  <div className="category-header">
                    <div
                      className="category-dot"
                      style={{backgroundColor: category.color}}
                    />
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-amount">
                    ₹{category.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Comparison Section */}
        <Col xs={24} lg={12}>
          <div className="comparison-section">
            {/* Comparison Summary */}
            <div className="comparison-summary">
              <div className="trend-indicator" style={{color}}>
                {icon}
                {expenses?.percentageChange || 0}% {label}
              </div>
              <div className="trend-description">
                ₹{(expenses?.difference || 0).toLocaleString("en-IN")}{" "}
                {expenses?.trend === "increased"
                  ? "more than last month"
                  : expenses?.trend === "decreased"
                    ? "less than last month"
                    : "no change compared to last month"}
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="progress-section">
              <div className="progress-labels">
                <span>
                  This Month: ₹
                  {(expenses?.currentMonthExpense || 0).toLocaleString("en-IN")}
                </span>
                <span>
                  Last Month: ₹
                  {(expenses?.lastMonthExpense || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="progress-bar-container">
                <Tooltip
                  title={`Last Month: ₹${(
                    expenses?.lastMonthExpense || 0
                  ).toLocaleString("en-IN")}`}
                  placement="top"
                >
                  <div
                    className="progress-bar-background"
                    style={{width: `${lastMonthWidth}%`}}
                  />
                </Tooltip>
                <Tooltip
                  title={`This Month: ₹${(
                    expenses?.currentMonthExpense || 0
                  ).toLocaleString("en-IN")}`}
                  placement="top"
                >
                  <div
                    className="progress-bar-foreground"
                    style={{
                      width: `${currentWidth}%`,
                      backgroundColor: getTrendColor(expenses?.trend),
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-label {
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .card-amount {
          font-size: 24px;
          font-weight: bold;
        }

        .view-details-btn {
          background-color: #f56565;
          border-color: #f56565;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .section-title {
          color: #6b7280;
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 16px;
        }

        /* Mobile Categories Layout */
        .categories-mobile {
          display: block;
          margin-bottom: 16px;
        }

        .categories-desktop {
          display: none;
          margin-bottom: 16px;
        }

        .category-item-mobile {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .category-item-mobile:last-child {
          border-bottom: none;
        }

        .category-header-mobile {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-name-mobile {
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
        }

        .category-amount-mobile {
          font-size: 14px;
          font-weight: bold;
          color: #2d3748;
        }

        /* Desktop Categories Layout */
        .category-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .category-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
        }

        .category-amount {
          font-size: 16px;
          font-weight: bold;
          color: #2d3748;
        }

        .comparison-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .comparison-summary {
          text-align: center;
          margin-bottom: 16px;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .trend-description {
          font-size: 12px;
          color: #6b7280;
        }

        .progress-section {
          margin-top: 8px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .progress-bar-container {
          position: relative;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-background {
          position: absolute;
          height: 100%;
          background-color: #9ca3af;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0.7;
          transition: width 0.3s ease;
        }

        .progress-bar-foreground {
          position: absolute;
          height: 100%;
          border-radius: 4px;
          cursor: pointer;
          transition:
            width 0.3s ease,
            background-color 0.3s ease;
        }

        /* Responsive Breakpoints */
        @media (min-width: 992px) {
          .categories-mobile {
            display: none;
          }
          .categories-desktop {
            display: flex;
          }
        }

        @media (max-width: 991px) {
          .categories-mobile {
            display: block;
          }
          .categories-desktop {
            display: none;
          }
        }
      `}</style>
    </Card>
  );
};

export default ExpenseOverviewCard;
