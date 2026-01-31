import {Modal, Descriptions, Image, Divider, Skeleton, Tag} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Function to format date and time
const formatDateTime = (dateStr) => dayjs(dateStr).format("DD-MM-YYYY hh:mm A");

// Convert minutes into "X hrs Y mins" format
const formatMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hrs = hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : "";
  const mins = minutes > 0 ? `${minutes} min${minutes > 1 ? "s" : ""}` : "";

  return [hrs, mins].filter(Boolean).join(" ");
};

const MaintenanceDetailModal = ({open, onClose, data, loading}) => {
  // Check if nested data exists
  const maintenance = data?.data;

  if (!maintenance) return null;

  console.log("Maintenance Detail modal", maintenance); // Debug log

  const {
    issue,
    reportedBy,
    userName,
    description,
    roomNo,
    status,
    reportedAt,
    issueImage,
    staffName,
    assignedAt,
    resolvedAt,
    timeNeeded,
  } = maintenance;

  return (
    <Modal
      centered
      open={open}
      title="Maintenance Details"
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {loading || !maintenance ? (
        <Skeleton active paragraph={{rows: 8}} />
      ) : (
        <>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Issuer Name">
              {userName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Room No.">{roomNo}</Descriptions.Item>
            <Descriptions.Item label="Issue">{issue}</Descriptions.Item>
            <Descriptions.Item label="Description">
              {description}
            </Descriptions.Item>
            <Descriptions.Item label="Reported At">
              {formatDateTime(reportedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Image">
              <Image.PreviewGroup>
                <Image
                  src={issueImage}
                  width={150}
                  style={{borderRadius: 4}}
                  alt="Issue"
                />
              </Image.PreviewGroup>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  status === "Pending"
                    ? "red"
                    : status === "Ongoing"
                    ? "gold"
                    : "green"
                }
                style={{fontWeight: "bold"}}
              >
                {status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Conditional Rendering Below Based on Status */}
          {(status === "Ongoing" || status === "Resolved") && <Divider />}

          {status === "Ongoing" && (
            <Descriptions
              column={1}
              bordered
              size="small"
              title="Assigned Info"
            >
              <Descriptions.Item label="Staff Assigned">
                {staffName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned At">
                {formatDateTime(assignedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Time Needed">
                {formatMinutes(timeNeeded) || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          )}

          {status === "Resolved" && (
            <Descriptions
              column={1}
              bordered
              size="small"
              title="Resolved Info"
            >
              <Descriptions.Item label="Resolved By">
                {staffName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Resolved At">
                {formatDateTime(resolvedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </>
      )}
    </Modal>
  );
};

export default MaintenanceDetailModal;
