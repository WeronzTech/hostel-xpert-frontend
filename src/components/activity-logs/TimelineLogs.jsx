import {Timeline} from "antd";
import dayjs from "dayjs";

const actionColors = {
  // Creation actions
  create: "#38C700", // green (lowercase)
  add: "#38C700", // green (similar to create)

  // Update & modification actions
  update: "#0074C7", // blue
  edit: "#0074C7", // blue (same as update)
  extend: "#FF9500", // orange
  price_update_and_add: "#20B2AA", // teal (unique for combo action)

  // Deletion & removal actions
  delete: "#C70000", // red
  remove: "#C70000", // red (same as delete)

  // Status change actions
  active_status: "#2ECC71", // soft green for activation
  inactive_status: "#E67E22", // amber/orange for deactivation
  block_user: "#C70000", // red
  unblock_user: "#38C700", // green

  // Queued / automated actions
  auto_apply_queued: "#E67E22", // amber/orange (queued status)

  // Audit actions
  AUDIT: "#FF9500", // orange

  // Accounts-specific actions
  "INVOICE-GENERATED": "#4B0082", // indigo
  "PAYMENT-RECEIVED": "#008000", // dark green
  "FINE-ADDED": "#FF0000", // red
  "REFUND-ISSUED": "#FFA500", // orange
  "DISCOUNT-APPLIED": "#1E90FF", // dodger blue

  // Default
  DEFAULT: "#696969", // grey
};

const TimelineLog = ({logs}) => {
  const getColor = (action) => actionColors[action] || actionColors.DEFAULT;

  const renderTimelineItems = () =>
    logs.map((log) => ({
      color: getColor(log.action),
      dot: (
        <span
          style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: getColor(log.action),
          }}
        />
      ),
      children: (
        <div style={{marginBottom: "16px"}}>
          <div className="text-base text-gray-600">
            {dayjs(log.createdAt).format("DD-MM-YYYY hh:mm A")}
          </div>
          <div className="text-lg font-medium mt-1 mb-1">{log.message}</div>
          <div className="text-base text-gray-600">
            Changed By: {log.changedByName}
          </div>
        </div>
      ),
    }));

  return (
    <div className="p-4 timeline-dark">
      <Timeline mode="left" items={renderTimelineItems()} />
    </div>
  );
};

export default TimelineLog;
