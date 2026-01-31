import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Form, Input, message, Modal, Select} from "antd";
import {getAllHeavensProperties} from "../../../hooks/property/useProperty";
import {addKitchen} from "../../../hooks/inventory/useInventory.js";
import {getAllStaff} from "../../../hooks/staff/useStaff.js";

const AddKitchenModal = ({open, onClose}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  const {data: staffData, isLoading: staffLoading} = useQuery({
    queryKey: ["all-staff"],
    queryFn: () => getAllStaff(),
    enabled: open,
  });

  const {data: propertiesData, isLoading: propertiesLoading} = useQuery({
    queryKey: ["all-properties"],
    queryFn: () => getAllHeavensProperties(),
    enabled: open,
  });

  // Mutation for creating a new kitchen
  const AddKitchen = useMutation({
    mutationFn: (values) => addKitchen(values),
    onSuccess: () => {
      messageApi.success("Kitchen created successfully!");
      queryClient.invalidateQueries({queryKey: ["kitchens"]});
      onClose();
      form.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to create kitchen.");
    },
  });

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form values:", values);
        AddKitchen.mutate(values);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Create New Kitchen"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={AddKitchen.isLoading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="add_kitchen_form"
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
            name="incharge"
            label="Incharge"
            rules={[
              {required: true, message: "Please select an incharge person"},
            ]}
          >
            <Select placeholder="Select a staff member" loading={staffLoading}>
              {staffData?.map((staff) => (
                <Select.Option key={staff._id} value={staff._id}>
                  {staff.name}
                </Select.Option>
              ))}
            </Select>
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

export default AddKitchenModal;
