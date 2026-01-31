import {useState} from "react";
import {Modal, Checkbox, Divider, Button, message} from "antd";
import jsPDF from "jspdf";
import dayjs from "dayjs";

const DownloadOptionsModal = ({resident, visible, onCancel}) => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedSections(checkedValues);
  };

  const getOptions = () => {
    const options = [];
    if (!resident) return options;

    switch (resident.userType) {
      case "student":
        if (resident.parentsDetails)
          options.push({label: "Parent Details", value: "parentsDetails"});
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
    "Profile Image",
  ];

  const createPDF = async () => {
    if (!resident) {
      message.error("No resident data available");
      return;
    }

    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      // --- Header ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Resident Profile", 105, 20, {align: "center"});

      // Divider
      doc.setDrawColor(150);
      doc.line(15, 25, 195, 25);

      let yPos = 35;

      // --- Basic Information ---
      const basicInfo = [
        ["Name", resident.name || "-"],
        ["Contact", resident.contact || "-"],
        ["Email", resident.email || "-"],
        ["Gender", resident.personalDetails?.gender || "-"],
        [
          "DOB",
          resident.personalDetails?.dob
            ? dayjs(resident.personalDetails?.dob).format("DD MMM YYYY")
            : "-",
        ],
        ["Address", resident.personalDetails?.address || "-"],
      ];

      yPos = addSection(doc, "Personal Details", basicInfo, yPos);

      // Profile photo (if available)
      try {
        const img = resident.personalDetails?.profileImg;
        if (img) {
          doc.roundedRect(160, 30, 35, 40, 2, 2);
          doc.addImage(img, "JPEG", 161, 31, 33, 38);
        }
      } catch (e) {
        console.warn("Could not add profile image", e);
      }

      // --- Dynamic Sections ---
      const opts = getOptions();
      for (const opt of opts) {
        if (selectedSections.includes(opt.value)) {
          let sectionData = [];

          try {
            switch (opt.value) {
              case "parentsDetails":
                const pd = resident.parentsDetails || {};
                sectionData = [
                  ["Parent Name", pd.name || "-"],
                  ["Parent Email", pd.email || "-"],
                  ["Parent Contact", pd.contact || "-"],
                  ["Parent Occupation", pd.occupation || "-"],
                ];
                break;

              case "studyDetails":
                const sd = resident.studyDetails || {};
                sectionData = [
                  ["Course", sd.course || "-"],
                  ["Year of Study", sd.yearOfStudy || "-"],
                  ["Institution", sd.institution || "-"],
                ];
                break;

              case "stayDetails":
                const st = resident.stayDetails || {};
                if (resident.userType === "dailyRent") {
                  sectionData = [
                    ["Property Name", st.propertyName || "-"],
                    ["Room No", st.roomNumber || "-"],
                    ["Sharing Type", st.sharingType || "-"],
                    ["Daily Rent", st.dailyRent || "-"],
                    [
                      "Check In Date",
                      st.checkInDate
                        ? dayjs(st.checkInDate).format("DD MMM YYYY")
                        : "-",
                    ],
                    [
                      "Check Out Date",
                      st.extendDate
                        ? dayjs(st.extendDate).format("DD MMM YYYY")
                        : st.checkOutDate
                        ? dayjs(st.checkOutDate).format("DD MMM YYYY")
                        : "-",
                    ],
                  ];
                } else {
                  sectionData = [
                    ["Property Name", st.propertyName || "-"],
                    ["Room No", st.roomNumber || "-"],
                    ["Sharing Type", st.sharingType || "-"],
                    ["Monthly Rent", st.monthlyRent || "-"],
                    [
                      "Join Date",
                      st.joinDate
                        ? dayjs(st.joinDate).format("DD MMM YYYY")
                        : "-",
                    ],
                  ];
                }
                break;

              case "workingDetails":
                const wd = resident.workingDetails || {};
                sectionData = [
                  ["Job Title", wd.jobTitle || "-"],
                  ["Company Name", wd.companyName || "-"],
                  ["Location", wd.location || "-"],
                  ["Emergency Contact", wd.emergencyContact || "-"],
                ];
                break;

              case "messDetails":
                const md = resident.messDetails || {};
                sectionData = [
                  ["Kitchen Name", md.kitchenName || "-"],
                  ["Meal Type", md.mealType?.join(", ") || "-"],
                  ["Rent", md.rent || "-"],
                  [
                    "Mess Start Date",
                    md.messStartDate
                      ? dayjs(md.messStartDate).format("DD MMM YYYY")
                      : "-",
                  ],
                  [
                    "Mess End Date",
                    md.extendDate
                      ? dayjs(md.extendDate).format("DD MMM YYYY")
                      : md.messEndDate
                      ? dayjs(md.messEndDate).format("DD MMM YYYY")
                      : "-",
                  ],
                  ["Extended Days", md.extendedDays || "-"],
                ];
                break;

              default:
                break;
            }

            yPos = addSection(doc, opt.label, sectionData, yPos);
          } catch (sectionError) {
            console.error(
              `Error processing ${opt.label} section:`,
              sectionError
            );
          }
        }
      }

      // --- Footer ---
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Heavens Living", 105, 285, {align: "center"});

      doc.save(`${resident.name}_profile.pdf`);
      message.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  // Improved section adder with better page management
  const addSection = (doc, title, data, yPos) => {
    // Check if we need a new page (leave 30mm at bottom for footer)
    if (yPos + data.length * 8 + 30 > 297) {
      // A4 height is 297mm
      doc.addPage();
      yPos = 30;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, 20, yPos);
    doc.setDrawColor(200);
    doc.line(20, yPos + 2, 80, yPos + 2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    yPos += 10;
    data.forEach(([label, value]) => {
      // Check if we need a new page for this row
      if (yPos > 267) {
        // 297 - 30 (footer space)
        doc.addPage();
        yPos = 30;
      }

      doc.text(`${label}:`, 20, yPos);
      doc.text(value, 70, yPos);
      yPos += 8;
    });

    return yPos + 10; // Add extra space after section
  };

  const availableOptions = getOptions();

  return (
    <Modal
      title="Select Data to Include in PDF"
      visible={visible}
      onCancel={onCancel}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={createPDF}
          loading={loading}
          disabled={!resident}
        >
          Download
        </Button>,
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

export default DownloadOptionsModal;
