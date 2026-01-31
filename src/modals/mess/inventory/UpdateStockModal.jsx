import { Modal, Form, InputNumber, Select, Button, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getKitchens,
  updateStockUsage,
} from "../../../hooks/inventory/useInventory";
import { useEffect } from "react";

const { Option } = Select;

const UpdateStockModal = ({ open, onClose, loading, inventoryItem }) => {
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

  const handleUpdateStock = useMutation({
    mutationFn: (values) => updateStockUsage(inventoryItem._id, values),
    onSuccess: () => {
      messageApi.success("Stock updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to update stock.");
    },
  });

  useEffect(() => {
    if (inventoryItem) {
      form.setFieldsValue({
        quantity: inventoryItem.stockQuantity,
        kitchenId:
          inventoryItem.kitchenId?.length === 1
            ? inventoryItem.kitchenId[0]
            : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [inventoryItem, form, open]);

  const handleFinish = (values) => {
    console.log("values:", values);
    handleUpdateStock.mutate(values);
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
        title={`Update Stock for "${inventoryItem?.productName || "Item"}"`}
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
            Update Stock
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="update_stock_form"
          onFinish={handleFinish}
        >
          <Form.Item
            name="kitchenId"
            label="Kitchen"
            rules={[{ required: true, message: "Please select a kitchen!" }]}
          >
            <Select
              placeholder="Select the kitchen to update stock for"
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
            label={`New Stock Quantity (${
              inventoryItem?.quantityType || "units"
            })`}
            rules={[
              {
                required: true,
                message: "Please enter the new stock quantity!",
              },
              { type: "number", min: 0, message: "Stock cannot be negative." },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter the new total stock"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateStockModal;
