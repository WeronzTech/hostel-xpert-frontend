import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Form, Input, message, Modal, Select} from "antd";
import { useSelector } from "react-redux";
import { getKitchens, addCategory } from "../../../hooks/inventory/useInventory";

const {Option} = Select;

const AddCategoryModal = ({open, onClose}) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const { data: kitchens, isLoading: kitchensLoading } = useQuery({
    queryKey: ["kitchens", selectedPropertyId],
    queryFn: () => getKitchens({ propertyId: selectedPropertyId }),
    enabled: open,
  });

  const AddCategory = useMutation({
    mutationKey: ["add-category"],
    mutationFn: (categoryData) => addCategory(categoryData),
    onSuccess: (data) => {
      messageApi.success(data.message || "Category created successfully!");
      queryClient.invalidateQueries({queryKey: ["categories"]});
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      messageApi.error(error.message);
    },
  });

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="Add New Category"
        onCancel={onClose}
        confirmLoading={AddCategory.isLoading}
        onOk={() => AddCategory.mutate({ ...form.getFieldsValue(), propertyId: selectedPropertyId })}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="add_category_form">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              {required: true, message: "Please enter the category name!"},
            ]}
          >
            <Input placeholder="e.g., Vegetables" />
          </Form.Item>
          <Form.Item
            name="kitchenId"
            label="Kitchen"
            rules={[{required: true, message: "Please select a kitchen!"}]}
          >
            <Select placeholder="Select a kitchen" loading={kitchensLoading}>
              {kitchens?.map((kitchen) => (
                <Option key={kitchen._id} value={kitchen._id}>
                  {kitchen.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddCategoryModal;
