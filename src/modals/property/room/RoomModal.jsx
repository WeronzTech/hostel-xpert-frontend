import {useState, useEffect} from "react";
import {Modal, Form, Input, Select, Button, message, Checkbox} from "antd";
import {FiX} from "react-icons/fi";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  getAllHeavensProperties,
  addRoom,
  updateRooms,
  getFloorsByPropertyId,
} from "../../../hooks/property/useProperty.js";
import {ActionButton} from "../../../components/index.js";
import {purpleButton} from "../../../data/common/color.js";
import {useSelector} from "react-redux";

const {Option} = Select;

const RoomModal = ({
  open,
  onClose,
  onSubmit,
  mode,
  roomData,
  selectedProperty,
}) => {
  const [form] = Form.useForm();
  const {user} = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isColiving, setIsColiving] = useState(false);

  // TanStack Query for fetching properties (only when needed)
  const {data: properties = [], isLoading: loadingProperties} = useQuery({
    queryKey: ["heavens-properties"],
    queryFn: getAllHeavensProperties,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      setError("Failed to load properties. Please try again.");
      message.error("Failed to load properties");
    },
  });

  // TanStack Query for fetching floors by property ID
  const {
    data: floorsData,
    isLoading: loadingFloors,
    refetch: refetchFloors,
  } = useQuery({
    queryKey: ["floors", roomData?.propertyId?._id],
    queryFn: () => getFloorsByPropertyId(roomData?.propertyId?._id),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      messageApi.error("Failed to load floors");
    },
  });

  const floors = floorsData?.data || floorsData || [];

  // TanStack Mutation for adding room
  const addRoomMutation = useMutation({
    mutationFn: addRoom,
    onSuccess: () => {
      messageApi.success("Room added successfully");
      queryClient.invalidateQueries(["rooms", selectedProperty?.id]);
      if (onSubmit) onSubmit();
      onClose();
    },
    onError: (err) => {
      setError(err.message || "Failed to save room data. Please check fields.");
      messageApi.error(err.message || "Failed to save room data");
    },
    onSettled: () => {
      setSubmitLoading(false);
    },
  });

  // TanStack Mutation for updating room
  const updateRoomMutation = useMutation({
    mutationFn: ({roomId, updatedData}) => updateRooms(roomId, updatedData),
    onSuccess: () => {
      messageApi.success("Room updated successfully");
      queryClient.invalidateQueries(["rooms", selectedProperty?.id]);
      if (onSubmit) onSubmit();
      onClose();
    },
    onError: (err) => {
      setError(
        err.message || "Failed to update room data. Please check fields.",
      );
      messageApi.error(err.message || "Failed to update room data");
    },
    onSettled: () => {
      setSubmitLoading(false);
    },
  });

  // Initialize form when modal opens or data changes
  useEffect(() => {
    if (!open) return;

    if (mode === "update" && roomData) {
      const coliving = roomData.sharingType === "Co-Living";
      setIsColiving(coliving);

      form.setFieldsValue({
        propertyName: roomData.propertyName || selectedProperty?.name || "",
        propertyId: selectedProperty?.id || "",
        floorId: roomData.floorId || "",
        floorName: roomData.floorName || "",
        roomNo: roomData.roomNumber || "",
        sharingType: roomData.sharingType || "",
        roomCapacity: roomData.roomCapacity?.toString() || "",
        status: roomData.status || "available",
        isColiving: coliving,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        propertyName: selectedProperty?.name || "",
        propertyId: selectedProperty?.id || "",
        status: "available",
        isColiving: false,
      });
      setIsColiving(false);
      setError(null);
    }
  }, [open, mode, roomData, selectedProperty, form]);

  // Refetch floors when property changes
  useEffect(() => {
    if (open && (selectedProperty?.id || form.getFieldValue("propertyId"))) {
      refetchFloors();
    }
  }, [
    open,
    selectedProperty?.id,
    form.getFieldValue("propertyId"),
    refetchFloors,
  ]);

  const handleColivingChange = (e) => {
    const checked = e.target.checked;
    setIsColiving(checked);

    if (checked) {
      form.setFieldsValue({
        sharingType: "Co-Living",
        roomCapacity: "2",
      });
    } else {
      form.setFieldsValue({
        sharingType: "",
        roomCapacity: "",
      });
    }
  };

  const handleSharingTypeChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = numericValue ? `${numericValue} Sharing` : "";

    form.setFieldsValue({
      sharingType: formattedValue,
      roomCapacity: numericValue || "",
    });
  };

  const handlePropertyChange = (value) => {
    const selectedProp = properties.find((p) => p.propertyName === value);
    form.setFieldsValue({
      propertyName: selectedProp?.propertyName || "",
      propertyId: selectedProp?._id || "",
      floorId: "",
    });

    // Refetch floors for the selected property
    if (selectedProp?._id) {
      refetchFloors();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);

      const values = await form.validateFields();

      const cleanPropertyName = (values.propertyName || "").replace(
        /^Heavens Living - /,
        "",
      );

      const selectedPropertyName = (selectedProperty?.name || "").replace(
        /^Heavens Living - /,
        "",
      );

      const roomPayload = {
        propertyName: cleanPropertyName || selectedPropertyName,
        propertyId: values.propertyId || selectedProperty?.id,
        floorId: values.floorId || "",
        roomNo: values.roomNo,
        sharingType: values.sharingType,
        roomCapacity: Number(values.roomCapacity),
        status: values.status,
        adminName: user.name,
        isColiving: isColiving,
      };

      if (mode === "add") {
        roomPayload.occupant = 0;
        roomPayload.vacantSlot = Number(values.roomCapacity);
        roomPayload.roomOccupants = [];
        roomPayload.isHeavens = true;
        addRoomMutation.mutate(roomPayload);
      } else if (mode === "update") {
        if (!roomData?._id) throw new Error("Missing room ID to update");
        updateRoomMutation.mutate({
          roomId: roomData._id,
          updatedData: roomPayload,
        });
      }
    } catch (err) {
      if (err.errorFields) {
        // Form validation error
        return;
      }
      setError(err.message || "Failed to save room data. Please check fields.");
      messageApi.error(err.message || "Failed to save room data");
      setSubmitLoading(false);
    }
  };

  const title =
    mode === "add"
      ? selectedProperty?.id
        ? `Add New Room to ${selectedProperty.name.replace(`${user.companyName} - `, "")}`
        : "Add New Room"
      : `Update Room in - ${roomData?.propertyId?.propertyName}`;

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={open}
        onCancel={() => {
          onClose();
          setError(null);
        }}
        footer={null}
        width={500}
        centered
        closeIcon={<FiX size={20} />}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "available",
            isColiving: false,
          }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Property selector if no selectedProperty (and in add mode) */}
          {mode === "add" && !selectedProperty?.id && (
            <>
              <Form.Item
                name="propertyName"
                label="Select Property"
                rules={[{required: true, message: "Please select a property"}]}
              >
                <Select
                  placeholder="Select Property"
                  onChange={handlePropertyChange}
                  loading={loadingProperties}
                  showSearch
                  optionFilterProp="children"
                >
                  {properties.map((property) => (
                    <Option key={property._id} value={property.propertyName}>
                      {property.propertyName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="propertyId" hidden>
                <Input type="hidden" />
              </Form.Item>
            </>
          )}

          {/* Floor selector - shown when property is selected and has floors */}
          <Form.Item
            name="floorId"
            label="Select Floor"
            rules={[{required: true, message: "Please select a floor"}]}
          >
            <Select
              placeholder="Select Floor"
              loading={loadingFloors}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={
                loadingFloors ? "Loading floors..." : "No floors found"
              }
            >
              {floors.map((floor) => (
                <Option key={floor._id} value={floor._id}>
                  {floor.floorName} (Floor No: {floor.floorNo})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Number */}
            <Form.Item
              name="roomNo"
              label="Room Number"
              rules={[{required: true, message: "Please enter room number"}]}
            >
              <Input placeholder="Enter Room Number" />
            </Form.Item>

            {/* Coliving Checkbox */}
            <Form.Item
              name="isColiving"
              label="Room Type"
              valuePropName="checked"
              className="mb-0"
            >
              <Checkbox onChange={handleColivingChange}>Coliving Room</Checkbox>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sharing Type - Conditionally rendered based on coliving selection */}
            {isColiving ? (
              <Form.Item name="sharingType" label="Sharing Type">
                <Input
                  value="Co-Living"
                  readOnly
                  placeholder="Co-Living"
                  className="bg-gray-100"
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="sharingType"
                label="Sharing Type"
                rules={[{required: true, message: "Please enter sharing type"}]}
              >
                <Input
                  placeholder="Enter number (e.g., 2)"
                  onChange={handleSharingTypeChange}
                />
              </Form.Item>
            )}

            {/* Room Capacity */}
            <Form.Item
              name="roomCapacity"
              label="Room Capacity"
              rules={[{required: true, message: "Please enter room capacity"}]}
            >
              <Input
                type="number"
                min="1"
                placeholder="Room Capacity"
                readOnly={isColiving}
                className={isColiving ? "bg-gray-100" : ""}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <Form.Item
              name="status"
              label="Status"
              rules={[{required: true, message: "Please select status"}]}
            >
              <Select>
                <Option value="available">Available</Option>
                <Option value="unavailable">Unavailable</Option>
                <Option value="maintenance">Maintenance</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Form Actions */}
          <Form.Item className="mb-0">
            <div
              style={{display: "flex", justifyContent: "flex-end", gap: "8px"}}
            >
              <Button
                onClick={() => {
                  onClose();
                  setError(null);
                }}
                disabled={
                  submitLoading ||
                  addRoomMutation.isPending ||
                  updateRoomMutation.isPending
                }
              >
                Cancel
              </Button>

              <ActionButton
                customTheme={purpleButton}
                htmlType="submit"
                loading={
                  submitLoading ||
                  addRoomMutation.isPending ||
                  updateRoomMutation.isPending
                }
                disabled={
                  submitLoading ||
                  addRoomMutation.isPending ||
                  updateRoomMutation.isPending
                }
              >
                {mode === "add" ? "Add Room" : "Update Room"}
              </ActionButton>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoomModal;
