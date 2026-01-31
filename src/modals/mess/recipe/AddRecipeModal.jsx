import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import {
  createRecipe,
  getInventory,
} from "../../../hooks/inventory/useInventory";
import { PlusOutlined } from "../../../icons";
import { MinusCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const unitOptions = ["g", "kg", "ml", "L"];

const AddRecipeModal = ({ open, onClose, kitchenId, recipeCategoryId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: inventory } = useQuery({
    queryKey: ["inventory", kitchenId],
    queryFn: () => getInventory({ kitchenId }),
    enabled: !!kitchenId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => createRecipe(data),
    onSuccess: () => {
      messageApi.success("Recipe created successfully!");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      onClose();
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create recipe.";
      messageApi.error(errorMessage);
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // The 'veg' field is now automatically included in 'values'
      const payload = { ...values, kitchenId, recipeCategoryId };
      mutate(payload);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Recipe"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={isPending}
        okText="Save Recipe"
        width={800} // Increased width to accommodate the new field
      >
        <Form
          form={form}
          layout="vertical"
          name="addRecipeForm"
          autoComplete="off"
        >
          {/* --- MODIFIED ROW --- */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Recipe Name"
                rules={[
                  { required: true, message: "Please input the recipe name!" },
                ]}
              >
                <Input placeholder="e.g., Chicken Curry" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="servings"
                label="Servings"
                rules={[
                  {
                    required: true,
                    message: "Please input the number of servings!",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="e.g., 4" />
              </Form.Item>
            </Col>
            {/* --- NEW FIELD ADDED --- */}
            <Col span={8}>
              <Form.Item
                name="veg"
                label="Type"
                rules={[
                  { required: true, message: "Please select the recipe type!" },
                ]}
              >
                <Select placeholder="e.g., Vegetarian">
                  <Option value={true}>Vegetarian</Option>
                  <Option value={false}>Non-Vegetarian</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="Tags (Optional)"
            help="A maximum of 3 tags are allowed."
            rules={[
              {
                validator: (_, value) => {
                  if (value && value.length > 3) {
                    return Promise.reject(
                      new Error("A recipe can have a maximum of 3 tags.")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="e.g., Spicy, Main Course"
            />
          </Form.Item>

          <Form.List
            name="ingredients"
            rules={[
              {
                validator: async (_, ingredients) => {
                  if (!ingredients || ingredients.length < 1) {
                    return Promise.reject(
                      new Error("At least 1 ingredient is required")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const selectedIngredientIds =
                    form
                      .getFieldValue("ingredients")
                      ?.map((ing) => ing?.name) || [];

                  const currentIngredientId =
                    form.getFieldValue("ingredients")[name]?.name;

                  return (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[{ required: true, message: "Missing name" }]}
                        style={{ width: "250px" }} // Adjusted width
                      >
                        <Select
                          showSearch
                          placeholder="Search for an ingredient"
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {inventory?.data
                            ?.filter(
                              (item) =>
                                !selectedIngredientIds.includes(item._id) ||
                                item._id === currentIngredientId
                            )
                            .map((item) => (
                              <Option key={item._id} value={item._id}>
                                {item.productName}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          { required: true, message: "Missing quantity" },
                        ]}
                      >
                        <InputNumber placeholder="Quantity" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "unit"]}
                        rules={[{ required: true, message: "Missing unit" }]}
                        style={{ width: "150px" }}
                      >
                        <Select showSearch placeholder="Unit">
                          {unitOptions.map((unit) => (
                            <Option key={unit} value={unit}>
                              {unit}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Ingredient
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
};

export default AddRecipeModal;
