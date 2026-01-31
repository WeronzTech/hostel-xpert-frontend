import { Button, Rate, Switch, Tag, Tooltip, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "../../icons/index.js";

const { Text } = Typography;

const AddonCard = ({ addon, onEdit, onDelete, onToggle, isUpdating }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case "Beverages":
        return "blue";
      case "Snacks":
        return "Green";
      case "Others":
        return "Orange";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      {/* Image container with relative positioning */}
      <div className="relative w-full h-48">
        <img
          src={addon.itemImage}
          alt={addon.itemName}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg,rgba(0, 0, 0, 0.50) 0%, rgba(255, 255, 255, 0) 41%, rgba(255, 255, 255, 0) 68%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom bar with rating and category tag */}
        {(addon?.rating !== undefined && addon?.rating !== null) ||
        addon?.category ? (
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            {/* Rating */}
            {addon?.rating !== undefined && addon?.rating !== null && (
              <Tooltip title={`Rating: ${addon.rating}`}>
                <div>
                  <Rate
                    allowHalf
                    disabled
                    defaultValue={addon.rating}
                    style={{ fontSize: 14 }}
                  />
                </div>
              </Tooltip>
            )}

            {/* Category tag */}
            {addon?.category && (
              <Tag
                color={getCategoryColor(addon.category)}
                style={{ borderRadius: "20px" }}
              >
                {addon.category}
              </Tag>
            )}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold text-black">{addon.itemName}</h2>

        <Tooltip title={addon.itemDescription} placement="topLeft">
          <p
            className="text-gray-500 text-sm mb-4"
            style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {addon.itemDescription || "No description available"}
          </p>
        </Tooltip>

        {addon.tag && (
          <Tooltip title={addon.tag}>
            <Tag
              color="magenta"
              style={{
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "0.75rem",
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {addon.tag}
            </Tag>
          </Tooltip>
        )}

        <div
          className="my-3 h-px w-full"
          style={{
            background: "linear-gradient(to right, white, gray, white)",
          }}
        />

        {/* Meal Type */}
        <p className="text-gray-500 text-sm">
          <span className="font-medium">Meal Type:</span>{" "}
          <span className="font-semibold text-black">
            {addon.mealType.join(", ")}
          </span>
        </p>
        {/* Price */}
        <p className="text-gray-500 text-sm mt-2">
          <span className="font-medium">Price:</span>{" "}
          {addon.discountedPrice ? (
            <>
              <Text delete className="text-gray-400 mr-2">
                Rs {addon.price.toFixed(2)}
              </Text>
              <Text strong type="success">
                Rs {addon.discountedPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text strong className="text-black">
              Rs {addon.price.toFixed(2)}
            </Text>
          )}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(addon)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(addon._id)}
              />
            </Tooltip>
          </div>
          <Tooltip title="Toggle Availability">
            <Switch
              checked={addon.isAvailable}
              loading={isUpdating}
              onChange={() => onToggle(addon._id, addon.isAvailable)}
              size="small"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AddonCard;
