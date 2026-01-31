import {Tag, Tooltip} from "antd";
import {
  FiMail,
  PhoneOutlined,
  HiOutlineBuildingOffice2,
  GoPeople,
  FiCalendar,
  ArrowRightOutlined,
  MdOutlineFoodBank,
} from "../../icons/index.js";
import {ActionButton} from "../../components/index.js";
import {indigoButton} from "../../data/common/color.js";
import {formatDate, formatLabel} from "../../utils/formatUtils.js";
import {useNavigate} from "react-router-dom";

export default function OnboardingCard({
  name,
  email,
  phone,
  accommodation,
  sharingType,
  date,
  residentId,
  type,
  isColiving,
}) {
  console.log(name, residentId);
  const navigate = useNavigate();

  const handleProcessOnboarding = (residentId) => {
    navigate(`/onboarding/${residentId}`);
    console.log("Processing onboarding for:", residentId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-3 w-full max-w-sm">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{name}</h2>

        <Tag
          color="processing"
          bordered={false}
          style={{borderRadius: "12px", padding: "0 10px"}}
        >
          {formatLabel(type)}
          {isColiving && " / Coliving"}
        </Tag>
      </div>

      {/* Accommodation info */}
      <div className="text-sm flex gap-6">
        {sharingType ? (
          <>
            <div className="flex items-center gap-1 min-w-0">
              <HiOutlineBuildingOffice2 className="text-gray-500 text-xl" />
              <span className="truncate max-w-[140px] text-gray-500">
                {accommodation}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <GoPeople className="text-gray-500 text-lg" />
              <span className="text-md text-gray-500">{sharingType}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 min-w-0">
            <MdOutlineFoodBank className="text-gray-400 text-2xl" />
            <span className="truncate max-w-[140px] text-gray-500">
              {accommodation}
            </span>
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="text-sm flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-1">
          <PhoneOutlined className="text-gray-400" />
          <span className="text-md text-gray-500">{phone}</span>
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <FiMail className="text-gray-500 text-lg mt-1" />
          <Tooltip title={email}>
            <span className="truncate max-w-[140px] text-gray-500">
              {email}
            </span>
          </Tooltip>
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(to right, white, gray, white)",
        }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar className="text-[#4d44b5] text-lg" />
          <span className="text-[#4d44b5] font-medium">{formatDate(date)}</span>
        </div>
        <ActionButton
          onClick={() => handleProcessOnboarding(residentId)}
          customTheme={indigoButton}
          icon={<ArrowRightOutlined />}
        >
          Process
        </ActionButton>
      </div>
    </div>
  );
}
