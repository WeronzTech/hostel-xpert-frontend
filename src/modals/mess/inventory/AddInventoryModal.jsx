import { Modal, Form, Input, Select, InputNumber, Button, message } from "antd";
import { useSelector } from "react-redux";
import {
  createInventoryItem,
  getCategoriesByProperty,
  getKitchens,
} from "../../../hooks/inventory/useInventory"; // Adjust import paths as needed
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddCategoryModal from "./AddCategoryModal";
import { useState } from "react";
import { FiPlusCircle } from "../../../icons/index.js";

const { Option } = Select;

const quantityTypeOptions = ["kg", "g", "l", "ml"];

const AddInventoryModal = ({ open, onClose, loading }) => {
  const [form] = Form.useForm();
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", selectedPropertyId],
    queryFn: () => getCategoriesByProperty(selectedPropertyId),
    enabled: open,
  });

  const { data: kitchens, isLoading: kitchensLoading } = useQuery({
    queryKey: ["kitchens", selectedPropertyId],
    queryFn: () => getKitchens({ propertyId: selectedPropertyId }),
    enabled: open,
  });

  const handleAddInventory = useMutation({
    mutationFn: (values) => createInventoryItem(values),
    onSuccess: () => {
      messageApi.success("Inventory added successfully!");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to add inventory.");
    },
  });

  const categoryLabel = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>Category</span>
      <Button
        type="link"
        icon={<FiPlusCircle />}
        onClick={() => setIsAddCategoryModalOpen(true)}
      >
        Add
      </Button>
    </div>
  );

  const handleFinish = (values) => {
    console.log("Form submitted with values:", values);
    handleAddInventory.mutate(values);
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
        title="Create New Inventory Item"
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
            Create Inventory
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_inventory_form"
          onFinish={handleFinish}
          initialValues={{
            quantityType: "piece",
            stockQuantity: 0,
            lowStockQuantity: 0,
            pricePerUnit: 0,
          }}
        >
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[
              { required: true, message: "Please enter the product name!" },
            ]}
          >
            <Input placeholder="e.g., All-Purpose Flour" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label={categoryLabel}
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select
              placeholder="Select a category"
              loading={categoriesLoading}
              // disabled={!selectedPropertyId}
            >
              {categories?.map((cat) => (
                <Option key={cat?._id} value={cat?._id}>
                  {cat?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="kitchenId"
            label="Kitchen"
            rules={[
              {
                required: true,
                message: "Please select at least one kitchen!",
              },
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select kitchens where this item is used"
              loading={kitchensLoading}
              // disabled={!selectedPropertyId}
            >
              {kitchens?.map((k) => (
                <Option key={k?._id} value={k?._id}>
                  {k?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="stockQuantity"
              label="Stock Quantity"
              rules={[
                { required: true, message: "Please enter the stock quantity!" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="quantityType"
              label="Unit Type"
              rules={[
                { required: true, message: "Please select a unit type!" },
              ]}
            >
              <Select>
                {quantityTypeOptions?.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="pricePerUnit"
              label="Price Per Unit"
              rules={[
                { required: true, message: "Please enter the price per unit!" },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} addonBefore="₹" />
            </Form.Item>

            <Form.Item
              name="lowStockQuantity"
              label="Low Stock Threshold"
              rules={[
                {
                  required: true,
                  message: "Please enter the low stock threshold!",
                },
              ]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <AddCategoryModal
        open={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
      />
    </>
  );
};

export default AddInventoryModal;
