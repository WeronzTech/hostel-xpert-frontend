import {useEffect} from "react";
import {Modal, Form, Input, InputNumber, message} from "antd";
import {useSelector} from "react-redux";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addFloor, updateFloor} from "../../hooks/property/useProperty.js";

const {TextArea} = Input;

const FloorModal = ({
  visible,
  editingFloor,
  selectedProperty,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const {user} = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Reset form when modal opens or editingFloor changes
  useEffect(() => {
    if (visible && editingFloor) {
      form.setFieldsValue({
        floorName: editingFloor.floorName,
        floorNo: editingFloor.floorNo,
        roomCapacity: editingFloor.roomCapacity,
        description: editingFloor.description,
      });
    } else if (visible && !editingFloor) {
      form.resetFields();
    }
  }, [visible, editingFloor, form]);

  // Add Floor Mutation
  const addFloorMutation = useMutation({
    mutationFn: (floorData) => addFloor(floorData),
    onSuccess: (data) => {
      messageApi.success("Floor created successfully");
      // Invalidate and refetch floors query
      queryClient.invalidateQueries(["floors", selectedProperty?.id]);
      onSuccess();
    },
    onError: (error) => {
      console.error("Add floor error:", error);
      messageApi.error(error.message || "Failed to create floor");
    },
  });

  // Update Floor Mutation
  const updateFloorMutation = useMutation({
    mutationFn: ({data, floorId}) => updateFloor(data, floorId),
    onSuccess: (data) => {
      messageApi.success("Floor updated successfully");
      // Invalidate and refetch floors query
      queryClient.invalidateQueries(["floors", selectedProperty?.id]);
      onSuccess();
    },
    onError: (error) => {
      console.error("Update floor error:", error);
      messageApi.error(error.message || "Failed to update floor");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingFloor) {
        // Update existing floor
        const updateData = {
          floorName: values.floorName,
          floorNo: values.floorNo,
          roomCapacity: values.roomCapacity,
          description: values.description || "",
          adminName: user.name,
        };

        updateFloorMutation.mutate({
          data: updateData,
          floorId: editingFloor._id,
        });
      } else {
        // Create new floor
        const floorData = {
          floorName: values.floorName,
          floorNo: values.floorNo,
          roomCapacity: values.roomCapacity,
          description: values.description || "",
          propertyId: selectedProperty.id,
          adminName: user.name,
        };

        addFloorMutation.mutate(floorData);
      }
    } catch (errorInfo) {
      // Validation failed
      console.log("Validation failed:", errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const title = editingFloor
    ? `Edit Floor - ${editingFloor.floorName}`
    : `Add New Floor - ${selectedProperty?.name}`;

  const isLoading = addFloorMutation.isPending || updateFloorMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText={editingFloor ? "Update Floor" : "Create Floor"}
        cancelText="Cancel"
        confirmLoading={isLoading}
        maskClosable={!isLoading}
        closable={!isLoading}
      >
        <Form form={form} layout="vertical" name="floorForm">
          {/* Floor Name - Full Width */}
          <Form.Item
            name="floorName"
            label="Floor Name"
            rules={[{required: true, message: "Please enter floor name"}]}
          >
            <Input
              placeholder="e.g., Ground Floor, First Floor, etc."
              disabled={isLoading}
            />
          </Form.Item>

          {/* Floor Number - Full Width */}
          <Form.Item
            name="floorNo"
            label="Floor Number"
            rules={[{required: true, message: "Please enter floor number"}]}
          >
            <InputNumber
              min={0}
              style={{width: "100%"}}
              placeholder="e.g., 0, 1, 2"
              disabled={isLoading}
            />
          </Form.Item>

          {/* Total Rooms - Full Width */}
          <Form.Item
            name="roomCapacity"
            label="Total Rooms"
            rules={[
              {
                required: true,
                message: "Please enter total rooms",
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{width: "100%"}}
              placeholder="e.g., 10, 20, 30"
              disabled={isLoading}
            />
          </Form.Item>

          {/* Description - Full Width */}
          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Enter floor description (optional)..."
              maxLength={500}
              showCount
              disabled={isLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FloorModal;
