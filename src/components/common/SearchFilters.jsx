// import {useState} from "react";
// import {Input, Select, DatePicker, Row, Col, Button} from "antd";
// import {IoFilter, FiSearch, FiCalendar} from "../../icons/index.js";
// import RegistrationModal from "../users/RegistrationModal.jsx";

// const {Option} = Select;

// const SearchFilters = ({
//   onSearch,
//   onStatusChange,
//   onJoinDateChange,
//   statuses = [
//     "All",
//     "Paid",
//     "Pending",
//     "On Leave",
//     "Incomplete Profile",
//     "Students",
//     "Workers",
//   ],
//   selectedStatus = "All",
//   selectedDate = null,
//   searchTerm = "", // Add this prop
//   rentType = "monthly",
// }) => {
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   // Show join date filter for monthly rent type
//   const showJoinDateFilter = rentType === "monthly";
//   // Show register button for mess or daily
//   const showRegistrationButton = rentType === "mess" || rentType === "daily";

//   const getFilteredStatuses = () => {
//     let filtered = [...statuses];
//     if (rentType === "daily" || rentType === "mess") {
//       filtered = filtered.filter((status) => status !== "On Leave");
//     }
//     return filtered;
//   };

//   const filteredStatuses = getFilteredStatuses();

//   const getDisplayLabel = (status) => {
//     if (rentType === "mess" && status === "Checked Out") return "Inactive";
//     return status;
//   };

//   const handleRegisterClick = () => setIsModalVisible(true);
//   const handleModalCancel = () => setIsModalVisible(false);

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <Row
//           gutter={[16, 16]}
//           justify="space-between"
//           align="middle"
//           wrap={true}
//         >
//           {/* Search Input */}
//           <Col xs={24} md={12} lg={10}>
//             <Input
//               placeholder="Search by name, contact, or room number..."
//               prefix={<FiSearch />}
//               onChange={(e) => onSearch(e.target.value)}
//               value={searchTerm} // Now this will work
//               allowClear
//               size="middle"
//             />
//           </Col>

//           {/* Filters */}
//           <Col xs={24} md={12} lg={14}>
//             <Row justify="end" gutter={[16, 16]} align="middle">
//               {/* Status Filter */}
//               <Col xs={24} sm={12} md={10} lg={8}>
//                 <Select
//                   value={selectedStatus}
//                   onChange={onStatusChange}
//                   suffixIcon={<IoFilter className="text-lg" />}
//                   style={{width: "100%"}}
//                   size="middle"
//                 >
//                   {filteredStatuses.map((status) => (
//                     <Option key={status} value={status}>
//                       {getDisplayLabel(status)}
//                     </Option>
//                   ))}
//                 </Select>
//               </Col>

//               {/* Join Date Filter */}
//               {showJoinDateFilter && (
//                 <Col xs={24} sm={12} md={10} lg={8}>
//                   <DatePicker
//                     placeholder="Join Date"
//                     onChange={(date) => onJoinDateChange(date)}
//                     value={selectedDate}
//                     allowClear
//                     format="DD/MM/YYYY"
//                     suffixIcon={<FiCalendar className="text-lg" />}
//                     style={{width: "100%"}}
//                     size="middle"
//                   />
//                 </Col>
//               )}

//               {/* Registration Button */}
//               {showRegistrationButton && (
//                 <Col xs={24} sm={12} md={8} lg={8}>
//                   <Button
//                     type="primary"
//                     style={{width: "100%"}}
//                     onClick={handleRegisterClick}
//                   >
//                     Register
//                   </Button>
//                 </Col>
//               )}
//             </Row>
//           </Col>
//         </Row>
//       </div>

//       {/* Registration Modal */}
//       <RegistrationModal
//         visible={isModalVisible}
//         onCancel={handleModalCancel}
//         rentType={rentType}
//       />
//     </>
//   );
// };

// export default SearchFilters;
import {useState} from "react";
import {Input, Select, DatePicker, Row, Col, Button} from "antd";
import {IoFilter, FiSearch, FiCalendar} from "../../icons/index.js";
import RegistrationModal from "../users/RegistrationModal.jsx";

const {Option} = Select;

const SearchFilters = ({
  onSearch,
  onStatusChange,
  onJoinDateChange,
  statuses = [
    "All",
    "Paid",
    "Pending",
    "On Leave",
    "Incomplete Profile",
    "Students",
    "Workers",
  ],
  selectedStatus = "All",
  selectedDate = null,
  searchTerm = "",
  rentType = "monthly",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showJoinDateFilter = rentType === "monthly";
  const showRegistrationButton = rentType === "mess" || rentType === "daily";

  const getFilteredStatuses = () => {
    let filtered = [...statuses];
    if (rentType === "daily" || rentType === "mess") {
      filtered = filtered.filter((status) => status !== "On Leave");
    }
    return filtered;
  };

  const filteredStatuses = getFilteredStatuses();

  const getDisplayLabel = (status) => {
    if (rentType === "mess" && status === "Checked Out") return "Inactive";
    return status;
  };

  const handleRegisterClick = () => setIsModalVisible(true);
  const handleModalCancel = () => setIsModalVisible(false);

  // Function to render options with separator
  const renderOptions = () => {
    const options = [];
    let hasAddedSeparator = false;

    filteredStatuses.forEach((status) => {
      // Add the regular option
      options.push(
        <Option key={status} value={status}>
          {getDisplayLabel(status)}
        </Option>
      );

      // Add separator after "Incomplete Profile" (only once)
      if (status === "Incomplete Profile" && !hasAddedSeparator) {
        options.push(
          <Option key="separator" disabled>
            <div
              style={{
                borderTop: "1px solid #d9d9d9",
                margin: "8px 0",
                height: "1px",
              }}
            />
          </Option>
        );
        hasAddedSeparator = true;
      }
    });

    return options;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <Row
          gutter={[16, 16]}
          justify="space-between"
          align="middle"
          wrap={true}
        >
          {/* Search Input */}
          <Col xs={24} md={12} lg={10}>
            <Input
              placeholder="Search by name, contact, or room number..."
              prefix={<FiSearch />}
              onChange={(e) => onSearch(e.target.value)}
              value={searchTerm}
              allowClear
              size="middle"
            />
          </Col>

          {/* Filters */}
          <Col xs={24} md={12} lg={14}>
            <Row justify="end" gutter={[16, 16]} align="middle">
              {/* Status Filter */}
              <Col xs={24} sm={12} md={10} lg={8}>
                <Select
                  value={selectedStatus}
                  onChange={onStatusChange}
                  suffixIcon={<IoFilter className="text-lg" />}
                  style={{width: "100%"}}
                  size="middle"
                >
                  {renderOptions()}
                </Select>
              </Col>

              {/* Join Date Filter */}
              {showJoinDateFilter && (
                <Col xs={24} sm={12} md={10} lg={8}>
                  <DatePicker
                    placeholder="Join Date"
                    onChange={(date) => onJoinDateChange(date)}
                    value={selectedDate}
                    allowClear
                    format="DD/MM/YYYY"
                    suffixIcon={<FiCalendar className="text-lg" />}
                    style={{width: "100%"}}
                    size="middle"
                  />
                </Col>
              )}

              {/* Registration Button */}
              {showRegistrationButton && (
                <Col xs={24} sm={12} md={8} lg={8}>
                  <Button
                    type="primary"
                    style={{width: "100%"}}
                    onClick={handleRegisterClick}
                  >
                    Register
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        rentType={rentType}
      />
    </>
  );
};

export default SearchFilters;
