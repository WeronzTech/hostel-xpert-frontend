import {useEffect} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Form, Input, message, Modal, Select} from "antd";
import {getAllHeavensProperties} from "../../../hooks/property/useProperty.js"; // Assuming hooks are in this path
import {updateKitchen} from "../../../hooks/inventory/useInventory"; // You will need to create this hook

const EditKitchenModal = ({open, onClose, initialData}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const {data: propertiesData, isLoading: propertiesLoading} = useQuery({
    queryKey: ["all-properties"],
    queryFn: () => getAllHeavensProperties(),
    enabled: open, // Fetch only when the modal is open
  });

  // Effect to populate the form when initialData is available
  useEffect(() => {
    if (initialData) {
      // We need to transform the initialData to match what the Form Selects expect.
      // The 'incharge' and 'propertyId' fields expect IDs, not the full objects.
      const formattedData = {
        ...initialData,
        propertyId: initialData.propertyId?.map((p) => p._id), // Map the array to get just the _ids
      };
      form.setFieldsValue(formattedData);
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  // Mutation for updating an existing kitchen
  const EditKitchen = useMutation({
    mutationFn: (values) => updateKitchen({id: initialData._id, ...values}),
    onSuccess: () => {
      messageApi.success("Kitchen updated successfully!");
      // Invalidate queries to refetch the updated kitchen list
      queryClient.invalidateQueries({queryKey: ["kitchens"]});
      onClose(); // Close the modal on success
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to update kitchen.");
    },
  });

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Updated form values:", values);
        EditKitchen.mutate(values);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Kitchen"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={EditKitchen.isPending} // Use isPending for loading state
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="edit_kitchen_form"
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Kitchen Name"
            rules={[{required: true, message: "Please enter the kitchen name"}]}
          >
            <Input placeholder="e.g., Main Kitchen" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{required: true, message: "Please enter the location"}]}
          >
            <Input placeholder="e.g., Jigani" />
          </Form.Item>

          <Form.Item
            name="propertyId"
            label="Properties"
            rules={[
              {
                required: true,
                message: "Please select at least one property",
              },
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select one or more properties"
              loading={propertiesLoading}
            >
              {propertiesData?.map((property) => (
                <Select.Option key={property._id} value={property._id}>
                  {property.propertyName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditKitchenModal;
