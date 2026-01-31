import { Modal, Form, InputNumber, Select, Button, message, Input } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  addDeadStock, // You will need to create this API hook
  getKitchens,
} from "../../../hooks/inventory/useInventory";
import { useEffect } from "react";

const { Option } = Select;
const { TextArea } = Input;

const DeadStockModal = ({ open, onClose, inventoryItem }) => {
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

  const deadStockMutation = useMutation({
    mutationFn: (values) => addDeadStock(inventoryItem._id, values),
    onSuccess: () => {
      messageApi.success("Dead stock logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.error || "Failed to log dead stock."
      );
    },
  });

  useEffect(() => {
    if (inventoryItem && inventoryItem.kitchenId?.length === 1) {
      form.setFieldsValue({ kitchenId: inventoryItem.kitchenId[0] });
    } else {
      form.resetFields();
    }
  }, [inventoryItem, form, open]);

  const handleFinish = (values) => {
    deadStockMutation.mutate(values);
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
        title={`Log Dead Stock for "${inventoryItem?.productName || "Item"}"`}
        onCancel={handleCancel}
        destroyOnClose
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            disabled={deadStockMutation.isPending}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={deadStockMutation.isPending}
            onClick={() => form.submit()}
          >
            Log Dead Stock
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="dead_stock_form"
          onFinish={handleFinish}
        >
          <Form.Item
            name="kitchenId"
            label="Kitchen"
            rules={[{ required: true, message: "Please select a kitchen!" }]}
          >
            <Select
              placeholder="Select the kitchen"
              loading={kitchensLoading}
              disabled={inventoryItem?.kitchenId?.length === 1}
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
            label={`Quantity to Remove (${
              inventoryItem?.quantityType || "units"
            })`}
            rules={[
              { required: true, message: "Please enter the quantity!" },
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
              placeholder="Enter quantity to mark as dead"
            />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Reason"
            rules={[
              {
                required: true,
                message: "Please provide a reason for logging dead stock.",
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="e.g., Damaged during transport, Expired, etc."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeadStockModal;
