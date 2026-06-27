import {useEffect} from "react";
import {Modal, Form, Input, Select, message} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createBed, updateBed} from "../../../hooks/property/useProperty.js";

const {Option} = Select;

const BedModal = ({
  open,
  editingBed,
  selectedPropertyId,
  selectedFloorId,
  selectedRoomId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && editingBed) {
      form.setFieldsValue({
        name: editingBed.name,
        status: editingBed.status || "Active",
      });
    } else if (open && !editingBed) {
      form.resetFields();
      form.setFieldsValue({
        status: "Active",
      });
    }
  }, [open, editingBed, form]);

  const addBedMutation = useMutation({
    mutationFn: (bedData) => createBed(bedData),
    onSuccess: () => {
      messageApi.success("Bed created successfully");
      queryClient.invalidateQueries(["beds", selectedRoomId]);
      onSuccess();
    },
    onError: (error) => {
      console.error("Add bed error:", error);
      messageApi.error(error.message || "Failed to create bed");
    },
  });

  const updateBedMutation = useMutation({
    mutationFn: ({bedData, bedId}) => updateBed(bedData, bedId),
    onSuccess: () => {
      messageApi.success("Bed updated successfully");
      queryClient.invalidateQueries(["beds", selectedRoomId]);
      onSuccess();
    },
    onError: (error) => {
      console.error("Update bed error:", error);
      messageApi.error(error.message || "Failed to update bed");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingBed) {
        updateBedMutation.mutate({
          bedData: {
            name: values.name,
            status: values.status,
          },
          bedId: editingBed._id,
        });
      } else {
        addBedMutation.mutate({
          name: values.name,
          propertyId: selectedPropertyId,
          floorId: selectedFloorId,
          roomId: selectedRoomId,
          status: values.status,
        });
      }
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const title = editingBed
    ? `Edit Bed - ${editingBed.name}`
    : "Add New Bed";

  const isLoading = addBedMutation.isPending || updateBedMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={500}
        okText={editingBed ? "Update Bed" : "Create Bed"}
        cancelText="Cancel"
        confirmLoading={isLoading}
        maskClosable={!isLoading}
        closable={!isLoading}
      >
        <Form form={form} layout="vertical" name="bedForm" style={{marginTop: 16}}>
          <Form.Item
            name="name"
            label="Bed Name / Number"
            rules={[
              {required: true, message: "Please enter bed name or number"},
              {whitespace: true, message: "Bed name cannot be empty spaces"},
            ]}
          >
            <Input placeholder="e.g. Bed A, Bed 1, Bed 102-A" disabled={isLoading} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{required: true, message: "Please select status"}]}
          >
            <Select disabled={isLoading}>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BedModal;
