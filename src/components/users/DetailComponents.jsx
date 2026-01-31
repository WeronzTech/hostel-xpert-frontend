import {Tag} from "antd";
import {FaRupeeSign} from "react-icons/fa";

/**
 * DetailCard component is a reusable card layout with optional action buttons.
 */
export const DetailCard = ({
  title,
  icon,
  children,
  className = "",
  actionButtons,
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
  >
    <div className="px-6 border-b border-gray-100 flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </h3>
      {actionButtons && (
        <div className="flex items-center gap-2">{actionButtons}</div>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/**
 * DetailItem component renders label-value pairs with support for icons, currency, and status types.
 */
export const DetailItem = ({
  label,
  value,
  icon,
  isCurrency = false,
  isStatus = false,
  className = "",
}) => {
  // Function to determine tag color based on status value
  const getStatusTag = (status) => {
    if (!status || typeof status !== "string") return <Tag>N/A</Tag>;

    // Split status and balance (e.g., "Paid - ₹5000")
    const [baseStatus, extra] = status.split(" - ");
    const cleanStatus = baseStatus.trim().toLowerCase();

    // Capitalize first letter
    const statusText =
      baseStatus.charAt(0).toUpperCase() + baseStatus.slice(1).toLowerCase();

    // Rebuild display string with formatting preserved
    const displayText = extra ? `${statusText} - ${extra}` : statusText;

    switch (cleanStatus) {
      case "paid":
        return <Tag color="success">{displayText}</Tag>;
      case "pending":
        return <Tag color="red">{displayText}</Tag>;
      default:
        return <Tag>{displayText}</Tag>;
    }
  };

  return (
    <div className={`flex items-start py-[6.3px] ${className}`}>
      <div className="flex-shrink-0 w-8 mt-1 text-gray-400">{icon}</div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="mt-1">
          {isStatus ? (
            getStatusTag(value)
          ) : isCurrency ? (
            <p className="text-sm font-medium text-gray-900 flex items-center">
              <FaRupeeSign className="mr-1" size={12} />
              {value}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {value || "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * SectionHeader component renders a stylized section header with optional icon.
 */
export const SectionHeader = ({title, icon}) => (
  <div className="flex items-center mt-3">
    <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      {icon && <span className="text-indigo-600">{icon}</span>}
      {title}
    </h3>
  </div>
);
