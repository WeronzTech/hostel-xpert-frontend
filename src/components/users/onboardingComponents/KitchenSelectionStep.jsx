import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import {useQuery} from "@tanstack/react-query";
import {getKitchens} from "../../../hooks/inventory/useInventory";
import {redButton} from "../../../data/common/color";
import {CloseOutlined} from "../../../icons";
import { useNavigate } from "react-router-dom";

const KitchenSelectionStep = ({
  formData,
  handleChange,
  handleReject,
  isRejoin,
}) => {
  const navigate = useNavigate();
  const {
    data: kitchens = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["kitchens"],
    queryFn: () => getKitchens(),
  });

  const selectedMealTypes = formData?.messDetails?.mealType || [];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={4} style={{margin: 0}}>
          Kitchen Selection
        </Typography.Title>
        {isRejoin ? (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate(-1)}
          />
        ) : (
          <ConfigProvider theme={redButton}>
            <Button
              onClick={handleReject}
              type="primary"
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
          </ConfigProvider>
        )}
      </div>

      <Form layout="vertical">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
            }}
          >
            <Spin />
          </div>
        ) : isError ? (
          <Typography.Text type="danger">
            Error: {error.message}
          </Typography.Text>
        ) : (
          <>
            <Form.Item label="Kitchen">
              <Select
                name="kitchenId"
                value={formData.kitchenId}
                onChange={(value) =>
                  handleChange({target: {name: "kitchenId", value}})
                }
                style={{width: "100%"}}
              >
                <Select.Option value="" disabled>
                  Select a kitchen
                </Select.Option>
                {kitchens.map((kitchen) => (
                  <Select.Option key={kitchen._id} value={kitchen._id}>
                    {kitchen.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* ✅ Meal Types Display */}
            {selectedMealTypes.length > 0 && (
              <Form.Item label="Selected Meal Types">
                <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                  {selectedMealTypes.map((meal) => (
                    <Tag color="blue" key={meal}>
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Tag>
                  ))}
                </div>
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Card>
  );
};

export default KitchenSelectionStep;
