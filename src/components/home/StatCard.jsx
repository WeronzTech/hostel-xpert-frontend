import {GoArrowUpRight} from "../../icons/index.js";
import {Link} from "react-router-dom";

const StatCard = ({
  title = "",
  value = "",
  icon = null,
  color = "primary",
  link = "/",
}) => {
  const colorVariants = {
    primary: {
      bg: "#059669",
      text: "text-[#059669]",
      light: "bg-[#059669]/5",
      subtle: "text-[#059669]/60",
    },
    renters: {
      bg: "#2A6B8A",
      text: "text-[#2A6B8A]",
      light: "bg-[#2A6B8A]/5",
      subtle: "text-[#2A6B8A]/60",
    },
    maintenance: {
      bg: "#C17B4C",
      text: "text-[#C17B4C]",
      light: "bg-[#C17B4C]/5",
      subtle: "text-[#C17B4C]/60",
    },
    employees: {
      bg: "#9B6B9B",
      text: "text-[#9B6B9B]",
      light: "bg-[#9B6B9B]/5",
      subtle: "text-[#9B6B9B]/60",
    },
  };

  const colors = colorVariants[color] || colorVariants.primary;

  return (
    <Link
      to={link}
      className="relative p-6 bg-white rounded-[32px] transition-all duration-300 hover:shadow-md"
      style={{
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      {/* Navigate arrow - always visible */}
      <div className="absolute top-4 right-4">
        <GoArrowUpRight size={18} className="text-gray-400" />
      </div>

      <div className="relative flex items-center gap-5">
        {/* Cameo frame */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-sm opacity-35"
            style={{backgroundColor: colors.bg}}
          ></div>
          <div className="relative p-4 bg-white rounded-full shadow-sm border border-gray-100">
            <div className={`${colors.text} w-5 h-5`}>{icon}</div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatCard;
