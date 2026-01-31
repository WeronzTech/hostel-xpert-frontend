import {Timeline, Tag} from "antd";
import dayjs from "dayjs";

const inventoryActionColors = {
  add: "#38C700", // Green for additions
  remove: "#C70000", // Red for removals
  adjust: "#FF9500", // Orange for adjustments
  transfer: "#0074C7", // Blue for transfers
  edit: "#0074C7",
  DEFAULT: "#696969", // Grey for unknown operations
};

const InventoryTimelineLog = ({logs}) => {
  const getColor = (operation) =>
    inventoryActionColors[operation?.toLowerCase()] ||
    inventoryActionColors.DEFAULT;

  const renderTimelineItems = () =>
    logs.map((log) => ({
      color: getColor(log.operation),
      dot: (
        <span
          style={{
            display: "inline-block",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: getColor(log.operation),
          }}
        />
      ),
      children: (
        <div style={{marginBottom: "16px"}}>
          <div className="text-base text-gray-600">
            {dayjs(log.createdAt).format("DD-MM-YYYY hh:mm A")}
          </div>
          <div className="flex items-center gap-2">
            <Tag color={getColor(log.operation)}>
              {log.operation.toUpperCase()}
            </Tag>
            <div className="text-lg font-medium">{log.productName}</div>
          </div>
          <div className="text-base mt-1">
            Quantity:
            <span
              className={`ml-2 ${
                log.quantityChanged > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {log.quantityChanged > 0 ? "+" : ""}
              {log.quantityChanged}
            </span>
          </div>
          <div className="text-base">
            New Stock: <span className="font-medium">{log.newStock}</span>
          </div>
          {log.notes && (
            <div className="text-base text-gray-600 mt-1">
              Notes: {log.notes}
            </div>
          )}
        </div>
      ),
    }));

  return (
    <div className="p-4 timeline-dark">
      <Timeline mode="left" items={renderTimelineItems()} />
    </div>
  );
};

export default InventoryTimelineLog;
