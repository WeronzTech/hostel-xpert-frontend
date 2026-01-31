import {Button, Card, ConfigProvider, Form, Select, Typography} from "antd";
import {CloseOutlined} from "../../../icons";
import {redButton} from "../../../data/common/color";
import {useNavigate} from "react-router-dom";

export const RoomAssignmentStep = ({
  formData,
  sharingTypes,
  filteredRooms,
  handleSharingTypeChange,
  handleChange,
  handleReject,
  isRejoin,
}) => {
  const navigate = useNavigate();
  // Find the selected room to get its number
  const selectedRoom = filteredRooms.find(
    (room) => room._id === formData.roomId
  );
  console.log(filteredRooms);
  console.log(selectedRoom);
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={4} style={{margin: 0}}>
          Room Assignment
        </Typography.Title>
        {isRejoin ? (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => navigate(-1)}
          />
        ) : (
          <ConfigProvider theme={redButton}>
            <Button
              onClick={handleReject}
              type="primary"
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
          </ConfigProvider>
        )}
      </div>

      <Form layout="vertical">
        {/* Sharing Type Dropdown */}
        <Form.Item label="Sharing Type" style={{marginBottom: 16}}>
          <Select
            name="sharingType"
            value={formData.sharingType}
            onChange={(value) =>
              handleSharingTypeChange({target: {name: "sharingType", value}})
            }
            style={{width: "100%"}}
          >
            {sharingTypes.map((type) => (
              <Select.Option key={type} value={type}>
                {type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Room Selection Dropdown */}
        <Form.Item label="Available Rooms" style={{marginBottom: 16}}>
          <Select
            name="roomId"
            value={formData.roomId}
            onChange={(value) => {
              handleChange({
                target: {
                  name: "roomId",
                  value,
                },
              });
            }}
            optionLabelProp="label" // This will show the label prop in the selection box
            style={{width: "100%"}}
          >
            <Select.Option value="" label="Select a room">
              Select a room
            </Select.Option>
            {filteredRooms.map((room) => (
              <Select.Option
                key={room._id}
                value={room._id}
                label={room.roomNo} // This will be shown in the selection box
              >
                {`${room.roomNo}${
                  room.description ? ` (${room.description})` : ""
                } - ${room.vacantSlot} ${
                  room.vacantSlot === 1 ? "bed" : "beds"
                } available`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};
