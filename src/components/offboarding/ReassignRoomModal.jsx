import { Modal, Form, Select, Input, Button, Space, Typography, Alert } from "antd";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../utils/apiClient";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner";

const { TextArea } = Input;
const { Text } = Typography;

const ReassignRoomModal = ({ open, onClose, onSubmit, request }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const propertyId = request?.propertyId;
  const gender = request?.gender;
  const sharingType = request?.sharingType;
  const currentRoomId = request?.currentRoomId;

  // Fetch available rooms
  const { data: rooms, isLoading, isError, refetch } = useQuery({
    queryKey: ["availableForChange", propertyId, sharingType, gender, currentRoomId],
    queryFn: async () => {
      if (!propertyId || !sharingType) return [];
      const response = await apiClient.get("/property/room/availableForChange", {
        params: { propertyId, sharingType, gender, currentRoomId },
      });
      return response.data || [];
    },
    enabled: open && !!propertyId && !!sharingType,
  });

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit({
        status: "reassigned",
        comment: values.comment,
        reassignedRoomId: values.roomId,
      });
      onClose();
    } catch (error) {
      console.error("Error during reassignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Reassign Resident to Another Room"
      open={open}
      onClose={onClose}
      onCancel={onClose}
      centered
      footer={null}
    >
      <div className="py-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <div className="text-center py-4">
            <Alert
              message="Error loading rooms"
              description="Could not load available rooms for this sharing type. Please try again."
              type="error"
              showIcon
            />
            <Button onClick={refetch} className="mt-4">
              Retry
            </Button>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <Alert
            message="No Available Rooms"
            description={`No available rooms with vacant slots were found for sharing type: "${sharingType}" in this property.`}
            type="warning"
            showIcon
            className="mb-4"
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="roomId"
              label="Select Room"
              rules={[{ required: true, message: "Please select a room to assign" }]}
            >
              <Select placeholder="Select a vacant room">
                {rooms.map((room) => (
                  <Select.Option key={room._id} value={room._id}>
                    Room {room.roomNo} ({room.vacantSlot} slot{room.vacantSlot !== 1 ? "s" : ""} vacant)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="comment" label="Remarks">
              <TextArea rows={3} placeholder="Add comments or justification for reassignment" />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Confirm Reassign
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default ReassignRoomModal;
