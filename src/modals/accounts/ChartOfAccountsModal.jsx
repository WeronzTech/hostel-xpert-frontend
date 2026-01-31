import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  message,
} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useState, useEffect} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createAccountCategory,
  createChartOfAccount,
  getAccountCategories,
} from "../../hooks/accounts/useAccounts";

const ChartOfAccountsModal = ({isOpen, onClose, onSuccess}) => {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // TanStack Query for categories
  const {data: categories = [], isLoading: categoriesLoading} = useQuery({
    queryKey: ["accountCategories"],
    queryFn: () => getAccountCategories(),
    enabled: isOpen, // Only fetch when modal is open
  });

  // Mutation for creating account
  const createAccountMutation = useMutation({
    mutationFn: createChartOfAccount,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries({queryKey: ["chartOfAccounts"]});
      onSuccess();
      form.resetFields();
      setSelectedAccountType(null);
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Mutation for creating category
  const createCategoryMutation = useMutation({
    mutationFn: createAccountCategory,
    onSuccess: (data) => {
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      queryClient.invalidateQueries({queryKey: ["accountCategories"]});
      categoryForm.resetFields();
      setIsCategoryModalOpen(false);
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  // Filter categories based on selected account type
  const filteredCategories = categories?.data?.filter(
    (category) => category.accountType === selectedAccountType
  );

  const handleSubmit = async (values) => {
    createAccountMutation.mutate(values);
  };

  const handleCreateCategory = async (values) => {
    createCategoryMutation.mutate(values);
  };

  const handleAccountTypeChange = (value) => {
    setSelectedAccountType(value);
    // Reset category when account type changes
    form.setFieldValue("categoryId", undefined);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedAccountType(null);
    }
  }, [isOpen, form]);

  // Reset category form when account type changes
  useEffect(() => {
    if (selectedAccountType && isCategoryModalOpen) {
      categoryForm.setFieldValue("accountType", selectedAccountType);
    }
  }, [selectedAccountType, isCategoryModalOpen, categoryForm]);

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Account"
        open={isOpen}
        maskClosable={false}
        centered
        onCancel={onClose}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={createAccountMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* 🧾 Row 1: Account Name + Account Type */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Account Name"
                rules={[{required: true, message: "Please enter account name"}]}
              >
                <Input placeholder="e.g., Cash, Bank Account, Sales Revenue" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accountType"
                label="Account Type"
                rules={[
                  {required: true, message: "Please select account type"},
                ]}
              >
                <Select
                  placeholder="Select account type"
                  onChange={handleAccountTypeChange}
                  loading={categoriesLoading}
                >
                  <Select.Option value="Asset">Asset</Select.Option>
                  <Select.Option value="Liability">Liability</Select.Option>
                  <Select.Option value="Equity">Equity</Select.Option>
                  <Select.Option value="Income">Income</Select.Option>
                  <Select.Option value="Expense">Expense</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 🧾 Row 2: Category with Add Button */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="categoryId" label="Category">
                <Select
                  placeholder={
                    selectedAccountType
                      ? "Select category"
                      : "Select account type first"
                  }
                  disabled={!selectedAccountType}
                  loading={categoriesLoading}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div
                        style={{padding: "8px", borderTop: "1px solid #d9d9d9"}}
                      >
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setIsCategoryModalOpen(true)}
                          block
                          disabled={!selectedAccountType}
                        >
                          Add New Category
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {filteredCategories?.map((category) => (
                    <Select.Option key={category._id} value={category._id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 🧾 Row 3: GST Type + GST Rate */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gstType"
                label="GST Type"
                initialValue="Not-Applicable"
              >
                <Select>
                  <Select.Option value="Not-Applicable">
                    Not Applicable
                  </Select.Option>
                  <Select.Option value="GST-Input-CGST">
                    GST Input CGST
                  </Select.Option>
                  <Select.Option value="GST-Input-SGST">
                    GST Input SGST
                  </Select.Option>
                  <Select.Option value="GST-Input-IGST">
                    GST Input IGST
                  </Select.Option>
                  <Select.Option value="GST-Output-CGST">
                    GST Output CGST
                  </Select.Option>
                  <Select.Option value="GST-Output-SGST">
                    GST Output SGST
                  </Select.Option>
                  <Select.Option value="GST-Output-IGST">
                    GST Output IGST
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gstRate" label="GST Rate">
                <Input placeholder="e.g., 18%" />
              </Form.Item>
            </Col>
          </Row>

          {/* 🧾 Row 4: Opening Balance */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="balance"
                label="Opening Balance"
                initialValue={0}
              >
                <InputNumber
                  style={{width: "100%"}}
                  placeholder="0.00"
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 🧾 Row 5: Description */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={3}
                  placeholder="Account description (optional)"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 🧾 Row 6: Active Switch */}
          {/* <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row> */}
        </Form>
      </Modal>

      {/* Category Creation Modal */}
      <Modal
        title="Add New Category"
        centered
        maskClosable={false}
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
        confirmLoading={createCategoryMutation.isPending}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
          initialValues={{accountType: selectedAccountType}}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{required: true, message: "Please enter category name"}]}
          >
            <Input placeholder="e.g., Utilities, Payroll, Sales" />
          </Form.Item>

          <Form.Item
            name="accountType"
            label="Account Type"
            rules={[{required: true, message: "Please select account type"}]}
          >
            <Select placeholder="Select account type">
              <Select.Option value="Asset">Asset</Select.Option>
              <Select.Option value="Liability">Liability</Select.Option>
              <Select.Option value="Equity">Equity</Select.Option>
              <Select.Option value="Income">Income</Select.Option>
              <Select.Option value="Expense">Expense</Select.Option>
            </Select>
          </Form.Item>

          {/* <Form.Item name="parent" label="Parent Category (Optional)">
            <Select
              placeholder="Select parent category"
              allowClear
              loading={categoriesLoading}
            >
              {categories?.data?.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name} ({category.accountType})
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Category description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChartOfAccountsModal;
