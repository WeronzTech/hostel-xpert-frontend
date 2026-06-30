import {useEffect, useState} from "react";
import {Modal, Form, Input, InputNumber, DatePicker, Select, Typography, message, Row, Col} from "antd";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getAssetCategory, convertBedsToAssets} from "../../../hooks/property/useProperty.js";

const {Option} = Select;
const {Text} = Typography;

const ConvertToAssetModal = ({
  open,
  roomId,
  selectedPropertyId,
  unconvertedBeds = [],
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [totalCost, setTotalCost] = useState(0);

  // Fetch asset categories for the selected property
  const {data: categories = [], isLoading: loadingCategories} = useQuery({
    queryKey: ["assetCategories", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const response = await getAssetCategory(selectedPropertyId);
      let catsData = [];
      if (response && response.success && response.data) {
        catsData = response.data;
      } else if (Array.isArray(response)) {
        catsData = response;
      } else if (response && response.data) {
        catsData = response.data;
      }
      return Array.isArray(catsData) ? catsData : [];
    },
    enabled: !!selectedPropertyId && open,
  });

  const convertMutation = useMutation({
    mutationFn: (payload) => convertBedsToAssets(payload),
    onSuccess: (res) => {
      messageApi.success(res?.message || "Beds converted to assets successfully");
      onSuccess();
    },
    onError: (err) => {
      console.error("Conversion failed:", err);
      messageApi.error(err.message || "Failed to convert beds to assets");
    },
  });

  const handlePriceChange = (value) => {
    const val = value || 0;
    unconvertedBeds.forEach((bed) => {
      form.setFieldValue(["beds", bed._id, "price"], val);
    });
    setTotalCost(val * unconvertedBeds.length);
  };

  const calculateTotalCost = () => {
    const values = form.getFieldsValue();
    let total = 0;
    unconvertedBeds.forEach((bed) => {
      const bedPrice = values.beds?.[bed._id]?.price;
      total += Number(bedPrice || 0);
    });
    setTotalCost(total);
  };

  const validatePurchaseDate = () => {
    form.validateFields(['purchaseDate']);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        roomId,
        categoryId: values.categoryId,
        purchaseDetails: {
          vendor: values.vendor,
          purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : undefined,
          invoiceUrl: values.invoiceUrl || "",
        },
        beds: unconvertedBeds.map((bed) => {
          const bedData = values.beds?.[bed._id] || {};
          return {
            bedId: bed._id,
            price: Number(bedData.price ?? values.price ?? 0),
            purchaseDate: bedData.purchaseDate ? bedData.purchaseDate.toISOString() : undefined,
            invoiceUrl: bedData.invoiceUrl || undefined,
          };
        }),
      };

      convertMutation.mutate(payload);
    } catch (error) {
      undefined /* console.log("Validation error:", error); */
    }
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      setTotalCost(0);
    }
  }, [open, form]);

  const isLoading = convertMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        title="Convert Beds to Premium Assets"
        open={open}
        onOk={handleSubmit}
        onCancel={onCancel}
        confirmLoading={isLoading}
        okText="Convert"
        cancelText="Cancel"
        width={650}
        maskClosable={!isLoading}
        closable={!isLoading}
      >
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 6,
          }}
        >
          <Text>
            You are converting <Text bold>{unconvertedBeds.length}</Text> bed(s) in this room into assets.
            This action will automatically register each bed in the asset registry.
          </Text>
        </div>

        <Form form={form} layout="vertical" name="conversionForm">
          <Form.Item
            name="categoryId"
            label="Asset Category"
            rules={[{required: true, message: "Please select an asset category"}]}
          >
            <Select placeholder="Select category (e.g. Beds, Furniture)" loading={loadingCategories} disabled={isLoading}>
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Default Price per Bed (₹)"
            rules={[
              {type: "number", min: 0, message: "Cost must be a positive number"},
            ]}
            extra="Setting a default price will auto-populate all beds below."
          >
            <InputNumber
              style={{width: "100%"}}
              placeholder="e.g. 5000"
              min={0}
              onChange={handlePriceChange}
              disabled={isLoading}
            />
          </Form.Item>

          <div style={{marginBottom: 20}}>
            <Text strong style={{display: "block", marginBottom: 8}}>
              Individual Bed Details & Overrides
            </Text>
            <div
              style={{
                maxHeight: 280,
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                padding: "16px",
                backgroundColor: "#fafafa",
              }}
            >
              {unconvertedBeds.map((bed) => (
                <div
                  key={bed._id}
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    border: "1px solid #e8e8e8",
                    borderRadius: 6,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div style={{marginBottom: 8}}>
                    <Text strong>{bed.name}</Text>
                  </div>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item
                        name={["beds", bed._id, "price"]}
                        label="Price (₹)"
                        rules={[
                          {required: true, message: "Required"},
                          {type: "number", min: 0, message: "Must be >= 0"},
                        ]}
                        style={{marginBottom: 0}}
                      >
                        <InputNumber
                          style={{width: "100%"}}
                          placeholder="Price (₹)"
                          min={0}
                          onChange={calculateTotalCost}
                          disabled={isLoading}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["beds", bed._id, "purchaseDate"]}
                        label="Purchase Date"
                        style={{marginBottom: 0}}
                      >
                        <DatePicker
                          style={{width: "100%"}}
                          placeholder="Inherit default"
                          disabled={isLoading}
                          onChange={validatePurchaseDate}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["beds", bed._id, "invoiceUrl"]}
                        label="Invoice URL"
                        style={{marginBottom: 0}}
                      >
                        <Input
                          placeholder="Inherit default"
                          disabled={isLoading}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>

          <Form.Item
            name="vendor"
            label="Vendor / Supplier"
            rules={[{required: true, message: "Please enter vendor name"}]}
          >
            <Input placeholder="e.g. IKEA, Sleepwell Traders" disabled={isLoading} />
          </Form.Item>

          <Form.Item
            name="purchaseDate"
            label="Purchase Date"
            dependencies={['beds']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value) {
                    return Promise.resolve();
                  }
                  const bedsData = getFieldValue("beds") || {};
                  const allBedsHaveDate = unconvertedBeds.every(
                    (bed) => bedsData[bed._id]?.purchaseDate
                  );
                  if (allBedsHaveDate) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Please select a purchase date (or specify it for every bed individually)."));
                },
              }),
            ]}
          >
            <DatePicker style={{width: "100%"}} disabled={isLoading} />
          </Form.Item>

          <Form.Item name="invoiceUrl" label="Invoice URL (Optional)">
            <Input placeholder="Link to receipt or invoice document" disabled={isLoading} />
          </Form.Item>
        </Form>

        {totalCost > 0 && (
          <div style={{marginTop: 16, textAlign: "right"}}>
            <Text type="secondary">
              Total Asset Capital: <Text strong style={{fontSize: 16, color: "#059669"}}>₹{totalCost}</Text>
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ConvertToAssetModal;
