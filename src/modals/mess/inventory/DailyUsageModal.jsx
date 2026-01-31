import { Modal, Form, InputNumber, Select, Button, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  dailyStockUsage,
  getKitchens,
} from "../../../hooks/inventory/useInventory";
import { useEffect } from "react";

const { Option } = Select;

const DailyUsageModal = ({ open, onClose, loading, inventoryItem }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const { data: kitchens, isLoading: kitchensLoading } = useQuery({
    queryKey: ["kitchens", selectedPropertyId],
    queryFn: () => getKitchens({ propertyId: selectedPropertyId }),
    enabled: open,
  });

  const handleDailyUsage = useMutation({
    mutationFn: (values) => dailyStockUsage(inventoryItem._id, values),
    onSuccess: () => {
      messageApi.success("Daily usage logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to log daily usage.");
    },
  });

  useEffect(() => {
    if (inventoryItem && inventoryItem.kitchenId?.length === 1) {
      form.setFieldsValue({ kitchenId: inventoryItem.kitchenId[0] });
    } else {
      form.resetFields(["kitchenId", "quantity"]);
    }
  }, [inventoryItem, form, open]);

  const handleFinish = (values) => {
    console.log("Form values:", values);
    handleDailyUsage.mutate(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title={`Log Daily Usage for "${inventoryItem?.productName || "Item"}"`}
        onCancel={handleCancel}
        destroyOnClose
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Log Usage
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="daily_usage_form"
          onFinish={handleFinish}
        >
          <Form.Item
            name="kitchenId"
            label="Kitchen"
            rules={[{ required: true, message: "Please select a kitchen!" }]}
          >
            <Select
              placeholder="Select the kitchen where item was used"
              loading={kitchensLoading}
              disabled={true}
            >
              {kitchens?.map((k) => (
                <Option key={k?._id} value={k?._id}>
                  {k?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label={`Quantity Used (${inventoryItem?.quantityType || "units"})`}
            rules={[
              { required: true, message: "Please enter the quantity used!" },
              {
                type: "number",
                min: 0.01,
                message: "Quantity must be greater than 0.",
              },
            ]}
          >
            <InputNumber
              min={0.01}
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DailyUsageModal;
