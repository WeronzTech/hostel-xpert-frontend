import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {
  Modal,
  Typography,
  Spin,
  Empty,
  Timeline,
  Tag,
  Badge,
  Tabs,
  Space,
} from "antd";
import {
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiUser,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiSmartphone,
  FiHash,
  FiHome,
  FiPackage,
  FiShield,
  FiSlash,
} from "react-icons/fi";
import {SiRazorpay} from "react-icons/si";
import dayjs from "dayjs";
import {
  getUserTransactionHistory,
  getUserDepositTransactionHistory,
  getUserBusFeeTransactionHistory,
} from "../../../hooks/users/useUser";
import {FaBus, FaRupeeSign, FaUniversity} from "react-icons/fa";

const {Text, Title} = Typography;
const {TabPane} = Tabs;

const TransactionHistoryModal = ({userId, visible, onClose}) => {
  const [activeTab, setActiveTab] = useState("rent");

  // Fetch all three types of transactions in parallel
  const {
    data: rentData,
    isLoading: rentLoading,
    isError: rentError,
    error: rentErrorObj,
  } = useQuery({
    queryKey: ["userTransactionHistory", userId],
    queryFn: () => getUserTransactionHistory(userId),
    enabled: visible,
  });

  const {
    data: depositData,
    isLoading: depositLoading,
    isError: depositError,
    error: depositErrorObj,
  } = useQuery({
    queryKey: ["userDepositTransactionHistory", userId],
    queryFn: () => getUserDepositTransactionHistory(userId),
    enabled: visible,
  });

  const {
    data: busFeeData,
    isLoading: busFeeLoading,
    isError: busFeeError,
    error: busFeeErrorObj,
  } = useQuery({
    queryKey: ["userBusFeeTransactionHistory", userId],
    queryFn: () => getUserBusFeeTransactionHistory(userId),
    enabled: visible,
  });

  const isLoading = rentLoading || depositLoading || busFeeLoading;
  const hasError = rentError || depositError || busFeeError;

  // Payment status configuration
  const statusConfig = {
    Paid: {
      icon: <FiCheckCircle className="text-emerald-500" />,
      color: "green",
      label: "Paid",
    },
    Pending: {
      icon: <FiClock className="text-amber-500" />,
      color: "orange",
      label: "Pending",
    },
    Failed: {
      icon: <FiXCircle className="text-rose-500" />,
      color: "red",
      label: "Failed",
    },
    Refunded: {
      icon: <FiAlertCircle className="text-blue-500" />,
      color: "blue",
      label: "Refunded",
    },
    default: {
      icon: <FiAlertCircle className="text-gray-500" />,
      color: "gray",
      label: "Unknown",
    },
  };

  // Payment method configuration
  const paymentMethodConfig = {
    Card: {
      icon: <FiCreditCard className="text-purple-500" />,
      label: "Card Payment",
      color: "purple",
    },
    Razorpay: {
      icon: <SiRazorpay className="text-blue-500" />,
      label: "Razorpay",
      color: "blue",
    },
    Cash: {
      icon: <FaRupeeSign className="text-green-500" />,
      label: "Cash",
      color: "green",
    },
    UPI: {
      icon: <FiSmartphone className="text-indigo-500" />,
      label: "UPI",
      color: "indigo",
    },
    "Bank Transfer": {
      icon: <FaUniversity className="text-cyan-500" />,
      label: "Bank Transfer",
      color: "blue",
    },
    default: {
      icon: <FiDollarSign className="text-gray-500" />,
      label: "Payment",
      color: "gray",
    },
  };

  // Transaction type icons and colors
  const transactionTypeConfig = {
    rent: {
      icon: <FiHome className="text-blue-600" />,
      label: "Rent",
      color: "blue",
      bgColor: "bg-blue-100",
    },
    deposit: {
      icon: <FiPackage className="text-amber-600" />,
      label: "Deposit",
      color: "amber",
      bgColor: "bg-amber-100",
    },
    busFee: {
      icon: <FiHash className="text-green-600" />,
      label: "Bus Fee",
      color: "green",
      bgColor: "bg-green-100",
    },
  };

  const getTransactionData = () => {
    switch (activeTab) {
      case "rent":
        return {
          data: rentData?.data || [],
          loading: rentLoading,
          error: rentError,
          errorObj: rentErrorObj,
          type: "rent",
        };
      case "deposit":
        return {
          data: depositData?.data || [],
          loading: depositLoading,
          error: depositError,
          errorObj: depositErrorObj,
          type: "deposit",
        };
      case "busFee":
        return {
          data: busFeeData?.data || [],
          loading: busFeeLoading,
          error: busFeeError,
          errorObj: busFeeErrorObj,
          type: "busFee",
        };
      default:
        return {
          data: [],
          loading: false,
          error: false,
          errorObj: null,
          type: "rent",
        };
    }
  };

  const renderTimelineItem = (transaction, type) => {
    const status = statusConfig[transaction.status] || statusConfig.default;
    const paymentMethod =
      paymentMethodConfig[transaction.paymentMethod] ||
      paymentMethodConfig.default;
    console.log(transaction);
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`${
                paymentMethod.color === "green"
                  ? "bg-green-100"
                  : paymentMethod.color === "blue"
                    ? "bg-blue-100"
                    : paymentMethod.color === "purple"
                      ? "bg-purple-100"
                      : paymentMethod.color === "indigo"
                        ? "bg-indigo-100"
                        : paymentMethod.color === "cyan"
                          ? "bg-cyan-100"
                          : "bg-gray-100"
              } p-2 rounded-lg`}
            >
              {paymentMethod.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Text
                  strong
                  className={`${
                    paymentMethod.color === "green"
                      ? "text-green-600"
                      : paymentMethod.color === "blue"
                        ? "text-blue-600"
                        : paymentMethod.color === "purple"
                          ? "text-purple-600"
                          : paymentMethod.color === "indigo"
                            ? "text-indigo-600"
                            : paymentMethod.color === "cyan"
                              ? "text-cyan-600"
                              : "text-gray-600"
                  }`}
                >
                  {paymentMethod.label}
                </Text>
                <Badge
                  count={status.label}
                  style={{
                    backgroundColor:
                      status.color === "green"
                        ? "#52c41a"
                        : status.color === "orange"
                          ? "#fa8c16"
                          : status.color === "red"
                            ? "#ff4d4f"
                            : status.color === "blue"
                              ? "#1890ff"
                              : "#d9d9d9",
                  }}
                />
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div>
                  <Text strong className="text-lg text-gray-800">
                    ₹
                    {transaction.amount?.toLocaleString("en-IN") ||
                      transaction.amountPaid?.toLocaleString("en-IN") ||
                      0}
                  </Text>
                </div>
                <div className="flex items-center gap-1">
                  <FiCalendar className="text-gray-400 text-xs" />
                  <Text type="secondary" className="text-xs">
                    {dayjs(
                      transaction.paymentDate || transaction.createdAt,
                    ).format("MMM D, YYYY • h:mm A")}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction details - type specific */}
        <div className="mt-3 space-y-2">
          {/* For Rent payments */}
          {type === "rent" && transaction.paymentForMonths?.length > 0 && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiCalendar className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700 font-medium">
                  Rent for:
                </span>
                {transaction.paymentForMonths.map((month, index) => (
                  <Tag key={index} color="blue" className="text-xs">
                    {month}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* For Deposit payments */}
          {type === "deposit" && transaction.depositType && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiPackage className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">Type:</span>
                <Tag
                  color={
                    transaction.depositType === "refundable"
                      ? "green"
                      : "orange"
                  }
                >
                  {transaction.depositType?.charAt(0).toUpperCase() +
                    transaction.depositType?.slice(1)}
                </Tag>
                {transaction.depositStatus && (
                  <Tag
                    color={
                      transaction.depositStatus === "paid" ? "green" : "orange"
                    }
                  >
                    {transaction.depositStatus}
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* For Bus Fee payments */}
          {type === "busFee" && transaction.busFeePeriod && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiHash className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">
                  Period:
                </span>
                <Tag color="green">{transaction.busFeePeriod}</Tag>
              </div>
            </div>
          )}

          {/* Common fields */}
          {transaction.transactionId && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiHash className="text-gray-400 mt-0.5 flex-shrink-0" />
              <Text className="text-sm text-gray-700">
                <span className="font-medium">Transaction ID:</span>{" "}
                {transaction.transactionId}
              </Text>
            </div>
          )}

          {transaction.remarks && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiFileText className="text-gray-400 mt-0.5 flex-shrink-0" />
              <Text className="text-sm text-gray-700">
                <span className="font-medium">Remarks:</span>{" "}
                {transaction.remarks}
              </Text>
            </div>
          )}

          {/* Remaining Amount to Complete One Full Month */}
          {transaction.accountBalance !== undefined &&
            transaction.accountBalance > 0 &&
            transaction.dueAmount === 0 &&
            transaction.rent > transaction.accountBalance && (
              <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
                <FaRupeeSign className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  Just{" "}
                  <span className="font-semibold">
                    ₹{" "}
                    {(
                      transaction.rent - transaction.accountBalance
                    ).toLocaleString("en-IN")}
                  </span>{" "}
                  more to complete one full month
                </p>
              </div>
            )}

          {/* Pending Due (for rent) */}
          {type === "rent" && transaction.dueAmount > 0 && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiClock className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">
                  Pending Due:
                </span>
                <Tag color="red" className="text-xs font-semibold">
                  ₹ {transaction.dueAmount?.toLocaleString("en-IN")}
                </Tag>
              </div>
            </div>
          )}

          {type === "rent" && transaction.waveOffAmount > 0 && (
            <div className="flex gap-2 bg-white p-2 rounded border border-gray-100">
              <FiSlash className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">
                    Wave Off Amount:
                  </span>
                  <Tag color="orange" className="text-xs font-semibold">
                    ₹ {transaction.waveOffAmount?.toLocaleString("en-IN")}
                  </Tag>
                </div>

                {transaction.waveOffReason && (
                  <span className="text-xs text-gray-500">
                    Reason: {transaction.waveOffReason}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional info */}
        {(transaction.collectedBy || transaction.receivedBy) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <FiUser className="text-gray-400 text-xs" />
              <Text type="secondary" className="text-xs">
                Collected by {transaction.collectedBy || transaction.receivedBy}
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    const {data, loading, error, errorObj, type} = getTransactionData();

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Empty
          image={<FiAlertCircle className="text-4xl text-rose-500" />}
          description={
            <div className="flex flex-col items-center">
              <Text className="text-lg font-medium text-gray-800 mb-1">
                Failed to load transaction history
              </Text>
              <Text className="text-gray-500 text-center">
                {errorObj?.message || "Please try again later"}
              </Text>
            </div>
          }
        />
      );
    }

    if (!data?.length) {
      return (
        <Empty
          description={
            <div className="flex flex-col items-center">
              <Text className="text-gray-800 font-medium mb-1">
                No {transactionTypeConfig[type].label.toLowerCase()}{" "}
                transactions found
              </Text>
              <Text className="text-gray-500 text-sm">
                This user has no{" "}
                {transactionTypeConfig[type].label.toLowerCase()} history yet
              </Text>
            </div>
          }
          className="py-12"
          imageStyle={{height: 80}}
        />
      );
    }

    return (
      <div
        className="p-3 overflow-y-auto scrollbar-hide"
        style={{maxHeight: "60vh"}}
      >
        <div className="md:block hidden">
          <Timeline
            mode="left"
            className="custom-timeline"
            items={data.map((transaction, index) => ({
              color: statusConfig[transaction.status]?.color || "gray",
              children: renderTimelineItem(transaction, type),
            }))}
          />
        </div>
        <div className="md:hidden block">
          <div className="space-y-4">
            {data.map((transaction, index) => (
              <div key={index}>{renderTimelineItem(transaction, type)}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const calculateTotals = () => {
    const rentTotal =
      rentData?.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const depositTotal =
      depositData?.data?.reduce((sum, t) => sum + (t.amountPaid || 0), 0) || 0;
    const busFeeTotal =
      busFeeData?.data?.reduce((sum, t) => sum + (t.amountPaid || 0), 0) || 0;

    return {
      rent: rentTotal,
      deposit: depositTotal,
      busFee: busFeeTotal,
      overall: rentTotal + depositTotal + busFeeTotal,
    };
  };

  const totals = calculateTotals();

  if (hasError && !isLoading) {
    return (
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
            <Title level={5} className="mb-0">
              Transaction History
            </Title>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={700}
      >
        <Empty
          image={<FiAlertCircle className="text-4xl text-rose-500" />}
          description={
            <div className="flex flex-col items-center">
              <Text className="text-lg font-medium text-gray-800 mb-1">
                Failed to load transaction history
              </Text>
              <Text className="text-gray-500 text-center">
                Please try again later
              </Text>
            </div>
          }
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 text-green-600 text-xl rounded-lg">
              <FaRupeeSign className="text-green-600" />
            </div>
            <div>
              <Title level={5} className="mb-0">
                View all payment transactions
              </Title>
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="transaction-history-modal"
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <Tabs
          centered
          activeKey={activeTab}
          onChange={setActiveTab}
          className="transaction-tabs"
          tabBarStyle={{marginBottom: 16}}
        >
          <TabPane
            tab={
              <Space>
                <FiHome />
                <span>Rent</span>
              </Space>
            }
            key="rent"
          >
            {renderContent()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <FiShield />
                <span>Deposit</span>
              </Space>
            }
            key="deposit"
          >
            {renderContent()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <FaBus />
                <span>Bus Fee</span>
              </Space>
            }
            key="busFee"
          >
            {renderContent()}
          </TabPane>
        </Tabs>

        {/* Summary Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <Text type="secondary" className="text-xs">
                Showing {getTransactionData().data?.length || 0}{" "}
                {transactionTypeConfig[activeTab].label.toLowerCase()}{" "}
                transactions
              </Text>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <Text strong className="text-sm block">
                  ₹{totals[activeTab].toLocaleString("en-IN")}
                </Text>
                <Text type="secondary" className="text-xs">
                  {transactionTypeConfig[activeTab].label} Total
                </Text>
              </div>
              <div className="text-right">
                <Text strong className="text-sm block">
                  ₹{totals.overall.toLocaleString("en-IN")}
                </Text>
                <Text type="secondary" className="text-xs">
                  Overall Total
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionHistoryModal;
