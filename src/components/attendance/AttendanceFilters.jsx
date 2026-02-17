import {Row, Col, Input, Select, DatePicker, Button} from "antd";
import {FiSearch} from "react-icons/fi";
import {FilterOutlined} from "@ant-design/icons";

const {Option} = Select;
const PRIMARY_COLOR = "#059669";

const AttendanceFilters = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedDate,
  roomsData,
  onDateChange,
  selectedRoomId,
  onRoomChange,
  onBulkMark,
  isBulkLoading,
}) => {
  const handleBulkMark = () => {
    if (selectedRoomId) {
      const selectedRoom = roomsData?.data?.find(
        (room) => room._id === selectedRoomId,
      );
      onBulkMark("Present", selectedRoomId, selectedRoom?.roomNumber);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <Row gutter={[16, 16]}>
        {/* Row 1: Search - Full width on mobile */}
        <Col xs={24} md={6}>
          <Input
            placeholder="Search student..."
            prefix={<FiSearch />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>

        {/* Desktop view - All filters in one row (hidden on mobile) */}
        <Col xs={0} md={18}>
          <Row gutter={[16, 16]} justify="end" align="middle">
            {/* Room Filter */}
            <Col md={5}>
              <Select
                value={selectedRoomId}
                onChange={onRoomChange}
                style={{width: "100%"}}
                placeholder="Search Room"
                allowClear
                showSearch
                optionFilterProp="children"
                suffixIcon={<FilterOutlined />}
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                disabled={isBulkLoading}
              >
                {roomsData?.data?.map((room) => (
                  <Option key={room._id} value={room._id}>
                    Room {room.roomNumber} ({room.totalStudents} students)
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Status Filter */}
            <Col md={5}>
              <Select
                value={statusFilter}
                onChange={onStatusChange}
                style={{width: "100%"}}
                placeholder="Filter by status"
                suffixIcon={<FilterOutlined />}
                disabled={isBulkLoading}
              >
                <Option value="all">All Status</Option>
                <Option value="Present">Present</Option>
                <Option value="Absent">Absent</Option>
                <Option value="Late">Late</Option>
              </Select>
            </Col>

            {/* Date Picker */}
            <Col md={5}>
              <DatePicker
                value={selectedDate}
                onChange={onDateChange}
                format="YYYY-MM-DD"
                style={{width: "100%"}}
                placeholder="Select Date"
                disabled={isBulkLoading}
              />
            </Col>

            {/* Button - Desktop */}
            {selectedRoomId && (
              <Col md={7}>
                <Button
                  type="primary"
                  block
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                  }}
                  onClick={handleBulkMark}
                  loading={isBulkLoading}
                  disabled={isBulkLoading}
                >
                  {isBulkLoading
                    ? "Marking..."
                    : (() => {
                        const selectedRoom = roomsData?.data?.find(
                          (room) => room._id === selectedRoomId,
                        );
                        return `Mark Present (Room ${selectedRoom?.roomNumber || ""})`;
                      })()}
                </Button>
              </Col>
            )}
          </Row>
        </Col>

        {/* Mobile view - Responsive layout */}
        <Col xs={24} md={0}>
          {/* Row 2: Room and Status filters side by side */}
          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Select
                value={selectedRoomId}
                onChange={onRoomChange}
                style={{width: "100%"}}
                placeholder="Search Room"
                allowClear
                showSearch
                optionFilterProp="children"
                suffixIcon={<FilterOutlined />}
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                disabled={isBulkLoading}
                size="large"
              >
                {roomsData?.data?.map((room) => (
                  <Option key={room._id} value={room._id}>
                    Room {room.roomNumber} ({room.totalStudents})
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12}>
              <Select
                value={statusFilter}
                onChange={onStatusChange}
                style={{width: "100%"}}
                placeholder="Status"
                suffixIcon={<FilterOutlined />}
                disabled={isBulkLoading}
                size="large"
              >
                <Option value="all">All</Option>
                <Option value="Present">Present</Option>
                <Option value="Absent">Absent</Option>
                <Option value="Late">Late</Option>
              </Select>
            </Col>
          </Row>

          {/* Row 3: Date Picker - Full width */}
          <Row gutter={[16, 16]} style={{marginTop: 16}}>
            <Col xs={24}>
              <DatePicker
                value={selectedDate}
                onChange={onDateChange}
                format="YYYY-MM-DD"
                style={{width: "100%"}}
                placeholder="Select Date"
                disabled={isBulkLoading}
                size="large"
              />
            </Col>
          </Row>

          {/* Row 4: Button - Full width (only when room selected) */}
          {selectedRoomId && (
            <Row gutter={[16, 16]} style={{marginTop: 16}}>
              <Col xs={24}>
                <Button
                  type="primary"
                  block
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                  onClick={handleBulkMark}
                  loading={isBulkLoading}
                  disabled={isBulkLoading}
                  size="large"
                >
                  {isBulkLoading
                    ? "Marking..."
                    : (() => {
                        const selectedRoom = roomsData?.data?.find(
                          (room) => room._id === selectedRoomId,
                        );
                        return `Mark Present - Room ${selectedRoom?.roomNumber || ""} (${selectedRoom?.totalStudents || 0} students)`;
                      })()}
                </Button>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceFilters;
