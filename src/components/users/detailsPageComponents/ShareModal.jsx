import {useState} from "react";
import {Modal, Checkbox, Divider, Button, Dropdown, Menu, message} from "antd";
import {FiShare2, FiMail, FiCopy} from "react-icons/fi";
import {FaWhatsapp} from "react-icons/fa";

const ShareModal = ({resident, visible, onCancel}) => {
  const [selectedSections, setSelectedSections] = useState([]);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedSections(checkedValues);
  };

  // Build dynamic options based on userType
  const getOptions = () => {
    const options = [];
    if (!resident) return options;

    switch (resident.userType) {
      case "student":
        if (resident.parentsDetails)
          options.push({label: "Parents Details", value: "parentsDetails"});
        if (resident.studyDetails)
          options.push({label: "Study Details", value: "studyDetails"});
        if (resident.stayDetails)
          options.push({label: "Stay Details", value: "stayDetails"});
        break;
      case "worker":
        if (resident.workingDetails)
          options.push({label: "Working Details", value: "workingDetails"});
        if (resident.stayDetails)
          options.push({label: "Stay Details", value: "stayDetails"});
        break;
      case "dailyRent":
        if (resident.stayDetails)
          options.push({label: "Stay Details", value: "stayDetails"});
        break;
      case "messOnly":
        if (resident.messDetails)
          options.push({label: "Mess Details", value: "messDetails"});
        break;
      default:
        break;
    }

    return options;
  };

  const mandatoryFields = [
    "Name",
    "Contact",
    "Email",
    "Gender",
    "DOB",
    "Address",
  ];

  const generateWhatsAppMessage = () => {
    let message = `*Resident Details - ${resident.name || "N/A"}*\n\n`;

    // Basic Info
    message += `*Basic Information:*\n`;
    message += `• Name: ${resident.name || "N/A"}\n`;
    message += `• Contact: ${resident.contact || "N/A"}\n`;
    message += `• Email: ${resident.email || "N/A"}\n`;
    message += `• Gender: ${resident.personalDetails?.gender || "N/A"}\n`;
    message += `• DOB: ${
      resident.personalDetails?.dob
        ? new Date(resident.personalDetails.dob).toLocaleDateString()
        : "N/A"
    }\n`;
    message += `• Address: ${resident.personalDetails?.address || "N/A"}\n\n`;

    // Selected Sections
    const opts = getOptions();
    for (const opt of opts) {
      if (selectedSections.includes(opt.value)) {
        message += `*${opt.label}:*\n`;

        switch (opt.value) {
          case "parentsDetails":
            const pd = resident.parentsDetails || {};
            message += `• Parent Name: ${pd.name || "N/A"}\n`;
            message += `• Parent Email: ${pd.email || "N/A"}\n`;
            message += `• Parent Contact: ${pd.contact || "N/A"}\n`;
            message += `• Parent Occupation: ${pd.occupation || "N/A"}\n`;
            break;

          case "studyDetails":
            const sd = resident.studyDetails || {};
            message += `• Course: ${sd.course || "N/A"}\n`;
            message += `• Year of Study: ${sd.yearOfStudy || "N/A"}\n`;
            message += `• Institution: ${sd.institution || "N/A"}\n`;
            break;

          case "stayDetails":
            const st = resident.stayDetails || {};
            message += `• Property Name: ${st.propertyName || "N/A"}\n`;
            message += `• Room No.: ${st.roomNumber || "N/A"}\n`;
            message += `• Sharing Type: ${st.sharingType || "N/A"}\n`;

            if (resident.userType === "dailyRent") {
              message += `• Daily Rent: ${st.dailyRent || "N/A"}\n`;
              message += `• Check In Date: ${
                st.checkInDate
                  ? new Date(st.checkInDate).toLocaleDateString()
                  : "N/A"
              }\n`;
              message += `• Check Out Date: ${
                st.extendDate
                  ? new Date(st.extendDate).toLocaleDateString()
                  : st.checkOutDate
                  ? new Date(st.checkOutDate).toLocaleDateString()
                  : "N/A"
              }\n`;
            } else {
              message += `• Monthly Rent: ${st.monthlyRent || "N/A"}\n`;
              message += `• Join Date: ${
                st.joinDate ? new Date(st.joinDate).toLocaleDateString() : "N/A"
              }\n`;
            }
            break;

          case "workingDetails":
            const wd = resident.workingDetails || {};
            message += `• Job Title: ${wd.jobTitle || "N/A"}\n`;
            message += `• Company Name: ${wd.companyName || "N/A"}\n`;
            message += `• Location: ${wd.location || "N/A"}\n`;
            message += `• Emergency Contact: ${wd.emergencyContact || "N/A"}\n`;
            break;

          case "messDetails":
            const md = resident.messDetails || {};
            message += `• Kitchen Name: ${md.kitchenName || "N/A"}\n`;
            message += `• Meal Type: ${md.mealType?.join(", ") || "N/A"}\n`;
            message += `• Rent: ${md.rent || "N/A"}\n`;
            message += `• Mess Start Date: ${
              md.messStartDate
                ? new Date(md.messStartDate).toLocaleDateString()
                : "N/A"
            }\n`;
            message += `• Mess End Date: ${
              md.extendDate
                ? new Date(md.extendDate).toLocaleDateString()
                : md.messEndDate
                ? new Date(md.messEndDate).toLocaleDateString()
                : "N/A"
            }\n`;
            message += `• Extended Days: ${md.extendedDays || "N/A"}\n`;
            break;

          default:
            break;
        }
        message += `\n`;
      }
    }

    return encodeURIComponent(message.trim());
  };

  const handleShare = (method) => {
    const message = generateWhatsAppMessage();

    switch (method) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${message}`, "_blank");
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(
          `${resident.name}'s Details`
        )}&body=${message}`;
        break;
      case "clipboard":
        navigator.clipboard
          .writeText(decodeURIComponent(message))
          .then(() => message.success("Copied to clipboard!"))
          .catch(() => message.error("Failed to copy"));
        break;
      default:
        break;
    }
  };

  const shareMenu = (
    <Menu onClick={({key}) => handleShare(key)}>
      <Menu.Item
        key="whatsapp"
        icon={<FaWhatsapp className="text-green-500" />}
      >
        WhatsApp
      </Menu.Item>
    </Menu>
  );

  const availableOptions = getOptions();

  return (
    <Modal
      title="Share Resident Details"
      visible={visible}
      onCancel={onCancel}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Dropdown overlay={shareMenu} placement="topCenter" key="share">
          <Button type="primary" icon={<FiShare2 />}>
            Share Options
          </Button>
        </Dropdown>,
      ]}
    >
      <h4>Basic Information (Always Included)</h4>
      <Checkbox.Group value={mandatoryFields} disabled>
        {mandatoryFields.map((field) => (
          <Checkbox key={field} value={field}>
            {field}
          </Checkbox>
        ))}
      </Checkbox.Group>

      {availableOptions.length > 0 && (
        <>
          <Divider />
          <h4>Additional Sections</h4>
          <Checkbox.Group
            style={{display: "flex", flexDirection: "column"}}
            onChange={handleCheckboxChange}
            value={selectedSections}
          >
            {availableOptions.map((opt) => (
              <Checkbox key={opt.value} value={opt.value}>
                {opt.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </>
      )}
    </Modal>
  );
};

export default ShareModal;
