// import {useState, useEffect} from "react";
// import {Modal, Form, Input, Select, Button, message} from "antd";

// import {FiX} from "react-icons/fi";
// import {
//   getAllHeavensProperties,
//   addRoom,
//   updateRooms,
//   getFloorsByPropertyId,
// } from "../../../hooks/property/useProperty.js";
// import {ActionButton} from "../../../components/index.js";
// import {purpleButton} from "../../../data/common/color.js";
// import { useSelector } from "react-redux";

// const {Option} = Select;
// const {TextArea} = Input;

// const RoomModal = ({
//   open,
//   onClose,
//   onSubmit,
//   mode,
//   roomData,
//   selectedProperty,
// }) => {
//   const [form] = Form.useForm();
//   const [properties, setProperties] = useState([]);
//   const [floors, setFloors] = useState([]);
//   const {user} = useSelector((state) => state.auth);
//   const [loadingProperties, setLoadingProperties] = useState(false);
//   const [loadingFloors, setLoadingFloors] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Initialize form when modal opens or data changes
//   useEffect(() => {
//     if (!open) return;

//     if (mode === "update" && roomData) {
//       form.setFieldsValue({
//         propertyName: roomData.propertyName || selectedProperty?.name || "",
//         propertyId: selectedProperty?.id || "",
//         floorId: roomData.floorId || "",
//         roomNo: roomData.roomNumber || "",
//         sharingType: roomData.sharingType || "",
//         roomCapacity: roomData.roomCapacity?.toString() || "",
//         status: roomData.status || "available",
//         description: roomData.description || "",
//       });
//     } else {
//       form.resetFields();
//       form.setFieldsValue({
//         propertyName: selectedProperty?.name || "",
//         propertyId: selectedProperty?.id || "",
//         status: "available",
//       });
//       setError(null);
//     }
//   }, [open, mode, roomData, selectedProperty, form]);

//   // Fetch properties if no specific property selected (Add mode only)
//   useEffect(() => {
//     if (open && !selectedProperty?.id && mode === "add") {
//       fetchProperties();
//     }
//   }, [open, selectedProperty, mode]);

//   // Fetch floors when selected property changes
//   useEffect(() => {
//     if (open && selectedProperty?.id) {
//       fetchFloorsByProperty(selectedProperty.id);
//     } else {
//       setFloors([]);
//     }
//   }, [open, selectedProperty?.id]);

//   const fetchProperties = async () => {
//     setLoadingProperties(true);
//     setError(null);
//     try {
//       const response = await getAllHeavensProperties();
//       setProperties(response);
//     } catch (err) {
//       setError("Failed to load properties. Please try again.");
//       message.error("Failed to load properties");
//     } finally {
//       setLoadingProperties(false);
//     }
//   };

//   const fetchFloorsByProperty = async (propertyId) => {
//     if (!propertyId) return;

//     setLoadingFloors(true);
//     try {
//       const response = await getFloorsByPropertyId(propertyId);
//       setFloors(response.data || []);
//     } catch (err) {
//       console.error("Failed to fetch floors:", err);
//       message.error("Failed to load floors");
//       setFloors([]);
//     } finally {
//       setLoadingFloors(false);
//     }
//   };

//   const handleSharingTypeChange = (e) => {
//     const value = e.target.value;
//     const numericValue = value.replace(/\D/g, "");
//     const formattedValue = numericValue ? `${numericValue} Sharing` : "";

//     form.setFieldsValue({
//       sharingType: formattedValue,
//       roomCapacity: numericValue || "",
//     });
//   };

//   const handlePropertyChange = (value) => {
//     const selectedProp = properties.find((p) => p.propertyName === value);
//     form.setFieldsValue({
//       propertyName: selectedProp?.propertyName || "",
//       propertyId: selectedProp?._id || "",
//       floorId: "", // Reset floor when property changes
//     });

//     // Fetch floors for the selected property
//     if (selectedProp?._id) {
//       fetchFloorsByProperty(selectedProp._id);
//     } else {
//       setFloors([]);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setSubmitLoading(true);
//       setError(null);

//       const values = await form.validateFields();

//       const cleanPropertyName = (values.propertyName || "").replace(
//         /^Heavens Living - /,
//         ""
//       );

//       const selectedPropertyName = (selectedProperty.name || "").replace(
//         /^Heavens Living - /,
//         ""
//       );

//       const roomPayload = {
//         propertyName: cleanPropertyName || selectedPropertyName,
//         propertyId: values.propertyId || selectedProperty.id,
//         floorId: values.floorId || "", // Add floorId to payload
//         roomNo: values.roomNo,
//         sharingType: values.sharingType,
//         roomCapacity: Number(values.roomCapacity),
//         status: values.status,
//         description: values.description || "",
//         adminName: user.name,
//       };
//       console.log("Room Payload:", roomPayload);

//       if (mode === "add") {
//         roomPayload.occupant = 0;
//         roomPayload.vacantSlot = Number(values.roomCapacity);
//         roomPayload.roomOccupants = [];
//         roomPayload.isHeavens = true;
//         await addRoom(roomPayload);
//         message.success("Room added successfully");
//       } else if (mode === "update") {
//         if (!roomData?._id) throw new Error("Missing room ID to update");
//         await updateRooms(roomData._id, roomPayload);
//         message.success("Room updated successfully");
//       }

//       if (onSubmit) onSubmit();
//       onClose();
//     } catch (err) {
//       setError(err.message || "Failed to save room data. Please check fields.");
//       message.error(err.message || "Failed to save room data");
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const title =
//     mode === "add"
//       ? selectedProperty?.id
//         ? `Add New Room to ${selectedProperty.name.replace(
//             "Heavens Living - ",
//             ""
//           )}`
//         : "Add New Room"
//       : "Update Room";

//   return (
//     <Modal
//       title={title}
//       open={open}
//       onCancel={() => {
//         onClose();
//         setError(null);
//       }}
//       footer={null}
//       width={500}
//       centered
//       closeIcon={<FiX size={20} />}
//       destroyOnClose
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSubmit}
//         initialValues={{
//           status: "available",
//         }}
//       >
//         {error && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//             {error}
//           </div>
//         )}

//         {/* Property selector if no selectedProperty (and in add mode) */}
//         {!selectedProperty?.id && mode === "add" && (
//           <>
//             <Form.Item
//               name="propertyName"
//               label="Select Property"
//               rules={[{required: true, message: "Please select a property"}]}
//             >
//               <Select
//                 placeholder="Select Property"
//                 onChange={handlePropertyChange}
//                 loading={loadingProperties}
//                 showSearch
//                 optionFilterProp="children"
//                 filterOption={(input, option) =>
//                   option.children.toLowerCase().indexOf(input.toLowerCase()) >=
//                   0
//                 }
//               >
//                 {properties.map((property) => (
//                   <Option key={property._id} value={property.propertyName}>
//                     {property.propertyName}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//             {/* Hidden field to ensure propertyId gets submitted */}
//             <Form.Item name="propertyId" hidden>
//               <Input type="hidden" />
//             </Form.Item>
//           </>
//         )}

//         {/* Floor selector - shown when property is selected and has floors */}
//         {(selectedProperty?.id || form.getFieldValue('propertyId')) && (
//           <Form.Item
//             name="floorId"
//             label="Select Floor"
//             rules={[{required: true, message: "Please select a floor"}]}
//           >
//             <Select
//               placeholder="Select Floor"
//               loading={loadingFloors}
//               showSearch
//               optionFilterProp="children"
//               filterOption={(input, option) =>
//                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//               }
//               notFoundContent={loadingFloors ? "Loading floors..." : "No floors found"}
//             >
//               {floors.map((floor) => (
//                 <Option key={floor._id} value={floor._id}>
//                   {floor.floorName} (Floor No: {floor.floorNo})
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Room Number */}
//           <Form.Item
//             name="roomNo"
//             label="Room Number"
//             rules={[{required: true, message: "Please enter room number"}]}
//           >
//             <Input placeholder="Enter Room Number" />
//           </Form.Item>

//           {/* Sharing Type */}
//           <Form.Item
//             name="sharingType"
//             label="Sharing Type"
//             rules={[{required: true, message: "Please enter sharing type"}]}
//           >
//             <Input
//               placeholder="Enter number (e.g., 2)"
//               onChange={handleSharingTypeChange}
//             />
//           </Form.Item>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Room Capacity */}
//           <Form.Item
//             name="roomCapacity"
//             label="Room Capacity"
//             rules={[{required: true, message: "Please enter room capacity"}]}
//           >
//             <Input readOnly type="number" min="1" placeholder="Room Capacity" />
//           </Form.Item>

//           {/* Status */}
//           <Form.Item
//             name="status"
//             label="Status"
//             rules={[{required: true, message: "Please select status"}]}
//           >
//             <Select>
//               <Option value="available">Available</Option>
//               <Option value="unavailable">Unavailable</Option>
//               <Option value="maintenance">Maintenance</Option>
//             </Select>
//           </Form.Item>
//         </div>

//         {/* Description */}
//         <Form.Item name="description" label="Room Description">
//           <TextArea
//             rows={3}
//             placeholder="Give a Description (optional)"
//             maxLength={200}
//             showCount
//           />
//         </Form.Item>

//         {/* Form Actions */}
//         <Form.Item className="mb-0">
//           <div
//             style={{display: "flex", justifyContent: "flex-end", gap: "8px"}}
//           >
//             <Button
//               onClick={() => {
//                 onClose();
//                 setError(null);
//               }}
//               disabled={submitLoading}
//             >
//               Cancel
//             </Button>

//             <ActionButton
//               customTheme={purpleButton}
//               htmlType="submit"
//               loading={submitLoading}
//               disabled={submitLoading}
//             >
//               {mode === "add" ? "Add Room" : "Update Room"}
//             </ActionButton>
//           </div>
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// export default RoomModal;
import {useState, useEffect} from "react";
import {Modal, Form, Input, Select, Button, message, Checkbox} from "antd";

import {FiX} from "react-icons/fi";
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
const {TextArea} = Input;

const RoomModal = ({
  open,
  onClose,
  onSubmit,
  mode,
  roomData,
  selectedProperty,
}) => {
  const [form] = Form.useForm();
  const [properties, setProperties] = useState([]);
  const [floors, setFloors] = useState([]);
  const {user} = useSelector((state) => state.auth);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isColiving, setIsColiving] = useState(false);
  console.log(roomData);
  // Initialize form when modal opens or data changes
  useEffect(() => {
    if (!open) return;

    if (mode === "update" && roomData) {
      const coliving = roomData.sharingType === "Coliving";
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
        description: roomData.description || "",
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

  // Fetch properties if no specific property selected (Add mode only)
  useEffect(() => {
    if (open && !selectedProperty?.id && mode === "add") {
      fetchProperties();
    }
  }, [open, selectedProperty, mode]);

  // Fetch floors when selected property changes
  useEffect(() => {
    if (open && selectedProperty?.id) {
      fetchFloorsByProperty(selectedProperty.id);
    } else {
      setFloors([]);
    }
  }, [open, selectedProperty?.id]);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    setError(null);
    try {
      const response = await getAllHeavensProperties();
      setProperties(response);
    } catch (err) {
      setError("Failed to load properties. Please try again.");
      message.error("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchFloorsByProperty = async (propertyId) => {
    if (!propertyId) return;

    setLoadingFloors(true);
    try {
      const response = await getFloorsByPropertyId(propertyId);
      setFloors(response.data || []);
    } catch (err) {
      console.error("Failed to fetch floors:", err);
      message.error("Failed to load floors");
      setFloors([]);
    } finally {
      setLoadingFloors(false);
    }
  };

  const handleColivingChange = (e) => {
    const checked = e.target.checked;
    setIsColiving(checked);

    if (checked) {
      // Set coliving values
      form.setFieldsValue({
        sharingType: "Coliving",
        roomCapacity: "2", // Coliving typically means 2 people
      });
    } else {
      // Reset to empty values
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
      floorId: "", // Reset floor when property changes
    });

    // Fetch floors for the selected property
    if (selectedProp?._id) {
      fetchFloorsByProperty(selectedProp._id);
    } else {
      setFloors([]);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);

      const values = await form.validateFields();

      const cleanPropertyName = (values.propertyName || "").replace(
        /^Heavens Living - /,
        ""
      );

      const selectedPropertyName = (selectedProperty.name || "").replace(
        /^Heavens Living - /,
        ""
      );

      const roomPayload = {
        propertyName: cleanPropertyName || selectedPropertyName,
        propertyId: values.propertyId || selectedProperty.id,
        floorId: values.floorId || "",
        roomNo: values.roomNo,
        sharingType: values.sharingType,
        roomCapacity: Number(values.roomCapacity),
        status: values.status,
        description: values.description || "",
        adminName: user.name,
        isColiving: isColiving, // Add coliving flag to payload
      };
      console.log("Room Payload:", roomPayload);

      if (mode === "add") {
        roomPayload.occupant = 0;
        roomPayload.vacantSlot = Number(values.roomCapacity);
        roomPayload.roomOccupants = [];
        roomPayload.isHeavens = true;
        await addRoom(roomPayload);
        message.success("Room added successfully");
      } else if (mode === "update") {
        if (!roomData?._id) throw new Error("Missing room ID to update");
        await updateRooms(roomData._id, roomPayload);
        message.success("Room updated successfully");
      }

      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save room data. Please check fields.");
      message.error(err.message || "Failed to save room data");
    } finally {
      setSubmitLoading(false);
    }
  };

  const title =
    mode === "add"
      ? selectedProperty?.id
        ? `Add New Room to ${selectedProperty.name.replace(
            "Heavens Living - ",
            ""
          )}`
        : "Add New Room"
      : "Update Room";

  return (
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
        {!selectedProperty?.id && mode === "add" && (
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
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {properties.map((property) => (
                  <Option key={property._id} value={property.propertyName}>
                    {property.propertyName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* Hidden field to ensure propertyId gets submitted */}
            <Form.Item name="propertyId" hidden>
              <Input type="hidden" />
            </Form.Item>
          </>
        )}

        {/* Floor selector - shown when property is selected and has floors */}
        {(selectedProperty?.id || form.getFieldValue("propertyId")) && (
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
        )}

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
                value="Coliving"
                readOnly
                placeholder="Coliving"
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

        {/* Description */}
        <Form.Item name="description" label="Room Description">
          <TextArea
            rows={3}
            placeholder="Give a Description (optional)"
            maxLength={200}
            showCount
          />
        </Form.Item>

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
              disabled={submitLoading}
            >
              Cancel
            </Button>

            <ActionButton
              customTheme={purpleButton}
              htmlType="submit"
              loading={submitLoading}
              disabled={submitLoading}
            >
              {mode === "add" ? "Add Room" : "Update Room"}
            </ActionButton>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomModal;
