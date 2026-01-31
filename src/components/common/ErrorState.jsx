import { Empty, Button, Typography, Card } from "antd";
import { ExclamationCircleOutlined } from "../../icons/index.js";

const { Title, Text } = Typography;

/**
 * ErrorState component to show either an empty state or an error alert
 * @param {boolean} isEmpty - whether it's a missing data case
 * @param {string} message - message to show in case of error
 * @param {string} [description] - optional description for the alert
 * @param {Function} [onAction] - optional callback for the action button
 * @param {string} [actionText] - label for the action button
 */
const ErrorState = ({
  isEmpty = false,
  message,
  description,
  onAction,
  actionText = "Try Again",
}) => {
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col items-center justify-center text-center">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
        <Title level={4} className="mt-2">
          {message}
        </Title>
        {description && (
          <Text type="secondary" className="mb-4 block">
            {description}
          </Text>
        )}
        {onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 flex items-center justify-center text-center">
      <Card
        className="w-full max-w-md shadow-s border border-red-200"
        // bodyStyle={{ padding: "2rem" }}
      >
        <div className="flex flex-col items-center justify-center">
          <ExclamationCircleOutlined
            style={{ fontSize: 48, color: "#faad14" }}
          />
          <Title level={4} className="mt-4 mb-1">
            {message}
          </Title>
          {description && (
            <Text type="secondary" className="text-sm mb-4">
              {description}
            </Text>
          )}
          {onAction && (
            <Button type="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ErrorState;
